import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import { FiscalYear } from "@/models/FiscalYear"
import { getSession, isAllowed } from "@/lib/auth"
import type { UserRole } from "@/types"
import { z } from "zod"
import { logAudit } from "@/lib/audit-log"
import { verifyCsrfToken } from "@/lib/csrf.server"

const fiscalYearSchema = z.object({
  name: z.string().min(1, "Fiscal year name is required"),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  status: z.enum(["OPEN", "CLOSED"]).optional(),
  isDefault: z.boolean().optional(),
})

export async function GET() {
  try {
    const session = getSession()
    if (!session || !isAllowed(session.role as UserRole, ["ADMIN", "HR_PAYROLL"])) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    await dbConnect()
    const fiscalYears = await FiscalYear.find().sort({ startDate: -1 }).lean()
    return NextResponse.json({ data: fiscalYears })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Failed to fetch fiscal years" }, { status: 500 })
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
    const parsed = fiscalYearSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { name, startDate, endDate, status, isDefault } = parsed.data

    // Validate end date is after start date
    if (new Date(endDate) <= new Date(startDate)) {
      return NextResponse.json(
        { error: "End date must be after start date" },
        { status: 400 }
      )
    }

    const fiscalYear = await FiscalYear.create({
      name,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      status: status || "OPEN",
      isDefault: isDefault || false,
    })

    await logAudit({
      action: "CREATE",
      module: "FISCAL_YEAR",
      recordId: fiscalYear._id.toString(),
      details: { name, startDate, endDate, status },
      ipAddress: req.headers.get("x-forwarded-for") || undefined,
      userAgent: req.headers.get("user-agent") || undefined,
    })

    return NextResponse.json({ fiscalYear }, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Failed to create fiscal year" }, { status: 500 })
  }
}
