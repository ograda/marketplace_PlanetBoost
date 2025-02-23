// src/app/api/products/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET: Fetch all products (optionally filtering by category via query params)
export async function GET(request: Request) {
  const url = new URL(request.url);
  const category = url.searchParams.get("category");
  let products;
  if (category) {
    products = await prisma.product.findMany({
      where: { category },
    });
  } else {
    products = await prisma.product.findMany();
  }
  return NextResponse.json(products);
}

// POST: Create a new product (enforce unique name)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Check for duplicate product name
    const existing = await prisma.product.findUnique({
      where: { name: body.name },
    });
    if (existing) {
      return NextResponse.json({ error: "Product with this name already exists" }, { status: 400 });
    }
    const product = await prisma.product.create({
      data: body,
    });
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}

// DELETE: Delete a product (expects { id } in body)
export async function DELETE(request: Request) {
  try {
    console.log("requesting to delete a product");
    const body = await request.json();
    console.log("DELETE payload:", body);
    const { id } = body;
    // Convert id to number if your model uses Int (adjust as needed)
    const deletedProduct = await prisma.product.delete({
      where: { id: Number(id) },
    });
    return NextResponse.json({ message: "Product deleted", product: deletedProduct });
  } catch (error) {
    console.error("Error in DELETE route:", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}