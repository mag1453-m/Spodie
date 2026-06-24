# Spodie — Veritabanı (Supabase) SQL'leri

Sıfırdan kurarken **sırayla** çalıştır (Supabase → SQL Editor → her dosyayı yapıştır → Run).

| Sıra | Dosya | Ne yapar |
|------|-------|----------|
| 1 | `01_schema.sql` | Ana tablolar (`kullanicilar`, `dinlemeler`), RLS, realtime |
| 2 | `02_recently_played.sql` | `son_recent_played_at` kolonu |
| 3 | `03_cron_canli.sql` | ⚠️ **Gizli** (CRON_SECRET içerir, git'te yok). Her **5 dakikada** `/api/track` çağıran cron (429/ban riskini düşürmek için) |
| 4 | `04_ilk_dinlenme.sql` | "İlk dinlediğin şarkı" için `ilk_dinlenme` kolonu |
| 5 | `05_kisiye_ozel_rls.sql` | Public okumayı kapat (veri kişiye özel) |
| 6 | `06_avatar.sql` | Profil fotoğrafı (`avatar_url`) kolonu |
| 7 | `07_premium.sql` | Premium üyelik (`premium`) kolonu |
| 8 | `08_tekil_dinleme.sql` | **Önemli:** sayım şişmesini önleyen tekil dinleme sistemi |
| 9 | `09_sismeyi_temizle.sql` | (Bir kerelik) eski şişmiş sayıları sıfırlar |

## Sık kullanılanlar

**Birine premium ver:**
```sql
update public.kullanicilar set premium = true where id = 'SPOTIFY_USER_ID';
```

**Cron'u durdur (Spotify rate-limit için):**
```sql
select cron.unschedule('spodie-track');
```

**Cron çalışıyor mu / son çalışmalar:**
```sql
select jobid, jobname, schedule, active from cron.job;
select * from cron.job_run_details order by start_time desc limit 10;
```

> Not: `03_cron_canli.sql` CRON_SECRET içerdiği için `.gitignore`'da — GitHub'a gitmez.
> İçeriğini kaybedersen `.env.local`'deki CRON_SECRET ile yeniden oluştur.
