import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import { Payroll } from "@/models/Payroll"
import { Payslip } from "@/models/Payslip"
import { Employee } from "@/models/Employee"
import { PayrollRule } from "@/models/PayrollRule"
import { getSession, isAllowed } from "@/lib/auth"
import type { UserRole } from "@/types"

export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  try {
    const session = getSession()
    if (!session || !isAllowed(session.role as UserRole, ["ADMIN", "HR_PAYROLL"])) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    await dbConnect()
    const { payrollId } = await req.json()

    if (!payrollId) {
      return NextResponse.json({ error: "Payroll ID is required" }, { status: 400 })
    }

    const payroll = await Payroll.findById(payrollId)
    if (!payroll) {
      return NextResponse.json({ error: "Payroll period not found" }, { status: 404 })
    }

    if (payroll.status !== "DRAFT") {
      return NextResponse.json({ error: "Can only calculate payslips for a draft payroll" }, { status: 400 })
    }

    const rule = await PayrollRule.findOne({ isActive: true }).sort({ effectiveDate: -1 })
    if (!rule) {
      return NextResponse.json({ error: "No active payroll rule found" }, { status: 400 })
    }

    const employees = await Employee.find({ employmentStatus: "ACTIVE" }).lean()

    let totalGross = 0
    let totalNet = 0
    let count = 0

    for (const emp of employees) {
      const existing = await Payslip.findOne({ payroll: payrollId, employee: emp._id })
      if (existing) continue

      const basicPay = emp.basicSalary || 0
      const allowances = rule.riceAllowance + rule.transportAllowance + rule.medicalAllowance + rule.otherAllowance
      const overtimePay = 0
      const grossPay = basicPay + allowances + overtimePay
      const totalDeductions = rule.sssContribution + rule.philhealthContribution + rule.pagibigContribution + rule.taxWithholding
      const netPay = grossPay - totalDeductions

      await Payslip.create({
        payroll: payrollId,
        employee: emp._id,
        periodName: payroll.periodName,
        startDate: payroll.startDate,
        endDate: payroll.endDate,
        basicPay,
        allowances,
        overtimePay,
        grossPay,
        totalDeductions,
        netPay,
        status: "CALCULATED",
        preparedBy: payroll.preparedBy,
      })

      totalGross += grossPay
      totalNet += netPay
      count += 1
    }

    payroll.status = "PROCESSING"
    payroll.totalGrossPay = totalGross
    payroll.totalNetPay = totalNet
    payroll.payslipCount = count
    await payroll.save()

    return NextResponse.json({
      message: `Calculated ${count} payslips`,
      payroll: { totalGrossPay: totalGross, totalNetPay: totalNet, payslipCount: count },
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Failed to calculate payslips" }, { status: 500 })
  }
}