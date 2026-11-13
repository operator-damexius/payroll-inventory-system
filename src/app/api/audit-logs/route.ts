import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import { AuditLog } from "@/models/AuditLog"
import { getSession, isAllowed } from "@/lib/auth"
import type { UserRole } from "@/types"

export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  try {
    const session = getSession()
    if (!session || !isAllowed(session.role as UserRole, ["ADMIN", "HR_PAYROLL"])) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    await dbConnect()
    const auditLogs = await AuditLog.find().sort({ createdAt: -1 }).limit(100).lean()
    return NextResponse.json({ data: auditLogs })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Failed to fetch audit logs" }, { status: 500 })
  }
}