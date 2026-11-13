import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import { PayrollRule } from "@/models/PayrollRule"
import { getSession, isAllowed } from "@/lib/auth"
import type { UserRole } from "@/types"
import { payrollRuleSchema, type PayrollRuleInput } from "@/lib/validation-payroll"
import { logAudit } from "@/lib/audit-log"
import { verifyCsrfToken } from "@/lib/csrf.server"
import mongoose from "mongoose"

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
    if (!session || !isAllowed(session.role as UserRole, ["ADMIN", "HR_PAYROLL"])) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: "Invalid payroll rule ID format" }, { status: 400 })
    }

    await dbConnect()
    const body = await req.json()
    const parsed = payrollRuleSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    // If activating this rule, deactivate others
    if (parsed.data.isActive !== false) {
      await PayrollRule.updateMany({ _id: { $ne: params.id }, isActive: true }, { isActive: false })
    }

    const rule = await PayrollRule.findByIdAndUpdate(params.id, parsed.data, {
      new: true,
      runValidators: true,
    })

    if (!rule) {
      return NextResponse.json({ error: "Payroll rule not found" }, { status: 404 })
    }

    await logAudit({
      action: "UPDATE",
      module: "PAYROLL",
      recordId: params.id,
      details: { ruleName: rule.ruleName, isActive: rule.isActive },
      ipAddress: req.headers.get("x-forwarded-for") || undefined,
      userAgent: req.headers.get("user-agent") || undefined,
    })

    return NextResponse.json({ rule })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Failed to update payroll rule" }, { status: 500 })
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
      return NextResponse.json({ error: "Invalid payroll rule ID format" }, { status: 400 })
    }

    await dbConnect()
    const rule = await PayrollRule.findByIdAndDelete(params.id)

    if (!rule) {
      return NextResponse.json({ error: "Payroll rule not found" }, { status: 404 })
    }

    await logAudit({
      action: "DELETE",
      module: "PAYROLL",
      recordId: params.id,
      details: { ruleName: rule.ruleName },
      ipAddress: req.headers.get("x-forwarded-for") || undefined,
      userAgent: req.headers.get("user-agent") || undefined,
    })

    return NextResponse.json({ message: "Payroll rule deleted" })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Failed to delete payroll rule" }, { status: 500 })
  }
}
