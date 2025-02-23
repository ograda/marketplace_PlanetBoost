import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET!; // Ensure this is set in your .env.local

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, email, password } = body;
    console.log("Registration request body:", body);

    // Check if the email is already registered
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      console.error("Registration error: Email already in use");
      return NextResponse.json({ error: "Email already in use" }, { status: 400 });
    }

    // Hash the password and create the user
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { username, email, password: hashedPassword },
    });
    console.log("User registered successfully:", user);

    // Create a JWT token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "1h" });
    
    return NextResponse.json(
      { token, user: { id: user.id, username: user.username, email: user.email } },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error during registration:", error);
    return NextResponse.json(
      { error: "Registration failed", details: error instanceof Error ? error.message : error },
      { status: 500 }
    );
  }
}