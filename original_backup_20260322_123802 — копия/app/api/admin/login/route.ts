import { NextResponse } from "next/server"
import { createAdminSessionCookie, verifyAdminKey } from "@/lib/admin"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const key = String(body.key || "")

    if (!verifyAdminKey(key)) {
      return NextResponse.json({ error: "Неверный ключ админки." }, { status: 401 })
    }

    await createAdminSessionCookie()
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "Ошибка входа в админку." }, { status: 500 })
  }
}
