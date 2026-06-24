import { NextRequest, NextResponse } from "next/server";
import { readSession, SESSION_COOKIE_NAME } from "@/lib/crypto";
import { createServiceSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/**
 * GET /api/dinlemeler
 * SADECE giriş yapan kullanıcının dinlemelerini döndürür (kişiye özel).
 * Oturum yoksa boş liste + giris:false.
 */
export async function GET(req: NextRequest) {
  const userId = readSession(req.cookies.get(SESSION_COOKIE_NAME)?.value);
  if (!userId) {
    return NextResponse.json({ giris: false, dinlemeler: [] });
  }

  const supabase = createServiceSupabase();
  const { data, error } = await supabase
    .from("dinlemeler")
    .select("*")
    .eq("kullanici_id", userId)
    .order("dinlenme_sayisi", { ascending: false })
    .order("son_dinlenme", { ascending: false })
    .limit(100); // ilk 100 (100+ premium)

  if (error) {
    return NextResponse.json({ giris: true, hata: error.message }, { status: 500 });
  }

  return NextResponse.json({ giris: true, dinlemeler: data ?? [] });
}
