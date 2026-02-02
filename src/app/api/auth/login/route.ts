import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

const APP_PASSWORD = process.env.APP_PASSWORD || "Fuenlabradafa01"
const COOKIE_NAME = "prestamos-auth"
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30 // 30 days

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { password } = body as { password: string }

  if (password !== APP_PASSWORD) {
    return NextResponse.json(
      { error: "Contraseña incorrecta" },
      { status: 401 }
    )
  }

  const token = Buffer.from(`authenticated:${Date.now()}`).toString("base64")

  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  })

  return NextResponse.json({ success: true })
}
