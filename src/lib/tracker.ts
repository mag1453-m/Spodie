import { createServiceSupabase } from "./supabase";
import { getValidAccessToken, getNowPlaying } from "./spotify";
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
