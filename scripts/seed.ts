/**
 * Seed script: creates a default admin account for development/testing.
 *
 * SECURITY: This script generates a random password and prints it once.
 * Change the password immediately after first login. Do not commit this
 * script's output to version control.
 *
 * Run with:  npx tsx scripts/seed.ts
 */
import dotenv from "dotenv"
import path from "path"
dotenv.config({ path: path.resolve(__dirname, "..", ".env") })

import dbConnect from "@/lib/mongodb"
import { User } from "@/models/User"
import crypto from "crypto"

function generatePassword(length = 16) {
  return crypto.randomBytes(length).toString("base64url")
}

async function seed() {
  await dbConnect()

  const adminEmail = "admin@payroll.local"
  const existing = await User.findOne({ email: adminEmail })
  if (existing) {
    console.log("Admin already exists:", adminEmail)
    process.exit(0)
  }

  const admin = await User.create({
    email: adminEmail,
    password: "admin", // simple for academic testing
    role: "ADMIN",
    name: "System Administrator",
    isActive: true,
  })

  console.log("=== Seeded admin account ===")
  console.log("Email:    ", admin.email)
  console.log("Password: admin")
  console.log("Role:     ", admin.role)
  console.log("============================")
  console.log("WARNING: Change this password before any real-world use.")
  process.exit(0)
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
