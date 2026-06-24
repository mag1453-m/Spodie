import { createServiceSupabase } from "./supabase";
import { getValidAccessToken, getRecentlyPlayed } from "./spotify";
import type { Kullanici } from "./types";

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
  const accessToken = await getValidAccessToken(user);

  // Takip SADECE recently-played ile yapılıyor (Spotify zaten 30sn+ çalınanları
  // "dinlenmiş" sayar). currently-playing'i ÇEKMİYORUZ → istek sayısı yarıya iner,
  // 429 (rate limit) riski düşer. Bir şarkı bittiğinde recently-played onu yakalar.
  const sayilan = await isleRecentlyPlayed(user, accessToken);
  return sayilan > 0 ? "sayildi" : "izleniyor";
}

/**
 * Son çalınanları işle. Spotify zaten "dinlenmiş" saydığı şarkıları döndürür
 * (genelde 30sn+ çalınanlar), o yüzden burada eşik kontrolü yok — gelen her şey sayılır.
 * `son_recent_played_at`'ten sonrasını çekeriz, böylece aynı şarkı tekrar tekrar sayılmaz.
 */
async function isleRecentlyPlayed(user: Kullanici, accessToken: string): Promise<number> {
  const supabase = createServiceSupabase();

  // Spotify'ın verdiği son 50 dinlemeyi al. Filtrelemeye GÜVENMİYORUZ —
  // her olayı (track_id + played_at) benzersiz olarak eklemeyi deniyoruz.
  // Zaten kayıtlı olan (aynı an) çakışıp atlanır → ŞİŞME OLMAZ.
  const items = await getRecentlyPlayed(accessToken);
  if (items.length === 0) return 0;

  let sayilan = 0;
  for (const it of items) {
    const sanatci = it.track.artists.map((a) => a.name).join(", ");
    const kapak = it.track.album.images?.[0]?.url ?? null;

    const { data, error } = await supabase.rpc("dinleme_olay_ekle", {
      p_kullanici_id: user.id,
      p_track_id: it.track.id,
      p_sarki_adi: it.track.name,
      p_sanatci: sanatci,
      p_kapak_url: kapak,
      p_played_at: it.played_at,
    });
    if (error) throw new Error(`dinleme_olay_ekle: ${error.message}`);
    if (data === true) sayilan++; // sadece gerçekten YENİ olaylar sayılır
  }

  return sayilan;
}
