import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import { Payroll } from "@/models/Payroll"
import { getSession, isAllowed } from "@/lib/auth"
import type { UserRole } from "@/types"
import { z } from "zod"
import { logAudit } from "@/lib/audit-log"
import { withCsrf } from "@/lib/csrf.server"
import mongoose from "mongoose"

const createPayrollSchema = z.object({
  periodName: z.string().min(1),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
})

export async function GET(req: Request) {
  try {
    const session = getSession()
    if (!session) {
      return NextResponse.json({ error: "Not authenticated. Please log in." }, { status: 401 })
    }
    if (!isAllowed(session.role as UserRole, ["ADMIN", "HR_PAYROLL"])) {
      return NextResponse.json({ error: "Unauthorized. Admin or HR/Payroll role required." }, { status: 403 })
    }

    await dbConnect()

    const payrolls = await Payroll.find()
      .sort({ startDate: -1 })
      .populate("preparedBy approvedBy", "name email role")
      .lean()

    return NextResponse.json({ data: payrolls })
  } catch (err: any) {
    console.error("GET /api/payrolls error:", err)
    return NextResponse.json({ 
      error: "Failed to fetch payrolls",
      details: err.message || String(err)
    }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    return await withCsrf(req, async () => {
      const session = getSession()
      if (!session || !isAllowed(session.role as UserRole, ["ADMIN", "HR_PAYROLL"])) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
      }

      await dbConnect()

      const body = await req.json()
      const parsed = createPayrollSchema.safeParse(body)

      if (!parsed.success) {
        return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 })
      }

      const { periodName, startDate, endDate } = parsed.data

      // Convert date strings to ISO datetime
      const startDateIso = new Date(startDate).toISOString()
      const endDateIso = new Date(endDate).toISOString()

      // Validate end date is after start date
      if (new Date(endDateIso) <= new Date(startDateIso)) {
        return NextResponse.json(
          { error: "End date must be after start date" },
          { status: 400 }
        )
      }

      // Check for overlapping periods
      const existing = await Payroll.findOne({
        $or: [
          { startDate: { $lte: new Date(endDateIso) }, endDate: { $gte: new Date(startDateIso) } },
        ],
      })

      if (existing) {
        return NextResponse.json({ error: "Payroll period overlaps with an existing period" }, { status: 400 })
      }

      const payroll = await Payroll.create({
        periodName,
        startDate: new Date(startDateIso),
        endDate: new Date(endDateIso),
        status: "DRAFT",
        preparedBy: new mongoose.Types.ObjectId(session.userId),
        preparedAt: new Date(),
      })

      await logAudit({
        action: "CREATE",
        module: "PAYROLL",
        recordId: payroll._id.toString(),
        details: { periodName, startDate, endDate },
        ipAddress: req.headers.get("x-forwarded-for") || undefined,
        userAgent: req.headers.get("user-agent") || undefined,
      })

      return NextResponse.json({ payroll }, { status: 201 })
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Failed to create payroll period" }, { status: 500 })
  }
}
