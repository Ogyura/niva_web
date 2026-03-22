import { NextResponse } from "next/server"
import { ADMIN_PANEL_KEY, requireAdminSession } from "@/lib/admin"

export async function GET() {
  const authorized = await requireAdminSession()
  if (!authorized) {
    return NextResponse.json({ error: "Access denied." }, { status: 401 })
  }

  return NextResponse.json({ key: ADMIN_PANEL_KEY })
}
