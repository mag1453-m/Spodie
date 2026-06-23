import { createServiceSupabase } from "./supabase";
import { encrypt, decrypt } from "./crypto";
import type { Kullanici, SpotifyNowPlaying } from "./types";

// ── Sabitler ────────────────────────────────────────────────
const AUTH_URL = "https://accounts.spotify.com/authorize";
const TOKEN_URL = "https://accounts.spotify.com/api/token";
const API_BASE = "https://api.spotify.com/v1";

export const SPOTIFY_SCOPES = [
  "user-read-currently-playing",
  "user-read-recently-played",
  "user-read-playback-state",
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
}> {
  const res = await fetch(`${API_BASE}/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`Profil alınamadı: ${res.status}`);
  const data = await res.json();
  return { id: data.id, display_name: data.display_name ?? null };
}

// ── 5) Kullanıcıyı DB'ye kaydet/güncelle (token'lar şifreli) ─
export async function upsertKullanici(opts: {
  id: string;
  display_name: string | null;
  refresh_token: string;
  access_token: string;
  expires_in: number;
}) {
  const supabase = createServiceSupabase();
  const expiresAt = new Date(Date.now() + opts.expires_in * 1000).toISOString();
  const { error } = await supabase.from("kullanicilar").upsert(
    {
      id: opts.id,
      display_name: opts.display_name,
      refresh_token: encrypt(opts.refresh_token),
      access_token: encrypt(opts.access_token),
      access_token_expires_at: expiresAt,
    },
    { onConflict: "id" }
  );
  if (error) throw new Error(`Kullanıcı kaydedilemedi: ${error.message}`);
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
