import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import { StockTransaction } from "@/models/StockTransaction"
import { Product } from "@/models/Product"
import { getSession, isAllowed } from "@/lib/auth"
import type { UserRole } from "@/types"
import mongoose from "mongoose"
import { logAudit } from "@/lib/audit-log"
import { verifyCsrfToken } from "@/lib/csrf.server"

export async function GET(req: Request) {
  try {
    const session = getSession()
    if (!session || !isAllowed(session.role as UserRole, ["ADMIN", "INVENTORY"])) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    await dbConnect()

    const { searchParams } = new URL(req.url)
    const productId = searchParams.get("productId")
    const limit = parseInt(searchParams.get("limit") || "50")

    let query: any = {}
    if (productId) query.product = productId

    const transactions = await StockTransaction.find(query)
      .populate("product", "sku name")
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()

    return NextResponse.json({ data: transactions })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Failed to fetch stock transactions" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const csrf = verifyCsrfToken(req)
    if (!csrf.valid) {
      return csrf.response!
    }

    const session = getSession()
    if (!session || !isAllowed(session.role as UserRole, ["ADMIN", "INVENTORY"])) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    await dbConnect()

    const { productId, type, quantity, reason, reference } = await req.json()

    if (!productId || !type || !quantity) {
      return NextResponse.json({ error: "Product, type, and quantity are required" }, { status: 400 })
    }

    const sessionMongo = await mongoose.startSession()
    sessionMongo.startTransaction()

    try {
      const product = await Product.findById(productId).session(sessionMongo)

      if (!product) {
        await sessionMongo.abortTransaction()
        return NextResponse.json({ error: "Product not found" }, { status: 404 })
      }

      const previousQuantity = product.quantity
      let newQuantity = previousQuantity

      if (type === "STOCK_IN") {
        newQuantity = previousQuantity + Number(quantity)
      } else if (type === "STOCK_OUT") {
        newQuantity = previousQuantity - Number(quantity)
        if (newQuantity < 0) {
          await sessionMongo.abortTransaction()
          return NextResponse.json(
            { error: "Insufficient stock" },
            { status: 400 }
          )
        }
      } else if (type === "ADJUSTMENT") {
        newQuantity = Number(quantity)
      }

      product.quantity = newQuantity
      await product.save({ session: sessionMongo })

      const transaction = await StockTransaction.create(
        [
          {
            product: productId,
            type,
            quantity: Number(quantity),
            previousQuantity,
            newQuantity,
            reason,
            reference,
            userId: new mongoose.Types.ObjectId(session.userId),
          },
        ],
        { session: sessionMongo }
      )

      await sessionMongo.commitTransaction()

      await logAudit({
        action: type,
        module: "STOCK",
        recordId: productId,
        details: {
          productId,
          type,
          quantity: Number(quantity),
          previousQuantity,
          newQuantity,
          reason,
          reference,
        },
        ipAddress: req.headers.get("x-forwarded-for") || undefined,
        userAgent: req.headers.get("user-agent") || undefined,
      })

      return NextResponse.json({ transaction: transaction[0], product }, { status: 201 })
    } catch (err) {
      await sessionMongo.abortTransaction()
      throw err
    } finally {
      await sessionMongo.endSession()
    }
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Failed to record stock movement" }, { status: 500 })
  }
}
