-- ════════════════════════════════════════════════════════════
-- SPODIE — Kullanıcı profil resmi (avatar) kolonu
-- Spotify profil fotoğrafını menüde göstermek için.
-- Supabase > SQL Editor > New query → yapıştır → Run
-- ════════════════════════════════════════════════════════════

alter table public.kullanicilar
  add column if not exists avatar_url text;
