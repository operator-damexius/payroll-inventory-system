import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import { Product } from "@/models/Product"
import { getSession, isAllowed } from "@/lib/auth"
import type { UserRole } from "@/types"

export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  try {
    const session = getSession()
    if (!session || !isAllowed(session.role as UserRole, ["ADMIN", "INVENTORY"])) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    await dbConnect()
    const products = await Product.find().sort({ name: 1 }).lean()
    return NextResponse.json({ data: products })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = getSession()
    if (!session || !isAllowed(session.role as UserRole, ["ADMIN", "INVENTORY"])) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    await dbConnect()
    const { sku, name, category, supplier, quantity, reorderLevel, unitPrice } = await req.json()

    if (!sku || !name) {
      return NextResponse.json({ error: "SKU and name are required" }, { status: 400 })
    }

    const existing = await Product.findOne({ sku })
    if (existing) {
      return NextResponse.json({ error: "SKU already exists" }, { status: 400 })
    }

    const product = await Product.create({
      sku,
      name,
      category,
      supplier,
      quantity: Number(quantity) || 0,
      reorderLevel: Number(reorderLevel) || 0,
      unitPrice: Number(unitPrice) || 0,
    })
    return NextResponse.json({ product }, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
  }
}