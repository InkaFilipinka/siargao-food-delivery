import { NextResponse } from "next/server";

/** GET /api/admin/status - Whether admin requires staff token */
export async function GET() {
  const authRequired = !!process.env.STAFF_TOKEN;
  return NextResponse.json({ authRequired });
}
