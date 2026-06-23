# 🎵 Spodie

Spotify'da dinlediğin şarkıları otomatik takip eden, "hangi şarkıyı kaç kez dinledim"
sayan kişisel istatistik panosu. Tamamen web; kullanıcı hiçbir program kurmaz.
Üçüncü taraf araç **yok** — sadece Spotify resmi Web API'si.

- **Next.js (App Router) + TypeScript + Tailwind**
- **Supabase** (Postgres + Realtime)
- **Vercel Cron** ile her dakika sunucu tarafı takip
- Çoklu kullanıcı: herkes kendi Spotify hesabıyla bağlanır

---

## Mimari

```
Spotify Web API ──► /api/track (Vercel Cron, her dakika)
                          │  40 sn+ çalan şarkı = "dinlendi"
                          ▼
                   Supabase (dinlemeler tablosu, upsert)
                          │  realtime
                          ▼
                   Ana sayfa (en çok dinlenenler, canlı güncellenir)
```

Token'lar (refresh + access) Supabase'de **AES-256-GCM ile şifreli** saklanır;
böylece cron, kullanıcı tarayıcıda olmasa bile Spotify'ı sorgulayabilir.

---

## Kurulum (özet)

> Ayrıntılı adım adım talimatlar sohbet geçmişinde. Kısa hâli:

### 1. Bağımlılıklar
```bash
npm install
```

### 2. Ortam değişkenleri
`.env.example`'ı `.env.local` olarak kopyala, doldur:

| Değişken | Nereden |
|---|---|
| `SPOTIFY_CLIENT_ID` / `SPOTIFY_CLIENT_SECRET` | developer.spotify.com/dashboard → app → Settings |
| `SPOTIFY_REDIRECT_URI` | Lokal: `http://127.0.0.1:3000/api/auth/callback` |
| `NEXT_PUBLIC_SUPABASE_URL` / `..._ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API |
| `TOKEN_ENCRYPTION_KEY` | Rastgele 32+ karakter (`openssl rand -base64 32`) |
| `CRON_SECRET` | Rastgele dize (cron route'unu korur) |
| `NEXT_PUBLIC_SITE_URL` | Lokal: `http://127.0.0.1:3000` |

### 3. Veritabanı
Supabase → SQL Editor → `sql/schema.sql` içeriğini yapıştır → Run.

### 4. Çalıştır
```bash
npm run dev
```
http://127.0.0.1:3000 → "Spotify Bağla".

---

## Vercel'e deploy

1. Repoyu GitHub'a push et, Vercel'de **Import Project**.
2. **Environment Variables**: `.env.local`'deki tüm anahtarları Vercel proje
   ayarlarına ekle. Ek olarak:
   - `SPOTIFY_REDIRECT_URI` = `https://<projen>.vercel.app/api/auth/callback`
   - `NEXT_PUBLIC_SITE_URL` = `https://<projen>.vercel.app`
3. Spotify Dashboard → app → Settings → **Redirect URIs**'e bu yeni
   `https://.../api/auth/callback` adresini de ekle (lokal olanı silmeden).
4. Deploy et. `vercel.json` sayesinde **Cron** otomatik kurulur ve `/api/track`'i
   her dakika çağırır (Vercel `CRON_SECRET`'i Authorization header'ında gönderir).

> Manuel test: `curl -H "Authorization: Bearer <CRON_SECRET>" https://<projen>.vercel.app/api/track`

---

## Dinleme sayma kuralı

- Bir şarkı **40 saniyeden** uzun çalınca "dinlendi" sayılır.
- Aynı şarkı **baştan başlamadan** tekrar sayılmaz (`son_calan_*` durumu izlenir).
- Şarkı değişir ya da baştan başlatılırsa kilit sıfırlanır → tekrar sayılabilir.

---

## Marka notu

Spodie kendi kimliğine sahiptir (ametist mor + teal palet, özgün logo).
Spotify logosu veya marka rengi **kullanılmaz** (telif).
