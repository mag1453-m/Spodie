import { NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/crypto";

/**
 * GET /api/auth/logout
 * Oturum çerezini siler ve ana sayfaya döner.
 */
export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://127.0.0.1:3000";
  const res = NextResponse.redirect(`${siteUrl}/`);
  res.cookies.delete(SESSION_COOKIE_NAME);
  return res;
}
