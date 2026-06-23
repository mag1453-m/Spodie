import { createServiceSupabase } from "./supabase";
import { getValidAccessToken, getNowPlaying, getRecentlyPlayed } from "./spotify";
import type { Kullanici } from "./types";

// Bir şarkının "dinlendi" sayılması için gereken minimum süre (ms)
export const DINLENDI_ESIGI_MS = 40_000;

/** Tüm kullanıcılar için bir takip turu çalıştır. */
export async function takipTuru(): Promise<{
  islenen: number;
  sayildi: number;
  sonuc: { kullanici: string; durum: string }[];
}> {
  const supabase = createServiceSupabase();
  const { data, error } = await supabase.from("kullanicilar").select("*");
  if (error) throw new Error(error.message);

  const sonuc: { kullanici: string; durum: string }[] = [];
  let sayildi = 0;

  for (const user of (data ?? []) as Kullanici[]) {
    try {
      const durum = await isleKullanici(user);
      if (durum === "sayildi") sayildi++;
      sonuc.push({ kullanici: user.id, durum });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "hata";
      sonuc.push({ kullanici: user.id, durum: `hata: ${msg}` });
    }
  }

  return { islenen: sonuc.length, sayildi, sonuc };
}

/** Tek bir kullanıcı için bir tur işle. */
async function isleKullanici(user: Kullanici): Promise<string> {
  const supabase = createServiceSupabase();
  const accessToken = await getValidAccessToken(user);

  // ── 1) ÖNCE: son çalınanları yakala (site/bilgisayar kapalıyken kaçanlar dahil) ──
  // Bu sayede cron, iki yoklama arasında telefonda/başka yerde dinlediklerini de toplar.
  await isleRecentlyPlayed(user, accessToken);

  // ── 2) SONRA: şu an çalanı işle (40sn eşiği için anlık takip) ──
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

  // Yeni oynatma: track değişti VEYA aynı track baştan başladı (progress geriye gitti)
  const yeniOynatma = trackId !== oncekiTrack || progress < oncekiProgress - 2000;
  // Bu oynatmada zaten saydık mı?
  const oncedenSayildi =
    trackId === oncekiTrack && !yeniOynatma && oncekiProgress >= DINLENDI_ESIGI_MS;

  let durum = "izleniyor";
  if (progress >= DINLENDI_ESIGI_MS && !oncedenSayildi) {
    const sanatci = np.item.artists.map((a) => a.name).join(", ");
    const kapak = np.item.album.images?.[0]?.url ?? null;
    const { error } = await supabase.rpc("dinleme_kaydet", {
      p_kullanici_id: user.id,
      p_track_id: trackId,
      p_sarki_adi: np.item.name,
      p_sanatci: sanatci,
      p_kapak_url: kapak,
    });
    if (error) throw new Error(`dinleme_kaydet: ${error.message}`);
    durum = "sayildi";
  }

  await supabase
    .from("kullanicilar")
    .update({ son_calan_track_id: trackId, son_calan_progress_ms: progress })
    .eq("id", user.id);

  return durum;
}

/**
 * Son çalınanları işle. Spotify zaten "dinlenmiş" saydığı şarkıları döndürür
 * (genelde 30sn+ çalınanlar), o yüzden burada eşik kontrolü yok — gelen her şey sayılır.
 * `son_recent_played_at`'ten sonrasını çekeriz, böylece aynı şarkı tekrar tekrar sayılmaz.
 */
async function isleRecentlyPlayed(user: Kullanici, accessToken: string): Promise<void> {
  const supabase = createServiceSupabase();

  const afterMs = user.son_recent_played_at
    ? new Date(user.son_recent_played_at).getTime()
    : undefined;

  const items = await getRecentlyPlayed(accessToken, afterMs);
  if (items.length === 0) return;

  // Eskiden yeniye doğru işleyelim ki en yeni played_at en sona yazılsın
  const sirali = [...items].sort(
    (a, b) => new Date(a.played_at).getTime() - new Date(b.played_at).getTime()
  );

  let enYeni = afterMs ?? 0;
  for (const it of sirali) {
    const playedMs = new Date(it.played_at).getTime();
    // afterMs verdiysek Spotify zaten sonrasını döndürür; yine de emniyet için kontrol
    if (afterMs && playedMs <= afterMs) continue;

    const sanatci = it.track.artists.map((a) => a.name).join(", ");
    const kapak = it.track.album.images?.[0]?.url ?? null;
    const { error } = await supabase.rpc("dinleme_kaydet", {
      p_kullanici_id: user.id,
      p_track_id: it.track.id,
      p_sarki_adi: it.track.name,
      p_sanatci: sanatci,
      p_kapak_url: kapak,
    });
    if (error) throw new Error(`recently dinleme_kaydet: ${error.message}`);
    if (playedMs > enYeni) enYeni = playedMs;
  }

  // Son çekim noktasını ilerlet
  if (enYeni > (afterMs ?? 0)) {
    await supabase
      .from("kullanicilar")
      .update({ son_recent_played_at: new Date(enYeni).toISOString() })
      .eq("id", user.id);
  }
}
