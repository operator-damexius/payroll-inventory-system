import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import { Payroll } from "@/models/Payroll"
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
    const payrolls = await Payroll.find().sort({ startDate: -1 }).lean()
    return NextResponse.json({ data: payrolls })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Failed to fetch payrolls" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = getSession()
    if (!session || !isAllowed(session.role as UserRole, ["ADMIN", "HR_PAYROLL"])) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    await dbConnect()
    const { periodName, startDate, endDate } = await req.json()

    if (!periodName || !startDate || !endDate) {
      return NextResponse.json({ error: "Period name, start date, and end date are required" }, { status: 400 })
    }

    const existing = await Payroll.findOne({
      $or: [
        { startDate: { $lte: new Date(endDate) }, endDate: { $gte: new Date(startDate) } },
      ],
    })

    if (existing) {
      return NextResponse.json({ error: "Payroll period overlaps with an existing period" }, { status: 400 })
    }

    const payroll = await Payroll.create({
      periodName,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      status: "DRAFT",
    })

    return NextResponse.json({ payroll }, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Failed to create payroll period" }, { status: 500 })
  }
}