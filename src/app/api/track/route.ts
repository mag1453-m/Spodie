import { NextRequest, NextResponse } from "next/server";
import { createServiceSupabase } from "@/lib/supabase";
import { getValidAccessToken, getNowPlaying } from "@/lib/spotify";
import type { Kullanici } from "@/lib/types";

// Vercel'de bu route'un her zaman dinamik çalışması ve cache'lenmemesi için
export const dynamic = "force-dynamic";
export const maxDuration = 60; // saniye (çok kullanıcıda zaman tanı)

// Bir şarkının "dinlendi" sayılması için gereken minimum süre (ms)
const DINLENDI_ESIGI_MS = 40_000;

/**
 * GET /api/track
 * Vercel Cron her dakika buraya çağrı atar. Tüm kullanıcılar için:
 *  - geçerli access token al (gerekirse yenile)
 *  - şu an çalanı sorgula
 *  - 40 sn+ çaldıysa ve bu şarkı henüz sayılmadıysa → sayacı artır (upsert)
 *  - durum izlemeyi (son_calan_*) güncelle ki tekrar sayılmasın
 *
 * Güvenlik: Authorization: Bearer <CRON_SECRET> bekler.
 */
export async function GET(req: NextRequest) {
  // ── Yetki kontrolü ──
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.get("authorization");
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ hata: "yetkisiz" }, { status: 401 });
  }

  const supabase = createServiceSupabase();

  const { data: kullanicilar, error } = await supabase
    .from("kullanicilar")
    .select("*");

  if (error) {
    return NextResponse.json({ hata: error.message }, { status: 500 });
  }

  const sonuc: { kullanici: string; durum: string }[] = [];

  for (const user of (kullanicilar ?? []) as Kullanici[]) {
    try {
      const durum = await isleKullanici(user);
      sonuc.push({ kullanici: user.id, durum });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "hata";
      sonuc.push({ kullanici: user.id, durum: `hata: ${msg}` });
    }
  }

  return NextResponse.json({ ok: true, islenen: sonuc.length, sonuc });
}

/**
 * Tek bir kullanıcı için bir tur takip işle.
 * Döndürdüğü string sadece teşhis amaçlı (loglarda görünür).
 */
async function isleKullanici(user: Kullanici): Promise<string> {
  const supabase = createServiceSupabase();
  const accessToken = await getValidAccessToken(user);
  const np = await getNowPlaying(accessToken);

  // Hiçbir şey çalmıyor → izlemeyi temizle (yeni başlangıçlar sayılabilsin)
  if (!np || !np.item || !np.is_playing) {
    if (user.son_calan_track_id !== null) {
      await supabase
        .from("kullanicilar")
        .update({ son_calan_track_id: null, son_calan_progress_ms: null })
        .eq("id", user.id);
    }
    return "calmiyor";
  }

  const trackId = np.item.id;
  const progress = np.progress_ms ?? 0;
  const oncekiTrack = user.son_calan_track_id;
  const oncekiProgress = user.son_calan_progress_ms ?? 0;

  // Bu şarkı "yeni bir oynatma" mı? İki durumda evet:
  //  a) track değişti
  //  b) aynı track ama baştan başladı (progress geriye gitti = yeniden başlatıldı)
  const yeniOynatma = trackId !== oncekiTrack || progress < oncekiProgress - 2000;

  // Bu şarkıyı bu oynatmada zaten saydık mı?
  // Saydığımızda son_calan_track_id'yi bu track'e sabitliyoruz; ama "sayıldı" bilgisini
  // ayrı tutmak için basit kural: aynı track devam ediyor ve önceki progress zaten
  // eşiği geçmişse → tekrar sayma.
  const oncedenSayildi =
    trackId === oncekiTrack && !yeniOynatma && oncekiProgress >= DINLENDI_ESIGI_MS;

  let durum = "izleniyor";

  if (progress >= DINLENDI_ESIGI_MS && !oncedenSayildi) {
    // SAY!
    const sanatci = np.item.artists.map((a) => a.name).join(", ");
    const kapak = np.item.album.images?.[0]?.url ?? null;

    const { error: rpcError } = await supabase.rpc("dinleme_kaydet", {
      p_kullanici_id: user.id,
      p_track_id: trackId,
      p_sarki_adi: np.item.name,
      p_sanatci: sanatci,
      p_kapak_url: kapak,
    });
    if (rpcError) throw new Error(`dinleme_kaydet: ${rpcError.message}`);
    durum = "sayildi";
  }

  // İzleme durumunu güncelle
  await supabase
    .from("kullanicilar")
    .update({
      son_calan_track_id: trackId,
      son_calan_progress_ms: progress,
    })
    .eq("id", user.id);

  return durum;
}
