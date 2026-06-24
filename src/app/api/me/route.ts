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

  // avatar_url kolonu henüz eklenmemiş olabilir → önce onunla dene, hata olursa onsuz.
  let data: { id: string; display_name: string | null; avatar_url?: string | null } | null = null;
  const ilk = await supabase
    .from("kullanicilar")
    .select("id, display_name, avatar_url")
    .eq("id", userId)
    .maybeSingle();

  if (ilk.error) {
    // Büyük ihtimal "column avatar_url does not exist" → avatarsız tekrar dene
    const yedek = await supabase
      .from("kullanicilar")
      .select("id, display_name")
      .eq("id", userId)
      .maybeSingle();
    data = yedek.data;
  } else {
    data = ilk.data;
  }

  if (!data) {
    // Çerez var ama kullanıcı DB'de yok (silinmiş olabilir) → giriş yok say
    return NextResponse.json({ user: null });
  }

  return NextResponse.json({
    user: {
      id: data.id,
      display_name: data.display_name,
      avatar_url: data.avatar_url ?? null,
    },
  });
}
