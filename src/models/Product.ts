import mongoose, { Schema, Document, Model } from "mongoose"

export interface IProduct extends Document {
  sku: string
  name: string
  description?: string
  category?: mongoose.Types.ObjectId
  supplier?: mongoose.Types.ObjectId
  quantity: number
  reorderLevel: number
  unitPrice: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const productSchema = new Schema<IProduct>(
  {
    sku: { type: String, required: true, unique: true, trim: true, uppercase: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    category: { type: Schema.Types.ObjectId, ref: "Category" },
    supplier: { type: Schema.Types.ObjectId, ref: "Supplier" },
    quantity: { type: Number, required: true, default: 0, min: 0 },
    reorderLevel: { type: Number, required: true, default: 5, min: 0 },
    unitPrice: { type: Number, required: true, default: 0, min: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
)

productSchema.index({ category: 1 })
productSchema.index({ supplier: 1 })
productSchema.index({ quantity: 1 })

export const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>("Product", productSchema)
