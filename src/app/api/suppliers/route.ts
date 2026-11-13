import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import { Supplier } from "@/models/Supplier"
import { getSession, isAllowed } from "@/lib/auth"
import type { UserRole } from "@/types"
import { verifyCsrfToken } from "@/lib/csrf.server"
import { logAudit } from "@/lib/audit-log"

export async function GET() {
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
    const csrf = verifyCsrfToken(req)
    if (!csrf.valid) {
      return csrf.response!
    }

    const session = getSession()
    if (!session || !isAllowed(session.role as UserRole, ["ADMIN", "INVENTORY"])) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    await dbConnect()
    const { name, contactPerson, email, phone, address } = await req.json()

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    const supplier = await Supplier.create({ name, contactPerson, email, phone, address })

    await logAudit({
      action: "CREATE",
      module: "INVENTORY",
      recordId: supplier._id.toString(),
      details: { name, contactPerson, email },
      ipAddress: req.headers.get("x-forwarded-for") || undefined,
      userAgent: req.headers.get("user-agent") || undefined,
    })

    return NextResponse.json({ supplier }, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Failed to create supplier" }, { status: 500 })
  }
}
