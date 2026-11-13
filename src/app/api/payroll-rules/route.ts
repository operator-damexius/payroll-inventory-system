import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import { PayrollRule } from "@/models/PayrollRule"
import { getSession, isAllowed } from "@/lib/auth"
import type { UserRole } from "@/types"
import { z } from "zod"
import { logAudit } from "@/lib/audit-log"
import { verifyCsrfToken } from "@/lib/csrf.server"

const ruleSchema = z.object({
  ruleName: z.string().min(1),
  isActive: z.boolean().optional(),
  effectiveDate: z.string().datetime(),
  riceAllowance: z.coerce.number().min(0).optional(),
  transportAllowance: z.coerce.number().min(0).optional(),
  medicalAllowance: z.coerce.number().min(0).optional(),
  otherAllowance: z.coerce.number().min(0).optional(),
  sssContribution: z.coerce.number().min(0).optional(),
  philhealthContribution: z.coerce.number().min(0).optional(),
  pagibigContribution: z.coerce.number().min(0).optional(),
  taxWithholding: z.coerce.number().min(0).optional(),
  otRegularDay: z.coerce.number().min(0).optional(),
  otRestDay: z.coerce.number().min(0).optional(),
  otSpecialHoliday: z.coerce.number().min(0).optional(),
  otRegularHoliday: z.coerce.number().min(0).optional(),
})

export async function GET() {
  try {
    const session = getSession()
    if (!session || !isAllowed(session.role as UserRole, ["ADMIN", "HR_PAYROLL"])) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    await dbConnect()
    const rules = await PayrollRule.find().sort({ effectiveDate: -1 }).lean()
    return NextResponse.json({ data: rules })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Failed to fetch payroll rules" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const csrf = verifyCsrfToken(req)
    if (!csrf.valid) {
      return csrf.response!
    }

    const session = getSession()
    if (!session || !isAllowed(session.role as UserRole, ["ADMIN", "HR_PAYROLL"])) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    await dbConnect()
    const body = await req.json()
    const parsed = ruleSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    // Deactivate previous active rules when creating a new active one
    if (parsed.data.isActive !== false) {
      await PayrollRule.updateMany({ isActive: true }, { isActive: false })
    }

    const rule = await PayrollRule.create(parsed.data)

    await logAudit({
      action: "CREATE",
      module: "PAYROLL",
      recordId: rule._id.toString(),
      details: { ruleName: rule.ruleName, isActive: rule.isActive },
      ipAddress: req.headers.get("x-forwarded-for") || undefined,
      userAgent: req.headers.get("user-agent") || undefined,
    })

    return NextResponse.json({ rule }, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Failed to create payroll rule" }, { status: 500 })
  }
}
