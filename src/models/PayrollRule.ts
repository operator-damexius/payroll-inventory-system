import mongoose, { Schema, Document, Model } from "mongoose"

export type AllowanceType = "RICE" | "TRANSPORT" | "MEDICAL" | "OTHER"
export type DeductionType = "SSS" | "PHILHEALTH" | "PAGIBIG" | "TAX" | "ABSENT" | "OTHER"
export type OTRuleType = "REGULAR_DAY" | "REST_DAY" | "SPECIAL_HOLIDAY" | "REGULAR_HOLIDAY"

export interface IPayrollRule extends Document {
  ruleName: string
  isActive: boolean
  effectiveDate: Date
  // Allowances
  riceAllowance: number
  transportAllowance: number
  medicalAllowance: number
  otherAllowance: number
  // Deductions (fixed amounts or percentages)
  sssContribution: number
  philhealthContribution: number
  pagibigContribution: number
  taxWithholding: number
  // Overtime multipliers
  otRegularDay: number
  otRestDay: number
  otSpecialHoliday: number
  otRegularHoliday: number
  createdAt: Date
  updatedAt: Date
}

const payrollRuleSchema = new Schema<IPayrollRule>(
  {
    ruleName: { type: String, required: true, trim: true },
    isActive: { type: Boolean, default: true },
    effectiveDate: { type: Date, required: true },
    riceAllowance: { type: Number, default: 0, min: 0 },
    transportAllowance: { type: Number, default: 0, min: 0 },
    medicalAllowance: { type: Number, default: 0, min: 0 },
    otherAllowance: { type: Number, default: 0, min: 0 },
    sssContribution: { type: Number, default: 0, min: 0 },
    philhealthContribution: { type: Number, default: 0, min: 0 },
    pagibigContribution: { type: Number, default: 0, min: 0 },
    taxWithholding: { type: Number, default: 0, min: 0 },
    otRegularDay: { type: Number, default: 1.25, min: 0 },
    otRestDay: { type: Number, default: 1.30, min: 0 },
    otSpecialHoliday: { type: Number, default: 1.30, min: 0 },
    otRegularHoliday: { type: Number, default: 2.00, min: 0 },
  },
  { timestamps: true }
)

export const PayrollRule: Model<IPayrollRule> =
  mongoose.models.PayrollRule || mongoose.model<IPayrollRule>("PayrollRule", payrollRuleSchema)
