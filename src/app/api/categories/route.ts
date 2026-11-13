import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import { Category } from "@/models/Category"
import { getSession, isAllowed } from "@/lib/auth"
import type { UserRole } from "@/types"
import { logAudit } from "@/lib/audit-log"
import { verifyCsrfToken } from "@/lib/csrf.server"

export async function GET() {
  try {
    const session = getSession()
    if (!session || !isAllowed(session.role as UserRole, ["ADMIN", "INVENTORY"])) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    await dbConnect()
    const categories = await Category.find().sort({ name: 1 }).lean()
    return NextResponse.json({ data: categories })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 })
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
    const { name, description } = await req.json()

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    const category = await Category.create({ name, description })

    await logAudit({
      action: "CREATE",
      module: "INVENTORY",
      recordId: category._id.toString(),
      details: { name, description },
      ipAddress: req.headers.get("x-forwarded-for") || undefined,
      userAgent: req.headers.get("user-agent") || undefined,
    })

    return NextResponse.json({ category }, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 })
  }
}
