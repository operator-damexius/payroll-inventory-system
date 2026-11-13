import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import { Payroll } from "@/models/Payroll"
import { Payslip } from "@/models/Payslip"
import { getSession, isAllowed } from "@/lib/auth"
import type { UserRole } from "@/types"
import { logAudit } from "@/lib/audit-log"
import { withCsrf } from "@/lib/csrf.server"
import mongoose from "mongoose"

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = getSession()
    if (!session || !isAllowed(session.role as UserRole, ["ADMIN", "HR_PAYROLL"])) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    await dbConnect()

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: "Invalid payroll ID format" }, { status: 400 })
    }

    const payroll = await Payroll.findById(params.id)
      .populate("preparedBy reviewedBy approvedBy", "name email role")
      .lean()

    if (!payroll) {
      return NextResponse.json({ error: "Payroll period not found" }, { status: 404 })
    }

    const payslips = await Payslip.find({ payroll: params.id })
      .populate("employee", "employeeNumber firstName lastName email position department basicSalary")
      .sort({ "employee.employeeNumber": 1 })
      .lean()

    return NextResponse.json({ payroll, payslips })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Failed to fetch payroll" }, { status: 500 })
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    return await withCsrf(req, async () => {
      const session = getSession()
      if (!session || !isAllowed(session.role as UserRole, ["ADMIN", "HR_PAYROLL"])) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
      }

      await dbConnect()

      const body = await req.json()
      const { status } = body

      const payroll = await Payroll.findById(params.id)

      if (!payroll) {
        return NextResponse.json({ error: "Payroll period not found" }, { status: 404 })
      }

      if (payroll.status === "LOCKED" || payroll.status === "PAID") {
        return NextResponse.json({ error: "Cannot modify a locked or paid payroll" }, { status: 400 })
      }

      if (status === "APPROVED" && payroll.status !== "APPROVED") {
        payroll.approvedBy = new mongoose.Types.ObjectId(session.userId)
        payroll.approvedAt = new Date()
      }

      payroll.status = status || payroll.status
      await payroll.save()

      await logAudit({
        action: status === "APPROVED" ? "APPROVE" : "UPDATE",
        module: "PAYROLL",
        recordId: params.id,
        details: { periodName: payroll.periodName, status: payroll.status },
        ipAddress: req.headers.get("x-forwarded-for") || undefined,
        userAgent: req.headers.get("user-agent") || undefined,
      })

      return NextResponse.json({ payroll })
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Failed to update payroll" }, { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    return await withCsrf(req, async () => {
      const session = getSession()
      if (!session || session.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
      }

      await dbConnect()

      const payroll = await Payroll.findById(params.id)

      if (!payroll) {
        return NextResponse.json({ error: "Payroll period not found" }, { status: 404 })
      }

      if (payroll.status !== "DRAFT") {
        return NextResponse.json({ error: "Can only delete draft payrolls" }, { status: 400 })
      }

      await Payslip.deleteMany({ payroll: params.id })
      await Payroll.findByIdAndDelete(params.id)

      await logAudit({
        action: "DELETE",
        module: "PAYROLL",
        recordId: params.id,
        details: { periodName: payroll.periodName },
        ipAddress: req.headers.get("x-forwarded-for") || undefined,
        userAgent: req.headers.get("user-agent") || undefined,
      })

      return NextResponse.json({ message: "Payroll period deleted" })
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Failed to delete payroll" }, { status: 500 })
  }
}
