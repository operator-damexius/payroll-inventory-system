import mongoose, { Schema, Document, Model } from "mongoose"

export type PayslipStatus = "DRAFT" | "CALCULATED" | "APPROVED" | "PAID"

export interface IPayslip extends Document {
  payroll: mongoose.Types.ObjectId
  employee: mongoose.Types.ObjectId
  periodName: string
  startDate: Date
  endDate: Date
  basicPay: number
  allowances: number
  overtimePay: number
  grossPay: number
  totalDeductions: number
  netPay: number
  status: PayslipStatus
  preparedBy?: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const payslipSchema = new Schema<IPayslip>(
  {
    payroll: { type: Schema.Types.ObjectId, ref: "Payroll", required: true },
    employee: { type: Schema.Types.ObjectId, ref: "Employee", required: true },
    periodName: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    basicPay: { type: Number, required: true, default: 0 },
    allowances: { type: Number, required: true, default: 0 },
    overtimePay: { type: Number, required: true, default: 0 },
    grossPay: { type: Number, required: true, default: 0 },
    totalDeductions: { type: Number, required: true, default: 0 },
    netPay: { type: Number, required: true, default: 0 },
    status: {
      type: String,
      enum: ["DRAFT", "CALCULATED", "APPROVED", "PAID"],
      required: true,
      default: "DRAFT",
    },
    preparedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
)

// Prevent duplicate payslips for same employee in same payroll period
payslipSchema.index({ payroll: 1, employee: 1 }, { unique: true })

export const Payslip: Model<IPayslip> =
  mongoose.models.Payslip || mongoose.model<IPayslip>("Payslip", payslipSchema)
