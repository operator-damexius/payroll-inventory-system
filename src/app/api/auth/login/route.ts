import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import { User } from "@/models/User"
import { signToken } from "@/lib/auth"
import { logAudit } from "@/lib/audit-log"
import { loginSchema, type LoginInput } from "@/lib/validation"
import { rateLimit, getClientIp } from "@/lib/rate-limit"
import { setCsrfCookie } from "@/lib/csrf.server"

export async function POST(req: Request) {
  try {
    // Rate limiting: 5 attempts per 15 minutes per IP
    const ip = getClientIp(req)
    const limit = rateLimit(ip)
    if (!limit.allowed) {
      await logAudit({
        action: "LOGIN_RATE_LIMITED",
        module: "AUTH",
        details: { ip, reason: "rate_limit_exceeded" },
        ipAddress: ip,
        userAgent: req.headers.get("user-agent") || undefined,
      })
      return NextResponse.json(
        { error: "Too many login attempts. Please try again later." },
        { status: 429 }
      )
    }

    await dbConnect()

    const body = await req.json()
    const parsed = loginSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const input: LoginInput = parsed.data

    const user = await User.findOne({ email: input.email }).select("+password")
    if (!user) {
      await logAudit({
        action: "LOGIN_FAILED",
        module: "AUTH",
        details: { email: input.email, reason: "user_not_found" },
        ipAddress: req.headers.get("x-forwarded-for") || undefined,
        userAgent: req.headers.get("user-agent") || undefined,
      })
      return NextResponse.json(
        { error: "Invalid email or password. Please check your credentials." },
        { status: 401 }
      )
    }

    const isMatch = await user.comparePassword(input.password)
    if (!isMatch) {
      await logAudit({
        action: "LOGIN_FAILED",
        module: "AUTH",
        details: { email: input.email, reason: "invalid_password" },
        ipAddress: req.headers.get("x-forwarded-for") || undefined,
        userAgent: req.headers.get("user-agent") || undefined,
      })
      return NextResponse.json(
        { error: "Invalid email or password. Please check your credentials." },
        { status: 401 }
      )
    }

    const token = signToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    })

    await logAudit({
      action: "LOGIN",
      module: "AUTH",
      recordId: user._id.toString(),
      details: { email: input.email, role: user.role },
      ipAddress: req.headers.get("x-forwarded-for") || undefined,
      userAgent: req.headers.get("user-agent") || undefined,
    })

    const res = NextResponse.json({ message: "Logged in", user: { id: user._id, email: user.email, role: user.role } })
    res.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
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
  } catch (err: any) {
    console.error("Login error:", err)
    return NextResponse.json({ error: "Login failed: " + err.message }, { status: 500 })
  }
}
