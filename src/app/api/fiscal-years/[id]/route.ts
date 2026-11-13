import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import { FiscalYear } from "@/models/FiscalYear"
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
const { name, startDate, endDate } = body as { name: string; startDate: string; endDate: string }
    const fiscalYear = await FiscalYear.findByIdAndUpdate(params.id, { name, startDate, endDate }, { new: true })
    if (!fiscalYear) {
      return NextResponse.json({ error: "Fiscal year not found" }, { status: 404 })
    }
    return NextResponse.json({ fiscalYear })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Failed to update fiscal year" }, { status: 500 })
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
    const fiscalYear = await FiscalYear.findByIdAndDelete(params.id)
    if (!fiscalYear) {
      return NextResponse.json({ error: "Fiscal year not found" }, { status: 404 })
    }
    return NextResponse.json({ message: "Fiscal year deleted" })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Failed to delete fiscal year" }, { status: 500 })
  }
}