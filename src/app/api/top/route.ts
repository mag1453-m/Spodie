import { NextRequest, NextResponse } from "next/server";
import { readSession, SESSION_COOKIE_NAME } from "@/lib/crypto";
import { createServiceSupabase } from "@/lib/supabase";
import { getValidAccessToken, getTopTracks, getTopArtists } from "@/lib/spotify";
import type { Kullanici, TopAralik } from "@/lib/types";

export const dynamic = "force-dynamic";

/**
 * GET /api/top?tur=tracks|artists&aralik=kisa|orta|uzun
 * Spotify'ın "en çok dinlenen" verisini döndürür. PREMIUM gerektirir.
 * Giriş yoksa 401, premium değilse 403.
 */
export async function GET(req: NextRequest) {
  const userId = readSession(req.cookies.get(SESSION_COOKIE_NAME)?.value);
  if (!userId) {
    return NextResponse.json({ hata: "giris_gerekli" }, { status: 401 });
  }

  const supabase = createServiceSupabase();
  const { data: u } = await supabase
    .from("kullanicilar")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (!u) {
    return NextResponse.json({ hata: "kullanici_yok" }, { status: 401 });
  }
  // Premium özellik — premium değilse 403 (sayfa kilit kutusu gösterir)
  if (!u.premium) {
    return NextResponse.json({ hata: "premium_gerekli", premium: false }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const tur = searchParams.get("tur") === "artists" ? "artists" : "tracks";
  const aralikParam = searchParams.get("aralik");
  const aralik: TopAralik =
    aralikParam === "orta" ? "orta" : aralikParam === "uzun" ? "uzun" : "kisa";

  try {
    const accessToken = await getValidAccessToken(u as Kullanici);
    if (tur === "artists") {
      const data = await getTopArtists(accessToken, aralik);
      return NextResponse.json({ premium: true, tur, aralik, ogeler: data });
    } else {
      const data = await getTopTracks(accessToken, aralik);
      return NextResponse.json({ premium: true, tur, aralik, ogeler: data });
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : "hata";
    return NextResponse.json({ hata: msg }, { status: 500 });
  }
}
