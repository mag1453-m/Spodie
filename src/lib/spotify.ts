import { createServiceSupabase } from "./supabase";
import { encrypt, decrypt } from "./crypto";
import type {
  Kullanici,
  SpotifyNowPlaying,
  SpotifyRecentItem,
  TopTrack,
  TopArtist,
  TopAralik,
} from "./types";

// ── Sabitler ────────────────────────────────────────────────
const AUTH_URL = "https://accounts.spotify.com/authorize";
const TOKEN_URL = "https://accounts.spotify.com/api/token";
const API_BASE = "https://api.spotify.com/v1";

export const SPOTIFY_SCOPES = [
  "user-read-currently-playing",
  "user-read-recently-played",
  "user-read-playback-state",
  "user-top-read", // Spotify'ın "en çok dinlenen" (top) şarkı/sanatçı verisi
].join(" ");

function env(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`${name} tanımlı değil (.env.local).`);
  return v;
}

// ── 1) Giriş URL'si ─────────────────────────────────────────
/** Kullanıcıyı Spotify onay ekranına yollayacak URL'yi üretir. */
export function buildAuthorizeUrl(state: string): string {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: env("SPOTIFY_CLIENT_ID"),
    scope: SPOTIFY_SCOPES,
    redirect_uri: env("SPOTIFY_REDIRECT_URI"),
    state,
    show_dialog: "false",
  });
  return `${AUTH_URL}?${params.toString()}`;
}

// ── 2) Authorization code → token takası ────────────────────
type TokenResponse = {
  access_token: string;
  token_type: string;
  scope: string;
  expires_in: number; // saniye
  refresh_token?: string;
};

function basicAuthHeader(): string {
  const creds = `${env("SPOTIFY_CLIENT_ID")}:${env("SPOTIFY_CLIENT_SECRET")}`;
  return "Basic " + Buffer.from(creds).toString("base64");
}

export async function exchangeCodeForTokens(code: string): Promise<TokenResponse> {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: env("SPOTIFY_REDIRECT_URI"),
  });
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: basicAuthHeader(),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });
  if (!res.ok) {
    throw new Error(`Token takası başarısız: ${res.status} ${await res.text()}`);
  }
  return res.json();
}

// ── 3) Refresh token → yeni access token ────────────────────
export async function refreshAccessToken(refreshToken: string): Promise<TokenResponse> {
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: basicAuthHeader(),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });
  if (!res.ok) {
    throw new Error(`Token yenileme başarısız: ${res.status} ${await res.text()}`);
  }
  return res.json();
}

// ── 4) Kullanıcı profili ────────────────────────────────────
export async function getSpotifyProfile(accessToken: string): Promise<{
  id: string;
  display_name: string | null;
  avatar_url: string | null;
}> {
  // 429 (rate limit) gelirse Retry-After kadar bekleyip 1 kez daha dene.
  let res = await fetch(`${API_BASE}/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (res.status === 429) {
    const retry = Number(res.headers.get("retry-after") ?? "2");
    // Çok uzun beklemeyi engelle (en fazla 8 sn) — kullanıcıyı bekletmeyelim
    const bekle = Math.min(Math.max(retry, 1), 8) * 1000;
    await new Promise((r) => setTimeout(r, bekle));
    res = await fetch(`${API_BASE}/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  }

  if (!res.ok) {
    if (res.status === 429) {
      throw new Error("Spotify şu an çok yoğun (429). Lütfen birkaç dakika sonra tekrar dene.");
    }
    throw new Error(`Profil alınamadı: ${res.status}`);
  }
  const data = await res.json();
  return {
    id: data.id,
    display_name: data.display_name ?? null,
    // Spotify profil resmi (varsa en büyüğü)
    avatar_url: data.images?.[0]?.url ?? null,
  };
}

// ── 5) Kullanıcıyı DB'ye kaydet/güncelle (token'lar şifreli) ─
export async function upsertKullanici(opts: {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  refresh_token: string;
  access_token: string;
  expires_in: number;
}) {
  const supabase = createServiceSupabase();
  const expiresAt = new Date(Date.now() + opts.expires_in * 1000).toISOString();

  const temel = {
    id: opts.id,
    display_name: opts.display_name,
    refresh_token: encrypt(opts.refresh_token),
    access_token: encrypt(opts.access_token),
    access_token_expires_at: expiresAt,
  };

  // Önce avatar_url ile dene; kolon yoksa avatarsız kaydet (giriş kırılmasın).
  const ilk = await supabase
    .from("kullanicilar")
    .upsert({ ...temel, avatar_url: opts.avatar_url }, { onConflict: "id" });

  if (ilk.error) {
    const yedek = await supabase
      .from("kullanicilar")
      .upsert(temel, { onConflict: "id" });
    if (yedek.error) throw new Error(`Kullanıcı kaydedilemedi: ${yedek.error.message}`);
  }
}

// ── 6) Geçerli access token al (gerekirse yenile) ───────────
/**
 * DB'deki kullanıcı için kullanıma hazır (çözülmüş) access token döndürür.
 * Süresi dolmuşsa refresh token ile yeniler ve DB'yi günceller.
 */
export async function getValidAccessToken(user: Kullanici): Promise<string> {
  const supabase = createServiceSupabase();
  const now = Date.now();
  const expiresAt = user.access_token_expires_at
    ? new Date(user.access_token_expires_at).getTime()
    : 0;

  // 60 sn marjla hâlâ geçerliyse mevcut token'ı kullan
  if (user.access_token && expiresAt - 60_000 > now) {
    return decrypt(user.access_token);
  }

  // Yenile
  const refreshToken = decrypt(user.refresh_token);
  const tok = await refreshAccessToken(refreshToken);
  const newExpiresAt = new Date(now + tok.expires_in * 1000).toISOString();

  await supabase
    .from("kullanicilar")
    .update({
      access_token: encrypt(tok.access_token),
      access_token_expires_at: newExpiresAt,
      // Spotify bazen yeni refresh token döndürür; döndürürse güncelle.
      ...(tok.refresh_token ? { refresh_token: encrypt(tok.refresh_token) } : {}),
    })
    .eq("id", user.id);

  return tok.access_token;
}

// ── 7) Şu an çalan şarkı ────────────────────────────────────
export async function getNowPlaying(accessToken: string): Promise<SpotifyNowPlaying | null> {
  const res = await fetch(`${API_BASE}/me/player/currently-playing`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  // 204 = şu an hiçbir şey çalmıyor
  if (res.status === 204) return null;
  if (!res.ok) throw new Error(`currently-playing hata: ${res.status}`);
  return res.json();
}

// ── 8) Son çalınanlar (Spotify max 50 verir) ────────────────
/**
 * Son çalınan şarkılar. `after` verilirse o zamandan SONRAKİLER gelir (ms epoch).
 * Cron iki yoklama arasında kaçırdığı şarkıları bununla yakalar.
 */
export async function getRecentlyPlayed(
  accessToken: string,
  afterMs?: number
): Promise<SpotifyRecentItem[]> {
  const params = new URLSearchParams({ limit: "50" });
  if (afterMs) params.set("after", String(afterMs));
  const res = await fetch(`${API_BASE}/me/player/recently-played?${params.toString()}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`recently-played hata: ${res.status}`);
  const data = await res.json();
  return (data.items ?? []) as SpotifyRecentItem[];
}

// ── 9) Spotify Top Items (en çok dinlenen şarkı/sanatçı) ────
// Spotify'ın kendi hesabından gelir; kullanıcı bağlanır bağlanmaz hazır.
// time_range: short_term (~4 hafta), medium_term (~6 ay), long_term (tüm zamanlar)
const ARALIK_MAP: Record<TopAralik, string> = {
  kisa: "short_term",
  orta: "medium_term",
  uzun: "long_term",
};

export async function getTopTracks(
  accessToken: string,
  aralik: TopAralik
): Promise<TopTrack[]> {
  const params = new URLSearchParams({
    limit: "50",
    time_range: ARALIK_MAP[aralik],
  });
  const res = await fetch(`${API_BASE}/me/top/tracks?${params.toString()}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`top-tracks hata: ${res.status}`);
  const data = await res.json();
  return ((data.items ?? []) as SpotifyTopTrackRaw[]).map((t) => ({
    id: t.id,
    isim: t.name,
    sanatci: t.artists.map((a) => a.name).join(", "),
    kapak_url: t.album.images?.[0]?.url ?? null,
  }));
}

export async function getTopArtists(
  accessToken: string,
  aralik: TopAralik
): Promise<TopArtist[]> {
  const params = new URLSearchParams({
    limit: "50",
    time_range: ARALIK_MAP[aralik],
  });
  const res = await fetch(`${API_BASE}/me/top/artists?${params.toString()}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`top-artists hata: ${res.status}`);
  const data = await res.json();
  return ((data.items ?? []) as SpotifyTopArtistRaw[]).map((a) => ({
    id: a.id,
    isim: a.name,
    resim_url: a.images?.[0]?.url ?? null,
    tur: a.genres?.[0] ?? null,
  }));
}

// Spotify ham yanıt tipleri (yalnızca kullandığımız alanlar)
type SpotifyTopTrackRaw = {
  id: string;
  name: string;
  artists: { name: string }[];
  album: { images: { url: string }[] };
};
type SpotifyTopArtistRaw = {
  id: string;
  name: string;
  images: { url: string }[];
  genres: string[];
};
