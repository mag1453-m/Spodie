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
