import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"

export const dynamic = "force-dynamic"
import { Product } from "@/models/Product"
import { getSession, isAllowed } from "@/lib/auth"
import type { UserRole } from "@/types"

export async function GET() {
  try {
    const session = getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()

    const data = await Product.aggregate([
      { $match: { isActive: true } },
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "categoryInfo",
        },
      },
      {
        $group: {
          _id: { $arrayElemAt: ["$categoryInfo.name", 0] },
          totalValue: { $sum: { $multiply: ["$quantity", "$unitPrice"] } },
          totalQty: { $sum: "$quantity" },
        },
      },
      { $sort: { totalValue: -1 } },
    ])

    const chartData = {
      labels: data.map((d) => d._id || "Uncategorized"),
      values: data.map((d) => d.totalValue),
      quantities: data.map((d) => d.totalQty),
    }

    return NextResponse.json(chartData)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Failed to fetch inventory value by category" }, { status: 500 })
  }
}
