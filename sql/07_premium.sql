-- ════════════════════════════════════════════════════════════
-- SPODIE — Premium üyelik kolonu (manuel premium)
-- Şimdilik ödeme yok: premium'u Supabase'den elle veriyoruz.
-- Supabase > SQL Editor > New query → yapıştır → Run
-- ════════════════════════════════════════════════════════════

-- Premium işareti (varsayılan: ücretsiz)
alter table public.kullanicilar
  add column if not exists premium boolean not null default false;

-- (Opsiyonel) premium ne zaman verildi / bitiş tarihi — ileride abonelik için
alter table public.kullanicilar
  add column if not exists premium_baslangic timestamptz;
alter table public.kullanicilar
  add column if not exists premium_bitis timestamptz; -- null = süresiz

-- ── Birine premium VERMEK için (örnek) ──────────────────────
-- update public.kullanicilar set premium = true, premium_baslangic = now()
--   where id = 'BURAYA_SPOTIFY_USER_ID';
--
-- Premium ALMAK için:
-- update public.kullanicilar set premium = false where id = '...';
--
-- Kimler premium:
-- select id, display_name, premium from public.kullanicilar where premium = true;
