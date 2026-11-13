import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import { FiscalYear } from "@/models/FiscalYear"
import { getSession, isAllowed } from "@/lib/auth"
import type { UserRole } from "@/types"
import { fiscalYearSchema, type FiscalYearInput } from "@/lib/validation-payroll"
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
      return NextResponse.json({ error: "Invalid fiscal year ID format" }, { status: 400 })
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

    const updateData: any = { ...parsed.data }

    // Validate dates if both provided
    if (updateData.startDate || updateData.endDate) {
      const fy = await FiscalYear.findById(params.id)
      if (!fy) {
        return NextResponse.json({ error: "Fiscal year not found" }, { status: 404 })
      }
      const start = updateData.startDate ? new Date(updateData.startDate) : fy.startDate
      const end = updateData.endDate ? new Date(updateData.endDate) : fy.endDate
      if (end <= start) {
        return NextResponse.json(
          { error: "End date must be after start date" },
          { status: 400 }
        )
      }
    }

    const fiscalYear = await FiscalYear.findByIdAndUpdate(params.id, updateData, {
      new: true,
      runValidators: true,
    })

    if (!fiscalYear) {
      return NextResponse.json({ error: "Fiscal year not found" }, { status: 404 })
    }

    await logAudit({
      action: "UPDATE",
      module: "FISCAL_YEAR",
      recordId: params.id,
      details: { name: fiscalYear.name, status: fiscalYear.status },
      ipAddress: req.headers.get("x-forwarded-for") || undefined,
      userAgent: req.headers.get("user-agent") || undefined,
    })

    return NextResponse.json({ fiscalYear })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Failed to update fiscal year" }, { status: 500 })
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
      return NextResponse.json({ error: "Invalid fiscal year ID format" }, { status: 400 })
    }

    await dbConnect()
    const fiscalYear = await FiscalYear.findByIdAndDelete(params.id)

    if (!fiscalYear) {
      return NextResponse.json({ error: "Fiscal year not found" }, { status: 404 })
    }

    await logAudit({
      action: "DELETE",
      module: "FISCAL_YEAR",
      recordId: params.id,
      details: { name: fiscalYear.name },
      ipAddress: req.headers.get("x-forwarded-for") || undefined,
      userAgent: req.headers.get("user-agent") || undefined,
    })

    return NextResponse.json({ message: "Fiscal year deleted" })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Failed to delete fiscal year" }, { status: 500 })
  }
}
