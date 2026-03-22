import { NextResponse } from "next/server"
import { requireAdminSession } from "@/lib/admin"

export async function GET() {
  const authorized = await requireAdminSession()
  return NextResponse.json({ authorized })
}
