import { NextResponse } from "next/server"
import { createSubmission, exportLegacyJsonSnapshot } from "@/lib/player-submissions"

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const username = String(body.username || "").trim()
    const email = String(body.email || "").trim()
    const phone = String(body.phone || "").trim()
    const telegram = String(body.telegram || "").trim()
    const company = String(body.company || "").trim()
    const note = String(body.note || "").trim()
    const score = Number(body.score || 0)
    const distance = Number(body.distance || 0)

    if (!username || username.length < 2) {
      return NextResponse.json({ error: "Укажите имя игрока." }, { status: 400 })
    }

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Укажите корректный email." }, { status: 400 })
    }

    if (!Number.isFinite(score) || !Number.isFinite(distance)) {
      return NextResponse.json({ error: "Некорректный результат игры." }, { status: 400 })
    }

    const created = createSubmission({
      username,
      email,
      phone,
      telegram,
      company,
      note,
      score,
      distance,
    })

    exportLegacyJsonSnapshot()

    return NextResponse.json({ ok: true, submission: created })
  } catch {
    return NextResponse.json({ error: "Не удалось сохранить данные игрока." }, { status: 500 })
  }
}
