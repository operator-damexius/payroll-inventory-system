import mongoose, { Schema, Document, Model } from "mongoose"

export type FiscalYearStatus = "OPEN" | "CLOSED"

export interface IFiscalYear extends Document {
  name: string
  startDate: Date
  endDate: Date
  status: FiscalYearStatus
  isDefault: boolean
  createdAt: Date
  updatedAt: Date
}

const fiscalYearSchema = new Schema<IFiscalYear>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["OPEN", "CLOSED"],
      required: true,
      default: "OPEN",
    },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
)

// Only one default fiscal year at a time
fiscalYearSchema.pre("save", async function (next) {
  if (this.isDefault) {
    await mongoose.model<IFiscalYear>("FiscalYear").updateMany(
      { _id: { $ne: this._id }, isDefault: true },
      { isDefault: false }
    )
  }
  next()
})

fiscalYearSchema.index({ startDate: 1, endDate: 1 })
fiscalYearSchema.index({ status: 1 })

export const FiscalYear: Model<IFiscalYear> =
  mongoose.models.FiscalYear ||
  mongoose.model<IFiscalYear>("FiscalYear", fiscalYearSchema)
