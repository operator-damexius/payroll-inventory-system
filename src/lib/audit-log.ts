import mongoose from "mongoose"
import { AuditLog } from "@/models/AuditLog"
import { getSession } from "@/lib/auth"
import type { UserRole } from "@/types"

export type AuditModule =
  | "AUTH"
  | "EMPLOYEE"
  | "PAYROLL"
  | "PAYSLIP"
  | "INVENTORY"
  | "STOCK"
  | "FISCAL_YEAR"
  | "SETTINGS"
  | "SYSTEM"

export async function logAudit({
  action,
  module,
  recordId,
  details,
  ipAddress,
  userAgent,
}: {
  action: string
  module: AuditModule
  recordId?: string
  details?: Record<string, any>
  ipAddress?: string
  userAgent?: string
}) {
  try {
    const session = getSession()

    await AuditLog.create({
      userId: session?.userId ? new mongoose.Types.ObjectId(session.userId) : undefined,
      userEmail: session?.email,
      userRole: session?.role,
      action,
      module,
      recordId,
      details,
      ipAddress,
      userAgent,
    })
  } catch (err) {
    // Audit logging should never break the main flow
    console.error("Audit log failed:", err)
  }
}
