import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import { Employee } from "@/models/Employee"
import { Payslip } from "@/models/Payslip"
import { getSession, isAllowed } from "@/lib/auth"
import type { UserRole } from "@/types"
import { employeeSchema, type EmployeeInput } from "@/lib/validation"
import { logAudit } from "@/lib/audit-log"
import { verifyCsrfToken } from "@/lib/csrf.server"
import mongoose from "mongoose"

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: "Invalid employee ID format" }, { status: 400 })
    }

    await dbConnect()

    // Role-based access: EMPLOYEE can only view their own record
    let query: any = { _id: params.id }
    if (session.role === "EMPLOYEE") {
      query.userId = session.userId
    }

    const employee = await Employee.findOne(query).lean()

    if (!employee) {
      return NextResponse.json(
        { error: "Employee not found or access denied" },
        { status: 404 }
      )
    }

    return NextResponse.json({ employee })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Failed to fetch employee" }, { status: 500 })
  }
}

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
      return NextResponse.json({ error: "Invalid employee ID format" }, { status: 400 })
    }

    await dbConnect()

    const body = await req.json()
    const parsed = employeeSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const input: EmployeeInput = parsed.data

    // Check for duplicate employee number/email excluding current record
    const existing = await Employee.findOne({
      _id: { $ne: params.id },
      $or: [{ employeeNumber: input.employeeNumber }, { email: input.email }],
    })
    if (existing) {
      return NextResponse.json(
        { error: "Employee number or email already exists" },
        { status: 400 }
      )
    }

    const employee = await Employee.findByIdAndUpdate(
      params.id,
      {
        ...input,
        basicSalary: Number(input.basicSalary),
        hireDate: new Date(input.hireDate),
      },
      { new: true, runValidators: true }
    )

    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 })
    }

    await logAudit({
      action: "UPDATE",
      module: "EMPLOYEE",
      recordId: params.id,
      details: { employeeNumber: employee.employeeNumber, email: employee.email },
      ipAddress: req.headers.get("x-forwarded-for") || undefined,
      userAgent: req.headers.get("user-agent") || undefined,
    })

    return NextResponse.json({ employee })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Failed to update employee" }, { status: 500 })
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
      return NextResponse.json({ error: "Invalid employee ID format" }, { status: 400 })
    }

    await dbConnect()

    // Cascade protection: prevent deletion if employee has payslips
    const existingPayslips = await Payslip.countDocuments({ employee: params.id })
    if (existingPayslips > 0) {
      return NextResponse.json(
        { error: "Cannot delete employee with existing payslips. Remove payslips first." },
        { status: 400 }
      )
    }

    const employee = await Employee.findByIdAndDelete(params.id)

    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 })
    }

    await logAudit({
      action: "DELETE",
      module: "EMPLOYEE",
      recordId: params.id,
      details: { employeeNumber: employee.employeeNumber, email: employee.email },
      ipAddress: req.headers.get("x-forwarded-for") || undefined,
      userAgent: req.headers.get("user-agent") || undefined,
    })

    return NextResponse.json({ message: "Employee deleted" })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Failed to delete employee" }, { status: 500 })
  }
}
