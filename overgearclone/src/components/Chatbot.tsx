"use client";

import React, { useState, useEffect } from "react";
import io from "socket.io-client";

interface Message {
  sender: "user" | "admin";
  text: string;
}

const socket = io("http://localhost:3002");

const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected to Socket.io server, socket id:", socket.id);
    });
    socket.on("disconnect", () => {
      console.log("Disconnected from Socket.io server");
    });
    socket.on("adminMessage", (msg: { sender: string; text: string }) => {
      console.log("Received admin message:", msg);
      setMessages((prev) => [
        ...prev,
        { sender: "admin", text: `${msg.sender}: ${msg.text}` },
      ]);
    });
    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("adminMessage");
    };
  }, []);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg: Message = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    socket.emit("clientMessage", { text: input });
    setInput("");
  };

  return (
    <div style={{ position: "fixed", bottom: "20px", right: "20px", zIndex: 1000 }}>
      {isOpen ? (
        <div style={{ width: "300px", height: "400px", border: "1px solid #ccc", backgroundColor: "#fff", borderRadius: "8px", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "10px", backgroundColor: "#333", color: "#fff", borderRadius: "8px 8px 0 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>Support Chat</span>
            <button onClick={toggleChat} style={{ background: "transparent", border: "none", color: "#fff", fontSize: "16px", cursor: "pointer" }}>
              X
            </button>
          </div>
          <div style={{ flex: 1, padding: "10px", overflowY: "auto" }}>
            {messages.map((msg, index) => (
              <div key={index} style={{ textAlign: msg.sender === "admin" ? "left" : "right", margin: "5px 0" }}>
                <span style={{ background: msg.sender === "admin" ? "#eee" : "#0084ff", color: msg.sender === "admin" ? "#000" : "#fff", padding: "5px 10px", borderRadius: "15px" }}>
                  {msg.text}
                </span>
              </div>
            ))}
          </div>
          <div style={{ padding: "10px", borderTop: "1px solid #ccc", display: "flex" }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type your message..."
              style={{ flex: 1, padding: "5px" }}
            />
            <button onClick={handleSend} style={{ marginLeft: "5px", padding: "5px 10px" }}>
              Send
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={toggleChat}
          style={{
            background: "#0084ff",
            border: "none",
            borderRadius: "50%",
            width: "50px",
            height: "50px",
            color: "#fff",
            fontSize: "24px",
            cursor: "pointer",
          }}
        >
          💬
        </button>
      )}
    </div>
  );
};

export default ChatBot;
