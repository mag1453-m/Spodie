// ─────────────────────────────────────────────
// Ortak tipler — hem sunucu hem arayüz kullanır.
// ─────────────────────────────────────────────

/** Supabase `dinlemeler` tablosundaki bir satır. */
export type Dinleme = {
  id: string;
  kullanici_id: string;
  track_id: string;
  sarki_adi: string;
  sanatci: string;
  kapak_url: string | null;
  dinlenme_sayisi: number;
  son_dinlenme: string; // ISO timestamp
  ilk_dinlenme: string | null; // ISO timestamp — şarkının ilk kaydedildiği an
};

/** Supabase `kullanicilar` tablosundaki bir satır (token saklama). */
export type Kullanici = {
  id: string; // Spotify user id
  display_name: string | null;
  avatar_url: string | null; // Spotify profil resmi
  premium: boolean; // premium üye mi
  refresh_token: string; // şifreli saklanır
  access_token: string | null; // şifreli, kısa ömürlü
  access_token_expires_at: string | null; // ISO timestamp
  son_calan_track_id: string | null; // tekrar saymayı önlemek için
  son_calan_progress_ms: number | null;
  son_recent_played_at: string | null; // son recently-played çekim noktası
  olusturulma: string;
};

/** Spotify "recently played" yanıtındaki bir öğe. */
export type SpotifyRecentItem = {
  played_at: string; // ISO timestamp
  track: {
    id: string;
    name: string;
    duration_ms: number;
    artists: { name: string }[];
    album: {
      images: { url: string; width: number; height: number }[];
    };
  };
};

/** Spotify "top tracks" öğesi (en çok dinlenen şarkı). */
export type TopTrack = {
  id: string;
  isim: string;
  sanatci: string;
  kapak_url: string | null;
};

/** Spotify "top artists" öğesi (en çok dinlenen sanatçı). */
export type TopArtist = {
  id: string;
  isim: string;
  resim_url: string | null;
  tur: string | null; // birincil müzik türü
};

/** Top Items zaman aralığı. */
export type TopAralik = "kisa" | "orta" | "uzun"; // 4 hafta / 6 ay / tüm zamanlar
