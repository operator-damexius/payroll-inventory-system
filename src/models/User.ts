import mongoose, { Schema, Document, Model } from "mongoose"
import bcrypt from "bcryptjs"

export type UserRole = "ADMIN" | "HR_PAYROLL" | "INVENTORY" | "EMPLOYEE"

export interface IUser extends Document {
  email: string
  password: string
  role: UserRole
  name: string
  isActive: boolean
  comparePassword(candidatePassword: string): Promise<boolean>
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ["ADMIN", "HR_PAYROLL", "INVENTORY", "EMPLOYEE"],
      required: true,
      default: "EMPLOYEE",
    },
    name: { type: String, required: true, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
)

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next()
  this.password = await bcrypt.hash(this.password, 10)
  next()
})

userSchema.methods.comparePassword = async function (candidatePassword: string) {
  return bcrypt.compare(candidatePassword, this.password)
}

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", userSchema)
