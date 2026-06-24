-- ════════════════════════════════════════════════════════════
-- SPODIE — Dinlemeleri kişiye özel yap (public okumayı kapat)
-- Artık veri /api/dinlemeler üzerinden (server, service_role) çekiliyor
-- ve sadece giriş yapan kullanıcının satırları dönüyor. Bu yüzden
-- anon'un public-read iznine GEREK YOK — güvenlik için kaldırıyoruz.
-- Supabase > SQL Editor > New query → yapıştır → Run
-- ════════════════════════════════════════════════════════════

-- Public okuma policy'sini kaldır → anon artık dinlemeleri doğrudan okuyamaz.
drop policy if exists "dinlemeler_public_read" on public.dinlemeler;

-- RLS açık kalsın (zaten açıktı). service_role RLS'i bypass ettiği için
-- /api/dinlemeler çalışmaya devam eder; anon hiçbir satır göremez.
-- (Ek policy eklemiyoruz; kişiye özel erişim uygulama katmanında oturumla yapılıyor.)
