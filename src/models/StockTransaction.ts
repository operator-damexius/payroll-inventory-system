import mongoose, { Schema, Document, Model } from "mongoose"

export type StockMovementType = "STOCK_IN" | "STOCK_OUT" | "ADJUSTMENT"

export interface IStockTransaction extends Document {
  product: mongoose.Types.ObjectId
  type: StockMovementType
  quantity: number
  previousQuantity: number
  newQuantity: number
  reason?: string
  reference?: string
  userId?: mongoose.Types.ObjectId
  createdAt: Date
}

const stockTransactionSchema = new Schema<IStockTransaction>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    type: {
      type: String,
      enum: ["STOCK_IN", "STOCK_OUT", "ADJUSTMENT"],
      required: true,
    },
    quantity: { type: Number, required: true },
    previousQuantity: { type: Number, required: true },
    newQuantity: { type: Number, required: true },
    reason: { type: String, trim: true },
    reference: { type: String, trim: true },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
)

stockTransactionSchema.index({ product: 1, createdAt: -1 })
stockTransactionSchema.index({ type: 1, createdAt: -1 })

export const StockTransaction: Model<IStockTransaction> =
  mongoose.models.StockTransaction ||
  mongoose.model<IStockTransaction>("StockTransaction", stockTransactionSchema)
