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
};

/** Supabase `kullanicilar` tablosundaki bir satır (token saklama). */
export type Kullanici = {
  id: string; // Spotify user id
  display_name: string | null;
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

/** Spotify "currently playing" yanıtının kullandığımız kısmı. */
export type SpotifyNowPlaying = {
  is_playing: boolean;
  progress_ms: number;
  item: {
    id: string;
    name: string;
    duration_ms: number;
    artists: { name: string }[];
    album: {
      name: string;
      images: { url: string; width: number; height: number }[];
    };
  } | null;
};
