import crypto from "crypto";

/**
 * Token şifreleme — Spotify refresh/access token'larını DB'ye yazmadan önce
 * AES-256-GCM ile şifreleriz. Anahtar .env.local içindeki TOKEN_ENCRYPTION_KEY.
 *
 * Format: base64(iv).base64(authTag).base64(ciphertext)
 * Bu dosya SADECE sunucu tarafında çalışır (Node crypto).
 */

function getKey(): Buffer {
  const raw = process.env.TOKEN_ENCRYPTION_KEY;
  if (!raw || raw.length < 16) {
    throw new Error(
      "TOKEN_ENCRYPTION_KEY tanımlı değil ya da çok kısa (.env.local). En az 32 karakter öner."
    );
  }
  // Anahtarı sabit 32 byte'a indir (sha256). Böylece kullanıcı serbest uzunlukta string girebilir.
  return crypto.createHash("sha256").update(raw).digest();
}

export function encrypt(plain: string): string {
  const iv = crypto.randomBytes(12); // GCM için 96-bit IV
  const cipher = crypto.createCipheriv("aes-256-gcm", getKey(), iv);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("base64")}.${tag.toString("base64")}.${enc.toString("base64")}`;
}

export function decrypt(payload: string): string {
  const [ivB64, tagB64, dataB64] = payload.split(".");
  if (!ivB64 || !tagB64 || !dataB64) {
    throw new Error("Şifreli token formatı bozuk.");
  }
  const iv = Buffer.from(ivB64, "base64");
  const tag = Buffer.from(tagB64, "base64");
  const data = Buffer.from(dataB64, "base64");
  const decipher = crypto.createDecipheriv("aes-256-gcm", getKey(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
}

// ── CSRF state (stateless / cookie'siz) ─────────────────────
// OAuth state'ini cookie'ye yazmak yerine HMAC ile imzalayıp kendi içinde taşırız.
// Format: <rastgele>.<zamanMs>.<hmac>  (base64url)
// Böylece çapraz-site redirect'te kaybolan cookie sorunu yaşanmaz.

function urlSafe(b: Buffer): string {
  return b.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function createSignedState(): string {
  const nonce = urlSafe(crypto.randomBytes(12));
  const ts = Date.now().toString();
  const payload = `${nonce}.${ts}`;
  const hmac = urlSafe(crypto.createHmac("sha256", getKey()).update(payload).digest());
  return `${payload}.${hmac}`;
}

/** State geçerli ve son 15 dakika içinde üretilmişse true. */
export function verifySignedState(state: string | null): boolean {
  if (!state) return false;
  const parts = state.split(".");
  if (parts.length !== 3) return false;
  const [nonce, ts, hmac] = parts;
  const payload = `${nonce}.${ts}`;
  const expected = urlSafe(crypto.createHmac("sha256", getKey()).update(payload).digest());
  // Sabit zamanlı karşılaştırma
  const a = Buffer.from(hmac);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;
  // 15 dakikadan eski state'leri reddet
  const age = Date.now() - Number(ts);
  return Number.isFinite(age) && age >= 0 && age < 15 * 60 * 1000;
}

// ── Oturum çerezi (Spotify ID'yi imzalı taşır) ──────────────
// Ayrı şifre/üyelik yok: Spotify girişi = kimlik. Çerez HMAC ile imzalı,
// kurcalanamaz. İçinde Spotify user id var.
// Format: base64url(userId).base64url(hmac)

const COOKIE_AD = "spodie_session";
export const SESSION_COOKIE_NAME = COOKIE_AD;

export function createSession(userId: string): string {
  const enc = urlSafe(Buffer.from(userId, "utf8"));
  const hmac = urlSafe(crypto.createHmac("sha256", getKey()).update(enc).digest());
  return `${enc}.${hmac}`;
}

/** Çerez geçerliyse Spotify user id'yi döndürür, değilse null. */
export function readSession(cookie: string | undefined | null): string | null {
  if (!cookie) return null;
  const parts = cookie.split(".");
  if (parts.length !== 2) return null;
  const [enc, hmac] = parts;
  const expected = urlSafe(crypto.createHmac("sha256", getKey()).update(enc).digest());
  const a = Buffer.from(hmac);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    return Buffer.from(enc.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8");
  } catch {
    return null;
  }
}
