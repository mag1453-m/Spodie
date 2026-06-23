-- ════════════════════════════════════════════════════════════
-- SPODIE — Supabase şema kurulumu
-- Supabase Dashboard > SQL Editor > New query → buraya yapıştır → "Run"
-- ════════════════════════════════════════════════════════════

-- ── 1) KULLANICILAR TABLOSU ─────────────────────────────────
-- Her Spotify hesabı için bir satır. Token'lar burada saklanır
-- ki cron job kullanıcı tarayıcıda olmasa bile Spotify'ı sorgulayabilsin.
-- access_token / refresh_token uygulama tarafında ŞİFRELENEREK yazılır.
create table if not exists public.kullanicilar (
  id                       text primary key,          -- Spotify user id
  display_name             text,
  refresh_token            text not null,             -- şifreli
  access_token             text,                      -- şifreli, kısa ömürlü
  access_token_expires_at  timestamptz,
  son_calan_track_id       text,                      -- aynı şarkıyı tekrar saymamak için
  son_calan_progress_ms    integer,
  olusturulma              timestamptz not null default now()
);

-- ── 2) DİNLEMELER TABLOSU ───────────────────────────────────
-- (kullanici_id, track_id) çifti benzersiz: aynı şarkı tekrar gelince
-- yeni satır açılmaz, var olanın sayacı artar (upsert).
create table if not exists public.dinlemeler (
  id                uuid primary key default gen_random_uuid(),
  kullanici_id      text not null references public.kullanicilar(id) on delete cascade,
  track_id          text not null,
  sarki_adi         text not null,
  sanatci           text not null,
  kapak_url         text,
  dinlenme_sayisi   integer not null default 1,
  son_dinlenme      timestamptz not null default now(),
  unique (kullanici_id, track_id)
);

-- En çok dinlenen sorgusu için indeks
create index if not exists dinlemeler_sayi_idx
  on public.dinlemeler (kullanici_id, dinlenme_sayisi desc);

-- ── 3) DİNLEME SAYACI ARTIRMA FONKSİYONU ────────────────────
-- Tek bir atomik çağrıyla: kayıt yoksa ekle, varsa sayacı +1 yap.
create or replace function public.dinleme_kaydet(
  p_kullanici_id text,
  p_track_id     text,
  p_sarki_adi    text,
  p_sanatci      text,
  p_kapak_url    text
)
returns void
language plpgsql
security definer
as $$
begin
  insert into public.dinlemeler
    (kullanici_id, track_id, sarki_adi, sanatci, kapak_url, dinlenme_sayisi, son_dinlenme)
  values
    (p_kullanici_id, p_track_id, p_sarki_adi, p_sanatci, p_kapak_url, 1, now())
  on conflict (kullanici_id, track_id) do update
    set dinlenme_sayisi = public.dinlemeler.dinlenme_sayisi + 1,
        son_dinlenme    = now(),
        sarki_adi       = excluded.sarki_adi,
        sanatci         = excluded.sanatci,
        kapak_url       = excluded.kapak_url;
end;
$$;

-- ── 4) ROW LEVEL SECURITY (RLS) ─────────────────────────────
-- Tarayıcıdan gelen (anon) erişim SADECE dinlemeleri okuyabilsin.
-- Yazma / token erişimi yalnızca service_role (sunucu) ile yapılır;
-- service_role RLS'i bypass ettiği için ek policy gerekmez.
alter table public.kullanicilar enable row level security;
alter table public.dinlemeler  enable row level security;

-- Dinlemeler herkese açık okunabilir (istatistik panosu public).
-- İstersen burada kullanıcı bazlı kısıtlama yapabilirsin; şimdilik public-read.
drop policy if exists "dinlemeler_public_read" on public.dinlemeler;
create policy "dinlemeler_public_read"
  on public.dinlemeler
  for select
  to anon, authenticated
  using (true);

-- kullanicilar tablosuna anon erişim YOK (token'lar burada). Policy eklemiyoruz,
-- böylece anon hiçbir satır göremez; sadece service_role erişir.

-- ── 5) REALTIME ─────────────────────────────────────────────
-- dinlemeler tablosundaki değişiklikler arayüze anlık yansısın.
alter publication supabase_realtime add table public.dinlemeler;

-- ════════════════════════════════════════════════════════════
-- Bitti. "Run" sonrası hata yoksa şema hazır.
-- ════════════════════════════════════════════════════════════
