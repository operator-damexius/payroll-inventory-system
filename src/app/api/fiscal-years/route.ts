import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import { FiscalYear } from "@/models/FiscalYear"
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
    const fiscalYears = await FiscalYear.find().sort({ startDate: -1 }).lean()
    return NextResponse.json({ data: fiscalYears })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Failed to fetch fiscal years" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = getSession()
    if (!session || !isAllowed(session.role as UserRole, ["ADMIN", "HR_PAYROLL"])) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    await dbConnect()
    const { name, startDate, endDate } = await req.json()
    const fiscalYear = await FiscalYear.create({ name, startDate, endDate })
    return NextResponse.json({ fiscalYear }, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Failed to create fiscal year" }, { status: 500 })
  }
}