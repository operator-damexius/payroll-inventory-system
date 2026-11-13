import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"

export const dynamic = "force-dynamic"
import { StockTransaction } from "@/models/StockTransaction"
import { getSession, isAllowed } from "@/lib/auth"
import type { UserRole } from "@/types"

export async function GET() {
  try {
    const session = getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const data = await StockTransaction.aggregate([
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m", date: "$createdAt" },
          },
          stockIn: {
            $sum: {
              $cond: [{ $eq: ["$type", "STOCK_IN"] }, "$quantity", 0],
            },
          },
          stockOut: {
            $sum: {
              $cond: [{ $eq: ["$type", "STOCK_OUT"] }, "$quantity", 0],
            },
          },
          adjustments: {
            $sum: {
              $cond: [{ $eq: ["$type", "ADJUSTMENT"] }, "$quantity", 0],
            },
          },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: 12 },
    ])

    const chartData = {
      labels: data.map((d) => d._id),
      stockIn: data.map((d) => d.stockIn),
      stockOut: data.map((d) => d.stockOut),
      adjustments: data.map((d) => d.adjustments),
    }

    return NextResponse.json(chartData)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Failed to fetch stock trends" }, { status: 500 })
  }
}
