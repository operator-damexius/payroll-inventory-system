import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import { Payroll } from "@/models/Payroll"
import { Payslip } from "@/models/Payslip"
import { Employee } from "@/models/Employee"
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
    const payrollId = searchParams.get("payrollId")

    let query: any = {}
    if (payrollId) query.payroll = payrollId

    const payslips = await Payslip.find(query)
      .populate("employee", "employeeNumber firstName lastName email position department basicSalary")
      .populate("payroll", "periodName startDate endDate status")
      .sort({ "employee.employeeNumber": 1 })
      .lean()

    // Aggregate totals
    const totalGross = payslips.reduce((sum, p) => sum + (p.grossPay || 0), 0)
    const totalNet = payslips.reduce((sum, p) => sum + (p.netPay || 0), 0)
    const totalDeductions = payslips.reduce((sum, p) => sum + (p.totalDeductions || 0), 0)
    const totalAllowances = payslips.reduce((sum, p) => sum + (p.allowances || 0), 0)
    const totalOvertime = payslips.reduce((sum, p) => sum + (p.overtimePay || 0), 0)

    const report = {
      period: payrollId
        ? payslips[0]?.payroll
        : null,
      summary: {
        totalPayslips: payslips.length,
        totalGrossPay: totalGross,
        totalAllowances,
        totalOvertimePay: totalOvertime,
        totalDeductions,
        totalNetPay: totalNet,
      },
      payslips: payslips.map((p) => {
        const emp: any = p.employee
        return {
          id: p._id,
          employeeNumber: emp?.employeeNumber,
          employeeName: `${emp?.firstName} ${emp?.lastName}`,
          position: emp?.position,
          department: emp?.department,
          basicPay: p.basicPay,
          allowances: p.allowances,
          overtimePay: p.overtimePay,
          grossPay: p.grossPay,
          totalDeductions: p.totalDeductions,
          netPay: p.netPay,
          status: p.status,
        }
      }),
    }

    return NextResponse.json({ report })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Failed to generate payroll report" }, { status: 500 })
  }
}
