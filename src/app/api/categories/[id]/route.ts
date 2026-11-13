import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import { Category } from "@/models/Category"
import { Product } from "@/models/Product"
import { getSession, isAllowed } from "@/lib/auth"
import type { UserRole } from "@/types"
import mongoose from "mongoose"
import { logAudit } from "@/lib/audit-log"
import { verifyCsrfToken } from "@/lib/csrf.server"

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
      return NextResponse.json({ error: "Invalid category ID format" }, { status: 400 })
    }

    await dbConnect()
    const { name, description } = await req.json()

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    const category = await Category.findByIdAndUpdate(
      params.id,
      { name, description },
      { new: true, runValidators: true }
    )

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    await logAudit({
      action: "UPDATE",
      module: "INVENTORY",
      recordId: params.id,
      details: { name, description },
      ipAddress: req.headers.get("x-forwarded-for") || undefined,
      userAgent: req.headers.get("user-agent") || undefined,
    })

    return NextResponse.json({ category })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 })
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
      return NextResponse.json({ error: "Invalid category ID format" }, { status: 400 })
    }

    await dbConnect()

    // Cascade protection: prevent deletion if category has products
    const existingProducts = await Product.countDocuments({ category: params.id })
    if (existingProducts > 0) {
      return NextResponse.json(
        { error: "Cannot delete category with existing products. Remove products first." },
        { status: 400 }
      )
    }

    const category = await Category.findByIdAndDelete(params.id)

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    await logAudit({
      action: "DELETE",
      module: "INVENTORY",
      recordId: params.id,
      details: { name: category.name },
      ipAddress: req.headers.get("x-forwarded-for") || undefined,
      userAgent: req.headers.get("user-agent") || undefined,
    })

    return NextResponse.json({ message: "Category deleted" })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 })
  }
}
