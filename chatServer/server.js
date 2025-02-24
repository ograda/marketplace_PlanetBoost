require("dotenv").config();
const { Client, GatewayIntentBits, Partials, ChannelType } = require("discord.js");
const { Server } = require("socket.io");
const http = require("http");

// Create an HTTP server
const server = http.createServer();

// Create a Socket.io server with CORS settings
const io = new Server(server, { cors: { origin: "*" } });

// Initialize the Discord bot client (discord.js v14)
const discordClient = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent  // add this line!
  ],
  partials: [Partials.Channel],
});

// Log in to Discord using the token from .env
discordClient.login(process.env.DISCORD_TOKEN);

discordClient.once("ready", () => {
  console.log(`Discord bot logged in as ${discordClient.user.tag}`);
});

// Mapping to store client socket IDs to temporary Discord channel IDs and their timeouts
const clientChannelMap = new Map();

const GUILD_ID = process.env.GUILD_ID; // Discord server (guild) ID
const TEMP_CHANNEL_CATEGORY_ID = process.env.TEMP_CHANNEL_CATEGORY_ID; // Optional: a category for support channels
const CHANNEL_TIMEOUT_MS = 10 * 60 * 1000; // Timeout: 10 minutes

// Function to create a temporary channel for a given client socket ID
async function createTemporaryChannel(clientSocketId) {
  try {
    const guild = await discordClient.guilds.fetch(GUILD_ID);
    console.log("Fetched guild:", guild.name);
    
    const channel = await guild.channels.create({
      name: `support-${clientSocketId}`,
      type: ChannelType.GuildText,
      parent: TEMP_CHANNEL_CATEGORY_ID || undefined,
    //  permissionOverwrites: [
     //   {
      //    id: guild.id,
      //    deny: ["ViewChannel"],
      //  },
      //  {
      //    id: discordClient.user.id,
      //    allow: ["ViewChannel", "SendMessages"],
      //  },
        // Add more permission overwrites if necessary for admin roles.
     //],
    });
    
    console.log(`Created temporary channel ${channel.id} for client ${clientSocketId}`);
    const timeout = setTimeout(async () => {
      try {
        await channel.delete("Channel inactive");
        clientChannelMap.delete(clientSocketId);
        console.log(`Deleted temporary channel ${channel.id} for client ${clientSocketId} due to inactivity`);
      } catch (err) {
        console.error("Error deleting channel:", err);
      }
    }, CHANNEL_TIMEOUT_MS);
    
    clientChannelMap.set(clientSocketId, { channelId: channel.id, timeout });
    console.log("Channel mapping stored:", clientSocketId, channel.id);
    return channel;
  } catch (error) {
    console.error("Error creating temporary channel:", error);
  }
}

// Socket.io connection handler
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  // When the client sends a message
  socket.on("clientMessage", async (data) => {
    let mapping = clientChannelMap.get(socket.id);
    if (!mapping) {
      const channel = await createTemporaryChannel(socket.id);
      if (!channel) {
        console.error("Failed to create temporary channel for client:", socket.id);
        return;
      }
      mapping = { channelId: channel.id };
      clientChannelMap.set(socket.id, mapping);
    }
    try {
      const channel = await discordClient.channels.fetch(mapping.channelId);
      if (channel) {
        // Reset the inactivity timeout
        clearTimeout(mapping.timeout);
        mapping.timeout = setTimeout(async () => {
          try {
            await channel.delete("Channel inactive");
            clientChannelMap.delete(socket.id);
            console.log(`Deleted temporary channel ${channel.id} for client ${socket.id} due to inactivity`);
          } catch (err) {
            console.error("Error deleting channel:", err);
          }
        }, CHANNEL_TIMEOUT_MS);
        channel.send(`[Client ${socket.id}]: ${data.text}`);
      } else {
        console.error("Channel not found for client", socket.id);
      }
    } catch (err) {
      console.error("Error forwarding client message for client", socket.id, err);
    }
  });

  socket.on("disconnect", async () => {
    console.log("Client disconnected:", socket.id);
    const mapping = clientChannelMap.get(socket.id);
    if (mapping) {
      try {
        const channel = await discordClient.channels.fetch(mapping.channelId);
        if (channel) {
          await channel.delete("Client disconnected");
          console.log(`Deleted temporary channel ${channel.id} for client ${socket.id} due to disconnection`);
        }
      } catch (err) {
        console.error("Error deleting channel on disconnect for client", socket.id, err);
      }
      clientChannelMap.delete(socket.id);
    }
  });
});

// Discord bot: listen for messages from Discord channels and forward them to the appropriate client.
discordClient.on("messageCreate", (message) => {
  if (message.author.bot) return;
  
  // Log the full message object (or key parts) for debugging
  console.log("Full Discord message:", {
    id: message.id,
    author: message.author.username,
    content: message.content,
    embeds: message.embeds,
    channelId: message.channel.id,
  });
  
  const content = message.content || 
    (message.embeds && message.embeds.length > 0 && message.embeds[0].description) || "";
  
  console.log(`Received Discord message: ${message.author.username} - ${content}`);
  
  let targetSocketId = null;
  clientChannelMap.forEach((mapping, socketId) => {
    if (mapping.channelId === message.channel.id) {
      targetSocketId = socketId;
    }
  });
  
  if (targetSocketId) {
    const payload = {
      sender: message.author.username,
      text: content,
    };
    console.log(`Forwarding message to client ${targetSocketId}:`, payload);
    io.to(targetSocketId).emit("adminMessage", payload);
  }
});


// Listen on the port specified in .env (defaulting to 3002)
const PORT = process.env.PORT || 3002;
server.listen(PORT, () => {
  console.log(`Socket.io server listening on port ${PORT}`);
});

// Gracefully shut down on Ctrl+C
process.on("SIGINT", () => {
  console.log("Shutting down gracefully...");
  discordClient.destroy();
  server.close(() => {
    process.exit(0);
  });
});