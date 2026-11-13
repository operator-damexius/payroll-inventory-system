import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import { PayrollRule } from "@/models/PayrollRule"
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
    const rules = await PayrollRule.find().sort({ effectiveDate: -1 }).lean()
    return NextResponse.json({ data: rules })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Failed to fetch payroll rules" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = getSession()
    if (!session || !isAllowed(session.role as UserRole, ["ADMIN", "HR_PAYROLL"])) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    await dbConnect()
    const body = await req.json()
const { name, basicSalary, allowances, deductions, overtimeRate } = body as { name: string; basicSalary: number; allowances: number; deductions: number; overtimeRate: number }

    if (!name) {
      return NextResponse.json({ error: "Rule name is required" }, { status: 400 })
    }

    const rule = await PayrollRule.create({ name, basicSalary, allowances, deductions, overtimeRate })
    return NextResponse.json({ rule }, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Failed to create payroll rule" }, { status: 500 })
  }
}