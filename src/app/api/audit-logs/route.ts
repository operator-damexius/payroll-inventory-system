import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import { AuditLog } from "@/models/AuditLog"
import { getSession, isAllowed } from "@/lib/auth"
import type { UserRole } from "@/types"

export async function GET(req: Request) {
  try {
    const session = getSession()
    if (!session || !isAllowed(session.role as UserRole, ["ADMIN", "HR_PAYROLL"])) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    await dbConnect()

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "50")
    const module = searchParams.get("module") || ""
    const action = searchParams.get("action") || ""
    const skip = (page - 1) * limit

    let query: any = {}
    if (module) query.module = module
    if (action) query.action = { $regex: action, $options: "i" }

    const [data, total] = await Promise.all([
      AuditLog.find(query)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean(),
      AuditLog.countDocuments(query),
    ])

    return NextResponse.json({
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Failed to fetch audit logs" }, { status: 500 })
  }
}
