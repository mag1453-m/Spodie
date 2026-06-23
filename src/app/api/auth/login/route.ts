import { NextResponse } from "next/server";
import { buildAuthorizeUrl } from "@/lib/spotify";
import { createSignedState } from "@/lib/crypto";

/**
 * GET /api/auth/login
 * "Spotify Bağla" butonu buraya gelir. CSRF için HMAC-imzalı state üretir
 * (cookie'ye bağlı DEĞİL — çapraz-site redirect'te cookie kaybolma sorununu önler)
 * ve kullanıcıyı Spotify onay ekranına yönlendirir.
 */
export async function GET() {
  // Anahtarlar eksikse kullanıcıyı çirkin bir 500 yerine açıklayıcı şekilde geri yolla
  if (!process.env.SPOTIFY_CLIENT_ID || !process.env.SPOTIFY_REDIRECT_URI) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://127.0.0.1:3000";
    return NextResponse.redirect(`${siteUrl}/?hata=spotify_anahtarlari_eksik`);
  }

  const state = createSignedState();
  const url = buildAuthorizeUrl(state);
  return NextResponse.redirect(url);
}
