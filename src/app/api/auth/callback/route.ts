import { NextRequest, NextResponse } from "next/server";
import {
  exchangeCodeForTokens,
  getSpotifyProfile,
  upsertKullanici,
} from "@/lib/spotify";
import { verifySignedState, createSession, SESSION_COOKIE_NAME } from "@/lib/crypto";

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
      avatar_url: profile.avatar_url,
      refresh_token: tokens.refresh_token,
      access_token: tokens.access_token,
      expires_in: tokens.expires_in,
    });

    // Oturum çerezi koy: Spotify girişi = kimlik (ayrı üyelik yok)
    const res = NextResponse.redirect(`${siteUrl}/?baglandi=1`);
    res.cookies.set(SESSION_COOKIE_NAME, createSession(profile.id), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365, // 1 yıl
    });
    return res;
  } catch (e) {
    const msg = e instanceof Error ? e.message : "bilinmeyen_hata";
    return NextResponse.redirect(`${siteUrl}/?hata=${encodeURIComponent(msg)}`);
  }
}
