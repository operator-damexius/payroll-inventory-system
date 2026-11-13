import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import { PayrollRule } from "@/models/PayrollRule"
import { getSession, isAllowed } from "@/lib/auth"
import type { UserRole } from "@/types"

export const dynamic = "force-dynamic"

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = getSession()
    if (!session || !isAllowed(session.role as UserRole, ["ADMIN", "HR_PAYROLL"])) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    await dbConnect()
    const body = await req.json()
const { name, basicSalary, allowances, deductions, overtimeRate } = body as { name: string; basicSalary: number; allowances: number; deductions: number; overtimeRate: number }
    const rule = await PayrollRule.findByIdAndUpdate(params.id, { name, basicSalary, allowances, deductions, overtimeRate }, { new: true })
    if (!rule) {
      return NextResponse.json({ error: "Payroll rule not found" }, { status: 404 })
    }
    return NextResponse.json({ rule })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Failed to update payroll rule" }, { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = getSession()
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    await dbConnect()
    const rule = await PayrollRule.findByIdAndDelete(params.id)
    if (!rule) {
      return NextResponse.json({ error: "Payroll rule not found" }, { status: 404 })
    }
    return NextResponse.json({ message: "Payroll rule deleted" })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Failed to delete payroll rule" }, { status: 500 })
  }
}