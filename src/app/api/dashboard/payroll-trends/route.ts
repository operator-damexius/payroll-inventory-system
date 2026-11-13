import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"

export const dynamic = "force-dynamic"
import { Payslip } from "@/models/Payslip"
import { getSession, isAllowed } from "@/lib/auth"
import type { UserRole } from "@/types"

export async function GET() {
  try {
    const session = getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const data = await Payslip.aggregate([
      {
        $group: {
          _id: "$periodName",
          grossPay: { $sum: "$grossPay" },
          netPay: { $sum: "$netPay" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: 12 },
    ])

    const chartData = {
      labels: data.map((d) => d._id),
      grossPay: data.map((d) => d.grossPay),
      netPay: data.map((d) => d.netPay),
      count: data.map((d) => d.count),
    }

    return NextResponse.json(chartData)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Failed to fetch payroll trends" }, { status: 500 })
  }
}
