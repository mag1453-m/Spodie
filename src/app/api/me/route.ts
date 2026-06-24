import { NextRequest, NextResponse } from "next/server";
import { readSession, SESSION_COOKIE_NAME } from "@/lib/crypto";
import { createServiceSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/**
 * GET /api/me
 * Oturum çerezini okur. Giriş yapılmışsa kullanıcının id + display_name döner.
 * Giriş yoksa { user: null }.
 */
export async function GET(req: NextRequest) {
  const cookie = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const userId = readSession(cookie);
  if (!userId) {
    return NextResponse.json({ user: null });
  }

  const supabase = createServiceSupabase();

  // select("*") → hangi kolonlar varsa gelir (avatar_url/premium henüz yoksa bile kırılmaz)
  const { data } = await supabase
    .from("kullanicilar")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (!data) {
    // Çerez var ama kullanıcı DB'de yok (silinmiş olabilir) → giriş yok say
    return NextResponse.json({ user: null });
  }

  return NextResponse.json({
    user: {
      id: data.id,
      display_name: data.display_name,
      avatar_url: data.avatar_url ?? null,
      premium: data.premium ?? false,
    },
  });
}
