import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import { Payroll } from "@/models/Payroll"
import { Payslip } from "@/models/Payslip"
import { Employee } from "@/models/Employee"
import { getSession, isAllowed } from "@/lib/auth"
import type { UserRole } from "@/types"
import mongoose from "mongoose"
import { logAudit } from "@/lib/audit-log"
import { verifyCsrfToken } from "@/lib/csrf.server"
import { errorResponse, successResponse, createdResponse } from "@/lib/api-response"

export async function POST(req: Request) {
  try {
    const csrf = verifyCsrfToken(req)
    if (!csrf.valid) {
      return csrf.response!
    }

    const session = getSession()
    if (!session || !isAllowed(session.role as UserRole, ["ADMIN", "HR_PAYROLL"])) {
      return errorResponse("Unauthorized", 403)
    }

    await dbConnect()

    const { payrollId } = await req.json()

    if (!payrollId) {
      return errorResponse("payrollId is required", 400)
    }

    if (!mongoose.Types.ObjectId.isValid(payrollId)) {
      return errorResponse("Invalid payroll ID format", 400)
    }

    const payroll = await Payroll.findById(payrollId)
    if (!payroll) {
      return errorResponse("Payroll period not found", 404)
    }

    if (payroll.status !== "DRAFT") {
      return errorResponse("Can only calculate payslips for a draft payroll", 400)
    }

    // Get active payroll rule
    const { PayrollRule } = await import("@/models/PayrollRule")
    const rule = await PayrollRule.findOne({ isActive: true }).sort({ effectiveDate: -1 })
    if (!rule) {
      return errorResponse(
        "No active payroll rule found. Configure payroll rules first.",
        400
      )
    }

    // Get active employees
    const employees = await Employee.find({ employmentStatus: "ACTIVE" }).lean()

    let totalGross = 0
    let totalNet = 0
    let count = 0

    const sessionMongo = await mongoose.startSession()

    try {
      for (const emp of employees) {
        // Prevent duplicate payslip
        const existing = await Payslip.findOne({ payroll: payrollId, employee: emp._id })
        if (existing) continue

        const basicPay = emp.basicSalary || 0

        // Allowances from payroll rule
        const allowances =
          rule.riceAllowance +
          rule.transportAllowance +
          rule.medicalAllowance +
          rule.otherAllowance

        // Overtime pay (placeholder - configurable per employee in future)
        const overtimePay = 0

        // Gross Pay = Basic Pay + Allowances + Overtime Pay
        const grossPay = basicPay + allowances + overtimePay

        // Deductions from payroll rule
        const totalDeductions =
          rule.sssContribution +
          rule.philhealthContribution +
          rule.pagibigContribution +
          rule.taxWithholding

        // Net Pay = Gross Pay − Total Deductions
        const netPay = grossPay - totalDeductions

        await Payslip.create(
          [
            {
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
              preparedBy: new mongoose.Types.ObjectId(session.userId),
            },
          ],
          { session: sessionMongo }
        )

        totalGross += grossPay
        totalNet += netPay
        count += 1
      }

      payroll.status = "PROCESSING"
      payroll.totalGrossPay = totalGross
      payroll.totalNetPay = totalNet
      payroll.payslipCount = count
      await payroll.save({ session: sessionMongo })

      await sessionMongo.commitTransaction()

      await logAudit({
        action: "CALCULATE",
        module: "PAYSLIP",
        recordId: payrollId,
        details: { payslipCount: count, totalGrossPay: totalGross, totalNetPay: totalNet },
        ipAddress: req.headers.get("x-forwarded-for") || undefined,
        userAgent: req.headers.get("user-agent") || undefined,
      })

      return createdResponse({
        message: `Calculated ${count} payslips`,
        payroll: {
          totalGrossPay: totalGross,
          totalNetPay: totalNet,
          payslipCount: count,
        },
        rule: {
          allowances:
            rule.riceAllowance +
            rule.transportAllowance +
            rule.medicalAllowance +
            rule.otherAllowance,
          deductions:
            rule.sssContribution +
            rule.philhealthContribution +
            rule.pagibigContribution +
            rule.taxWithholding,
        },
      })
    } catch (err) {
      await sessionMongo.abortTransaction()
      throw err
    } finally {
      await sessionMongo.endSession()
    }
  } catch (err) {
    console.error(err)
    return errorResponse("Failed to calculate payslips", 500)
  }
}
