import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import { User } from "@/models/User"
import { signToken } from "@/lib/auth"
import { logAudit } from "@/lib/audit-log"
import { registerSchema, type RegisterInput } from "@/lib/validation"
import { rateLimit, getClientIp } from "@/lib/rate-limit"
import { setCsrfCookie } from "@/lib/csrf.server"

export async function POST(req: Request) {
  try {
    // Rate limiting: 5 attempts per 15 minutes per IP
    const ip = getClientIp(req)
    const limit = rateLimit(ip)
    if (!limit.allowed) {
      await logAudit({
        action: "REGISTER_RATE_LIMITED",
        module: "AUTH",
        details: { ip, reason: "rate_limit_exceeded" },
        ipAddress: ip,
        userAgent: req.headers.get("user-agent") || undefined,
      })
      return NextResponse.json(
        { error: "Too many registration attempts. Please try again later." },
        { status: 429 }
      )
    }

    await dbConnect()

    const body = await req.json()
    const parsed = registerSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const input: RegisterInput = parsed.data

    const existing = await User.findOne({ email: input.email })
    if (existing) {
      await logAudit({
        action: "REGISTER_FAILED",
        module: "AUTH",
        details: { email: input.email, reason: "email_exists" },
        ipAddress: req.headers.get("x-forwarded-for") || undefined,
        userAgent: req.headers.get("user-agent") || undefined,
      })
      return NextResponse.json({ error: "Email already registered" }, { status: 400 })
    }

    const user = await User.create({
      email: input.email,
      password: input.password,
      name: input.name,
      role: input.role,
      isActive: true,
    })

    await logAudit({
      action: "REGISTER",
      module: "AUTH",
      recordId: user._id.toString(),
      details: { email: input.email, name: input.name, role: user.role },
      ipAddress: req.headers.get("x-forwarded-for") || undefined,
      userAgent: req.headers.get("user-agent") || undefined,
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
    setCsrfCookie(res)

    return res
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Registration failed" }, { status: 500 })
  }
}
