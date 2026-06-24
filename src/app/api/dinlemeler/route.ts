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

  // Premium mi? (kolon yoksa false)
  const { data: u } = await supabase
    .from("kullanicilar")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  const premium = u?.premium ?? false;

  // Toplam farklı şarkı sayısı (kilitli kaç şarkı var bilgisini UI'a vermek için)
  const { count: toplam } = await supabase
    .from("dinlemeler")
    .select("*", { count: "exact", head: true })
    .eq("kullanici_id", userId);

  // Ücretsiz: ilk 100 — Premium: sınırsız
  const LIMIT = premium ? 100000 : 100;
  const { data, error } = await supabase
    .from("dinlemeler")
    .select("*")
    .eq("kullanici_id", userId)
    .order("dinlenme_sayisi", { ascending: false })
    .order("son_dinlenme", { ascending: false })
    .limit(LIMIT);

  if (error) {
    return NextResponse.json({ giris: true, hata: error.message }, { status: 500 });
  }

  return NextResponse.json({
    giris: true,
    premium,
    toplam: toplam ?? (data?.length ?? 0),
    dinlemeler: data ?? [],
  });
}
