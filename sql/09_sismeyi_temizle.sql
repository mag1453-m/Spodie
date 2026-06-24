-- ════════════════════════════════════════════════════════════
-- SPODIE — Şişmiş dinlenme sayılarını temizle
-- Eski sistemde aynı dinleme tekrar tekrar sayıldığı için sayılar şişti.
-- Eski veride played_at olmadığından gerçek geçmişi tam kurtaramayız;
-- en temizi: özet sayıları sıfırlayıp tekil olay sisteminden taze devam etmek.
--
-- ⚠️ Bu, mevcut "dinlenme_sayisi" değerlerini sıfırlar. Bundan sonra
--    her şey doğru sayılır (08'deki tekil sistem sayesinde).
-- Supabase > SQL Editor > New query → yapıştır → Run
-- ════════════════════════════════════════════════════════════

-- SEÇENEK A (ÖNERİLEN): Hepsini temizle, sıfırdan doğru say.
--   Hem özet hem olay tablosunu boşaltır. Bir sonraki cron turunda
--   Spotify'ın son 50 dinlemesi tekil olarak yeniden girilir.
truncate table public.dinleme_olaylari;
delete from public.dinlemeler;

-- Takip noktasını da sıfırla ki recently-played baştan taranabilsin.
update public.kullanicilar set son_recent_played_at = null;

-- ════════════════════════════════════════════════════════════
-- SEÇENEK B (geçmişi KORU ama sayıları makulleştir):
-- Eğer şarkı LİSTESİNİ kaybetmek istemiyorsan, yukarıdaki 3 satır yerine
-- şunu çalıştır — her şarkının sayısını 1'e indirir (liste kalır, sayılar
-- sıfırdan birikir):
--
--   truncate table public.dinleme_olaylari;
--   update public.dinlemeler set dinlenme_sayisi = 1;
--   update public.kullanicilar set son_recent_played_at = null;
-- ════════════════════════════════════════════════════════════
