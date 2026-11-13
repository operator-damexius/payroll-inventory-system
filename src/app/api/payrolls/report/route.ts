import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import { Payroll } from "@/models/Payroll"
import { Payslip } from "@/models/Payslip"
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
    const payrolls = await Payroll.find().sort({ startDate: -1 }).lean()
    const reports = payrolls.map(p => ({
      id: p._id,
      periodName: p.periodName,
      startDate: p.startDate,
      endDate: p.endDate,
      status: p.status,
      totalGrossPay: p.totalGrossPay,
      totalNetPay: p.totalNetPay,
      payslipCount: p.payslipCount,
    }))
    return NextResponse.json({ data: reports })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Failed to fetch payroll reports" }, { status: 500 })
  }
}