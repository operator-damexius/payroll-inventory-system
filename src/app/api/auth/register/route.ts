import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import { User } from "@/models/User"
import { signToken } from "@/lib/auth"
import { logAudit } from "@/lib/audit-log"
import { registerSchema } from "@/lib/validation"

export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  try {
    const parsed = registerSchema.safeParse(await req.json())

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid registration data" }, { status: 400 })
    }

    const { email, password, name } = parsed.data

    await dbConnect()

    const existing = await User.findOne({ email })
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 })
    }

    // Self-registration always creates an EMPLOYEE account.
    // Elevated roles are only assigned through admin-managed employee records.
    const user = await User.create({
      email,
      password,
      name,
      role: "EMPLOYEE",
      isActive: true,
    })

    const token = signToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    })

    const res = NextResponse.json({ message: "Registered", user: { id: user._id, email: user.email, role: user.role } })
    res.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    })
    res.cookies.set("user_role", user.role, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    })

    return res
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Registration failed" }, { status: 500 })
  }
}