import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import { Supplier } from "@/models/Supplier"
import { getSession, isAllowed } from "@/lib/auth"
import type { UserRole } from "@/types"

export const dynamic = "force-dynamic"

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = getSession()
    if (!session || !isAllowed(session.role as UserRole, ["ADMIN", "INVENTORY"])) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    await dbConnect()
    const { name, contactPerson, email, phone } = await req.json()
    const supplier = await Supplier.findByIdAndUpdate(params.id, { name, contactPerson, email, phone }, { new: true })
    if (!supplier) {
      return NextResponse.json({ error: "Supplier not found" }, { status: 404 })
    }
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
    const session = getSession()
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    await dbConnect()
    const supplier = await Supplier.findByIdAndDelete(params.id)
    if (!supplier) {
      return NextResponse.json({ error: "Supplier not found" }, { status: 404 })
    }
    return NextResponse.json({ message: "Supplier deleted" })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Failed to delete supplier" }, { status: 500 })
  }
}