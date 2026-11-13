import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"

export const dynamic = "force-dynamic"
import { Employee } from "@/models/Employee"
import { Product } from "@/models/Product"
import { Payroll } from "@/models/Payroll"
import { Payslip } from "@/models/Payslip"
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

    const [
      employeeCount,
      productCount,
      lowStockCount,
      pendingPayrollCount,
      totalPayslips,
    ] = await Promise.all([
      Employee.countDocuments(),
      Product.countDocuments({ isActive: true }),
      Product.countDocuments({
        isActive: true,
        $expr: { $lte: ["$quantity", "$reorderLevel"] },
      }),
      Payroll.countDocuments({
        status: { $nin: ["PAID", "LOCKED"] },
      }),
      Payslip.countDocuments(),
    ])

    return NextResponse.json({
      employeeCount,
      productCount,
      lowStockCount,
      pendingPayrollCount,
      totalPayslips,
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Failed to fetch dashboard overview" }, { status: 500 })
  }
}
