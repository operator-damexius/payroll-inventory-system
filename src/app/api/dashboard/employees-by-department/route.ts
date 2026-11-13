import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"

export const dynamic = "force-dynamic"
import { Employee } from "@/models/Employee"
import { getSession, isAllowed } from "@/lib/auth"
import type { UserRole } from "@/types"

export async function GET() {
  try {
    const session = getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const data = await Employee.aggregate([
      { $group: { _id: "$department", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ])

    const chartData = {
      labels: data.map((d) => d._id || "Unassigned"),
      values: data.map((d) => d.count),
    }

    return NextResponse.json(chartData)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Failed to fetch employee department data" }, { status: 500 })
  }
}
