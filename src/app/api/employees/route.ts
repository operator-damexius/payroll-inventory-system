import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import { Employee } from "@/models/Employee"
import { getSession, isAllowed } from "@/lib/auth"
import type { UserRole } from "@/types"
import { employeeSchema, type EmployeeInput } from "@/lib/validation"
import { logAudit } from "@/lib/audit-log"
import { verifyCsrfToken } from "@/lib/csrf.server"

export async function GET(req: Request) {
  try {
    const session = getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const search = searchParams.get("search") || ""
    const skip = (page - 1) * limit

    // Role-based filtering: EMPLOYEE can only see their own record
    let query: any = {}
    if (session.role === "EMPLOYEE") {
      // Employee can only view their own linked record
      query.userId = session.userId
    }

    if (search) {
      query.$or = [
        { employeeNumber: { $regex: search, $options: "i" } },
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { department: { $regex: search, $options: "i" } },
      ]
    }

    const [data, total] = await Promise.all([
      Employee.find(query)
        .skip(skip)
        .limit(limit)
        .sort({ employeeNumber: 1 })
        .lean(),
      Employee.countDocuments(query),
    ])

    return NextResponse.json({
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Failed to fetch employees" }, { status: 500 })
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
    const parsed = employeeSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const input: EmployeeInput = parsed.data

    const existing = await Employee.findOne({
      $or: [{ employeeNumber: input.employeeNumber }, { email: input.email }],
    })
    if (existing) {
      return NextResponse.json(
        { error: "Employee number or email already exists" },
        { status: 400 }
      )
    }

    const employee = await Employee.create({
      ...input,
      basicSalary: Number(input.basicSalary),
      hireDate: new Date(input.hireDate),
    })

    await logAudit({
      action: "CREATE",
      module: "EMPLOYEE",
      recordId: employee._id.toString(),
      details: { employeeNumber: employee.employeeNumber, email: employee.email },
      ipAddress: req.headers.get("x-forwarded-for") || undefined,
      userAgent: req.headers.get("user-agent") || undefined,
    })

    return NextResponse.json({ employee }, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Failed to create employee" }, { status: 500 })
  }
}
