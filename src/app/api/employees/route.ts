import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import { Employee } from "@/models/Employee"
import { getSession, isAllowed } from "@/lib/auth"
import type { UserRole } from "@/types"
import { employeeSchema, type EmployeeInput } from "@/lib/validation"
import { logAudit } from "@/lib/audit-log"

export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  try {
    const session = getSession()
    if (!session || !isAllowed(session.role as UserRole, ["ADMIN", "HR_PAYROLL"])) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    await dbConnect()

    const employees = await Employee.find().sort({ employeeNumber: 1 }).lean()
    return NextResponse.json({ data: employees })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Failed to fetch employees" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = getSession()
    if (!session || !isAllowed(session.role as UserRole, ["ADMIN", "HR_PAYROLL"])) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    await dbConnect()
    const { employeeNumber, firstName, lastName, email, position, department, employmentStatus, basicSalary, hireDate } = await req.json()

    if (!employeeNumber || !firstName || !lastName || !email || !position || !department || !basicSalary || !hireDate) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    const existing = await Employee.findOne({ email })
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 })
    }

    const employee = await Employee.create({
      employeeNumber,
      firstName,
      lastName,
      email,
      position,
      department,
      employmentStatus,
      basicSalary: Number(basicSalary),
      hireDate: new Date(hireDate),
    })

    return NextResponse.json({ employee }, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Failed to create employee" }, { status: 500 })
  }
}