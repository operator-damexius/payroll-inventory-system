import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import { Payroll } from "@/models/Payroll"
import { getSession, isAllowed } from "@/lib/auth"
import type { UserRole } from "@/types"

export const dynamic = "force-dynamic"

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
    const payroll = await Payroll.findById(params.id)
    if (!payroll) {
      return NextResponse.json({ error: "Payroll period not found" }, { status: 404 })
    }
    return NextResponse.json({ payroll })
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
    const session = getSession()
    if (!session || !isAllowed(session.role as UserRole, ["ADMIN", "HR_PAYROLL"])) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    await dbConnect()
    const { status } = await req.json()

    const payroll = await Payroll.findByIdAndUpdate(params.id, { status }, { new: true })
    if (!payroll) {
      return NextResponse.json({ error: "Payroll period not found" }, { status: 404 })
    }

    return NextResponse.json({ payroll })
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
    const session = getSession()
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    await dbConnect()
    const payroll = await Payroll.findByIdAndDelete(params.id)
    if (!payroll) {
      return NextResponse.json({ error: "Payroll period not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Payroll period deleted" })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Failed to delete payroll" }, { status: 500 })
  }
}