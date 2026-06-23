-- ════════════════════════════════════════════════════════════
-- SPODIE — Supabase Cron (pg_cron + pg_net)
-- Her dakika sitendeki /api/track'i çağırır → takip otomatik çalışır.
-- Barındırmadan bağımsız: site Netlify'da olsa bile Supabase tetikler.
--
-- ⚠️ ÖNCE iki placeholder'ı kendi değerinle değiştir:
--    1) <SITE_URL>     → canlı site adresin, örn: https://spodie.netlify.app
--    2) <CRON_SECRET>  → .env.local içindeki CRON_SECRET ile AYNI değer
--
-- Supabase Dashboard > SQL Editor > New query → yapıştır → Run
-- ════════════════════════════════════════════════════════════

-- 1) Gerekli eklentileri aç
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- 2) Varsa eski job'ı temizle (tekrar çalıştırılabilir olsun)
select cron.unschedule('spodie-track')
where exists (select 1 from cron.job where jobname = 'spodie-track');

-- 3) Her dakika /api/track'i çağıran job'ı kur
select cron.schedule(
  'spodie-track',
  '* * * * *',  -- her dakika
  $$
  select net.http_get(
    url     := '<SITE_URL>/api/track',
    headers := jsonb_build_object(
      'Authorization', 'Bearer <CRON_SECRET>'
    )
  );
  $$
);

-- ── Yardımcı sorgular (istersen ayrı ayrı çalıştır) ─────────
-- Kurulu job'ı gör:
--   select jobid, jobname, schedule, active from cron.job;
--
-- Son çalışmaların sonucu (başarılı mı?):
--   select * from cron.job_run_details order by start_time desc limit 10;
--
-- Job'ı durdurmak istersen:
--   select cron.unschedule('spodie-track');
-- ════════════════════════════════════════════════════════════
