import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import { Supplier } from "@/models/Supplier"
import { Product } from "@/models/Product"
import { getSession, isAllowed } from "@/lib/auth"
import type { UserRole } from "@/types"
import mongoose from "mongoose"
import { verifyCsrfToken } from "@/lib/csrf.server"
import { logAudit } from "@/lib/audit-log"

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
      return NextResponse.json({ error: "Invalid supplier ID format" }, { status: 400 })
    }

    await dbConnect()
    const { name, contactPerson, email, phone, address } = await req.json()

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    const supplier = await Supplier.findByIdAndUpdate(
      params.id,
      { name, contactPerson, email, phone, address },
      { new: true, runValidators: true }
    )

    if (!supplier) {
      return NextResponse.json({ error: "Supplier not found" }, { status: 404 })
    }

    await logAudit({
      action: "UPDATE",
      module: "INVENTORY",
      recordId: params.id,
      details: { name, contactPerson, email },
      ipAddress: req.headers.get("x-forwarded-for") || undefined,
      userAgent: req.headers.get("user-agent") || undefined,
    })

    return NextResponse.json({ supplier })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Failed to update supplier" }, { status: 500 })
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
      return NextResponse.json({ error: "Invalid supplier ID format" }, { status: 400 })
    }

    await dbConnect()

    // Cascade protection: prevent deletion if supplier has products
    const existingProducts = await Product.countDocuments({ supplier: params.id })
    if (existingProducts > 0) {
      return NextResponse.json(
        { error: "Cannot delete supplier with existing products. Remove products first." },
        { status: 400 }
      )
    }

    const supplier = await Supplier.findByIdAndDelete(params.id)

    if (!supplier) {
      return NextResponse.json({ error: "Supplier not found" }, { status: 404 })
    }

    await logAudit({
      action: "DELETE",
      module: "INVENTORY",
      recordId: params.id,
      details: { name: supplier.name },
      ipAddress: req.headers.get("x-forwarded-for") || undefined,
      userAgent: req.headers.get("user-agent") || undefined,
    })

    return NextResponse.json({ message: "Supplier deleted" })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Failed to delete supplier" }, { status: 500 })
  }
}
