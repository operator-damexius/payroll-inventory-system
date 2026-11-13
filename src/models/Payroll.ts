import mongoose, { Schema, Document, Model } from "mongoose"

export type PayrollStatus = "DRAFT" | "PROCESSING" | "APPROVED" | "PAID" | "LOCKED"

export interface IPayroll extends Document {
  periodName: string
  startDate: Date
  endDate: Date
  status: PayrollStatus
  preparedBy?: mongoose.Types.ObjectId
  reviewedBy?: mongoose.Types.ObjectId
  approvedBy?: mongoose.Types.ObjectId
  preparedAt?: Date
  reviewedAt?: Date
  approvedAt?: Date
  totalGrossPay: number
  totalNetPay: number
  payslipCount: number
  createdAt: Date
  updatedAt: Date
}

const payrollSchema = new Schema<IPayroll>(
  {
    periodName: { type: String, required: true, trim: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["DRAFT", "PROCESSING", "APPROVED", "PAID", "LOCKED"],
      required: true,
      default: "DRAFT",
    },
    preparedBy: { type: Schema.Types.ObjectId, ref: "User" },
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
    approvedBy: { type: Schema.Types.ObjectId, ref: "User" },
    preparedAt: { type: Date },
    reviewedAt: { type: Date },
    approvedAt: { type: Date },
    totalGrossPay: { type: Number, default: 0 },
    totalNetPay: { type: Number, default: 0 },
    payslipCount: { type: Number, default: 0 },
  },
  { timestamps: true }
)

payrollSchema.index({ startDate: 1, endDate: 1 })

export const Payroll: Model<IPayroll> =
  mongoose.models.Payroll || mongoose.model<IPayroll>("Payroll", payrollSchema)
