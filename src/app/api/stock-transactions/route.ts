import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import { StockTransaction } from "@/models/StockTransaction"
import { getSession, isAllowed } from "@/lib/auth"
import type { UserRole } from "@/types"

export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  try {
    const session = getSession()
    if (!session || !isAllowed(session.role as UserRole, ["ADMIN", "INVENTORY"])) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    await dbConnect()
    const stockTransactions = await StockTransaction.find().sort({ createdAt: -1 }).lean()
    return NextResponse.json({ data: stockTransactions })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Failed to fetch stock transactions" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = getSession()
    if (!session || !isAllowed(session.role as UserRole, ["ADMIN", "INVENTORY"])) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    await dbConnect()
    const { productId, type, quantity, reason } = await req.json()

    if (!productId || !type || !quantity) {
      return NextResponse.json({ error: "Product ID, type, and quantity are required" }, { status: 400 })
    }

    const stockTransaction = await StockTransaction.create({
      productId,
      type,
      quantity: Number(quantity),
      reason,
      performedBy: session.userId,
    })

    return NextResponse.json({ stockTransaction }, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Failed to record stock transaction" }, { status: 500 })
  }
}