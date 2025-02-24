// src/app/api/orders/route.ts
// src/app/api/orders/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET!;

export async function GET(request: Request) {
  try {
    // Retrieve the token from the Authorization header.
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // Now fetch orders for the authenticated user.
    const orders = await prisma.order.findMany({
      where: { userId: decoded.userId },
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}
  
export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("Order API POST body:", body);

    const { userId, items } = body;
    if (!userId || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Invalid order data" }, { status: 400 });
    }

    // Calculate total price
    const total = items.reduce((sum: number, item: any) => {
      return sum + Number(item.unitPrice) * Number(item.quantity);
    }, 0);

    const order = await prisma.order.create({
      data: {
        userId: Number(userId),
        total,
        // orderStatus defaults to "AWAITING_PAYMENT"
        items: {
          create: items.map((item: any) => ({
            productId: Number(item.productId),
            quantity: Number(item.quantity),
            unitPrice: Number(item.unitPrice),
          })),
        },
      },
      include: { items: true },
    });
    console.log("Order created successfully:", order);
    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Failed to create order", details: error instanceof Error ? error.message : error },
      { status: 500 }
    );
  }
}