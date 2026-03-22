import { NextResponse } from "next/server"
import { requireAdminSession } from "@/lib/admin"
import { readSubmissions } from "@/lib/player-submissions"

export async function GET(request: Request) {
  const authorized = await requireAdminSession()
  if (!authorized) {
    return NextResponse.json({ error: "Доступ запрещён." }, { status: 401 })
  }

  const submissions = readSubmissions()
  return NextResponse.json({ submissions })
}
