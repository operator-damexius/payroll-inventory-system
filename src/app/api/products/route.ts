import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import { Product } from "@/models/Product"
import { getSession, isAllowed } from "@/lib/auth"
import type { UserRole } from "@/types"
import { logAudit } from "@/lib/audit-log"
import { verifyCsrfToken } from "@/lib/csrf.server"

export async function GET(req: Request) {
  try {
    const session = getSession()
    if (!session || !isAllowed(session.role as UserRole, ["ADMIN", "INVENTORY"])) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    await dbConnect()

    const { searchParams } = new URL(req.url)
    const lowStock = searchParams.get("lowStock") === "true"

    let query: any = { isActive: true }
    if (lowStock) {
      query.$expr = { $lte: ["$quantity", "$reorderLevel"] }
    }

    const products = await Product.find(query)
      .populate("category", "name")
      .populate("supplier", "name")
      .sort({ name: 1 })
      .lean()

    return NextResponse.json({ data: products })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const csrf = verifyCsrfToken(req)
    if (!csrf.valid) {
      return csrf.response!
    }

    const session = getSession()
    if (!session || !isAllowed(session.role as UserRole, ["ADMIN", "INVENTORY"])) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    await dbConnect()
    const {
      sku,
      name,
      description,
      category,
      supplier,
      quantity,
      reorderLevel,
      unitPrice,
    } = await req.json()

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
      description,
      category: category || null,
      supplier: supplier || null,
      quantity: Number(quantity) || 0,
      reorderLevel: Number(reorderLevel) || 5,
      unitPrice: Number(unitPrice) || 0,
    })

    await logAudit({
      action: "CREATE",
      module: "INVENTORY",
      recordId: product._id.toString(),
      details: { sku, name },
      ipAddress: req.headers.get("x-forwarded-for") || undefined,
      userAgent: req.headers.get("user-agent") || undefined,
    })

    return NextResponse.json({ product }, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
  }
}
