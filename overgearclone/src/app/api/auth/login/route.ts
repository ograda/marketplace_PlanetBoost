// src/app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET!;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;
    console.log("Login request for email:", email); // Debug log

    const user = await prisma.user.findUnique({
      where: { email },
    });
    console.log("User found:", user); // Debug log (remove sensitive info later)

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 400 });
    }
    const isValid = await bcrypt.compare(password, user.password);
    console.log("Password valid?", isValid); // Debug log

    if (!isValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 400 });
    }
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "1h" });
    return NextResponse.json({ token, user: { id: user.id, username: user.username, email: user.email } });
  } catch (error) {
    console.error("Error during login:", error);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}