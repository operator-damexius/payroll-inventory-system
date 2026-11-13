import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import { Category } from "@/models/Category"
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
    const { name, description } = await req.json()
    const category = await Category.findByIdAndUpdate(params.id, { name, description }, { new: true })
    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }
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
    const session = getSession()
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    await dbConnect()
    const category = await Category.findByIdAndDelete(params.id)
    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }
    return NextResponse.json({ message: "Category deleted" })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 })
  }
}