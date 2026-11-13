import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import { Supplier } from "@/models/Supplier"
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
    const suppliers = await Supplier.find().sort({ name: 1 }).lean()
    return NextResponse.json({ data: suppliers })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Failed to fetch suppliers" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = getSession()
    if (!session || !isAllowed(session.role as UserRole, ["ADMIN", "INVENTORY"])) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    await dbConnect()
    const { name, contactPerson, email, phone } = await req.json()

    if (!name) {
      return NextResponse.json({ error: "Supplier name is required" }, { status: 400 })
    }

    const supplier = await Supplier.create({ name, contactPerson, email, phone })
    return NextResponse.json({ supplier }, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Failed to create supplier" }, { status: 500 })
  }
}