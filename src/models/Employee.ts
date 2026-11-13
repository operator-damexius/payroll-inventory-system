import mongoose, { Schema, Document, Model } from "mongoose"

export type EmploymentStatus = "ACTIVE" | "INACTIVE" | "TERMINATED"

export interface IEmployee extends Document {
  employeeNumber: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  address?: string
  position: string
  department: string
  employmentStatus: EmploymentStatus
  basicSalary: number
  hireDate: Date
  userId?: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const employeeSchema = new Schema<IEmployee>(
  {
    employeeNumber: { type: String, required: true, unique: true, trim: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    address: { type: String, trim: true },
    position: { type: String, required: true, trim: true },
    department: { type: String, required: true, trim: true },
    employmentStatus: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "TERMINATED"],
      required: true,
      default: "ACTIVE",
    },
    basicSalary: { type: Number, required: true, min: 0 },
    hireDate: { type: Date, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
)

employeeSchema.index({ email: 1 }, { unique: true })

export const Employee: Model<IEmployee> =
  mongoose.models.Employee || mongoose.model<IEmployee>("Employee", employeeSchema)
