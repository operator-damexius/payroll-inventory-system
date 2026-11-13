import mongoose, { Schema, Document, Model } from "mongoose"

export interface IAuditLog extends Document {
  userId?: mongoose.Types.ObjectId
  userEmail?: string
  userRole?: string
  action: string
  module: string
  recordId?: string
  details?: Record<string, any>
  ipAddress?: string
  userAgent?: string
  createdAt: Date
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    userEmail: { type: String, trim: true },
    userRole: { type: String, trim: true },
    action: { type: String, required: true, trim: true },
    module: {
      type: String,
      required: true,
      trim: true,
      enum: ["AUTH", "EMPLOYEE", "PAYROLL", "PAYSLIP", "INVENTORY", "STOCK", "FISCAL_YEAR", "SETTINGS", "SYSTEM"],
    },
    recordId: { type: String, trim: true },
    details: { type: Schema.Types.Mixed },
    ipAddress: { type: String, trim: true },
    userAgent: { type: String, trim: true },
  },
  { timestamps: true }
)

auditLogSchema.index({ createdAt: -1 })
auditLogSchema.index({ module: 1, createdAt: -1 })
auditLogSchema.index({ userId: 1, createdAt: -1 })
auditLogSchema.index({ action: 1 })

export const AuditLog: Model<IAuditLog> =
  mongoose.models.AuditLog || mongoose.model<IAuditLog>("AuditLog", auditLogSchema)
