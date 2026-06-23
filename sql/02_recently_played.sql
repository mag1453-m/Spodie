-- ════════════════════════════════════════════════════════════
-- SPODIE — recently-played desteği için ek kolon
-- Cron'un "son nereye kadar çektim" bilgisini tutar.
-- Supabase > SQL Editor > New query → yapıştır → Run
-- ════════════════════════════════════════════════════════════

-- En son recently-played çekiminde gördüğümüz en yeni "played_at" zamanı.
-- Bir sonraki çekimde bundan SONRAKİLERİ alırız → aynı şarkıyı tekrar tekrar saymayız.
alter table public.kullanicilar
  add column if not exists son_recent_played_at timestamptz;
