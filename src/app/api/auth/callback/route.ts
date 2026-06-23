import { NextRequest, NextResponse } from "next/server";
import {
  exchangeCodeForTokens,
  getSpotifyProfile,
  upsertKullanici,
} from "@/lib/spotify";
import { verifySignedState } from "@/lib/crypto";

/**
 * GET /api/auth/callback?code=...&state=...
 * Spotify onaydan sonra buraya döner. Şunları yapar:
 *  1) state cookie'sini doğrular (CSRF)
 *  2) code'u access+refresh token'a takas eder
 *  3) Spotify profilini çeker (kullanıcı id'si için)
 *  4) Token'ları ŞİFRELİ olarak Supabase'e yazar
 *  5) Kullanıcıyı ana sayfaya geri yollar (?baglandi=1)
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://127.0.0.1:3000";

  // Kullanıcı reddettiyse
  if (error) {
    return NextResponse.redirect(`${siteUrl}/?hata=${encodeURIComponent(error)}`);
  }
  if (!code || !state) {
    return NextResponse.redirect(`${siteUrl}/?hata=eksik_parametre`);
  }

  // CSRF: state HMAC ile imzalı ve taze mi? (cookie'ye bağlı değil)
  if (!verifySignedState(state)) {
    return NextResponse.redirect(`${siteUrl}/?hata=state_uyusmuyor`);
  }

  try {
    const tokens = await exchangeCodeForTokens(code);
    if (!tokens.refresh_token) {
      throw new Error("Spotify refresh_token döndürmedi.");
    }

    const profile = await getSpotifyProfile(tokens.access_token);

    await upsertKullanici({
      id: profile.id,
      display_name: profile.display_name,
      refresh_token: tokens.refresh_token,
      access_token: tokens.access_token,
      expires_in: tokens.expires_in,
    });

    return NextResponse.redirect(`${siteUrl}/?baglandi=1`);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "bilinmeyen_hata";
    return NextResponse.redirect(`${siteUrl}/?hata=${encodeURIComponent(msg)}`);
  }
}
