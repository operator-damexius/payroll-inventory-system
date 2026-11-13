import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import { Product } from "@/models/Product"
import { StockTransaction } from "@/models/StockTransaction"
import { getSession, isAllowed } from "@/lib/auth"
import type { UserRole } from "@/types"
import mongoose from "mongoose"
import { logAudit } from "@/lib/audit-log"
import { verifyCsrfToken } from "@/lib/csrf.server"

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = getSession()
    if (!session || !isAllowed(session.role as UserRole, ["ADMIN", "INVENTORY"])) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: "Invalid product ID format" }, { status: 400 })
    }

    await dbConnect()
    const product = await Product.findById(params.id)
      .populate("category", "name")
      .populate("supplier", "name")
      .lean()

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json({ product })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 })
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const csrf = verifyCsrfToken(req)
    if (!csrf.valid) {
      return csrf.response!
    }

    const session = getSession()
    if (!session || !isAllowed(session.role as UserRole, ["ADMIN", "INVENTORY"])) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: "Invalid product ID format" }, { status: 400 })
    }

    await dbConnect()
    const body = await req.json()

    const product = await Product.findByIdAndUpdate(params.id, body, {
      new: true,
      runValidators: true,
    })

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    await logAudit({
      action: "UPDATE",
      module: "INVENTORY",
      recordId: params.id,
      details: { sku: product.sku, name: product.name },
      ipAddress: req.headers.get("x-forwarded-for") || undefined,
      userAgent: req.headers.get("user-agent") || undefined,
    })

    return NextResponse.json({ product })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const csrf = verifyCsrfToken(req)
    if (!csrf.valid) {
      return csrf.response!
    }

    const session = getSession()
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: "Invalid product ID format" }, { status: 400 })
    }

    await dbConnect()

    // Cascade protection: prevent deletion if product has stock transactions
    const existingTransactions = await StockTransaction.countDocuments({
      product: params.id,
    })
    if (existingTransactions > 0) {
      return NextResponse.json(
        { error: "Cannot delete product with existing stock transactions. Remove transactions first." },
        { status: 400 }
      )
    }

    const product = await Product.findByIdAndDelete(params.id)

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    await logAudit({
      action: "DELETE",
      module: "INVENTORY",
      recordId: params.id,
      details: { sku: product.sku, name: product.name },
      ipAddress: req.headers.get("x-forwarded-for") || undefined,
      userAgent: req.headers.get("user-agent") || undefined,
    })

    return NextResponse.json({ message: "Product deleted" })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 })
  }
}
