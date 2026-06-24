-- ════════════════════════════════════════════════════════════
-- SPODIE — "İlk dinlediğin şarkı" için ilk_dinlenme kolonu
-- Supabase > SQL Editor > New query → yapıştır → Run
-- ════════════════════════════════════════════════════════════

-- 1) Kolonu ekle. Mevcut satırlar için ilk_dinlenme = son_dinlenme yapalım
--    (geçmiş veri için en iyi tahmin bu).
alter table public.dinlemeler
  add column if not exists ilk_dinlenme timestamptz;

update public.dinlemeler
  set ilk_dinlenme = son_dinlenme
  where ilk_dinlenme is null;

-- 2) dinleme_kaydet fonksiyonunu güncelle:
--    - İLK eklemede ilk_dinlenme = now()
--    - Tekrarlarda ilk_dinlenme'ye DOKUNMA (ilk değer korunur)
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
    (kullanici_id, track_id, sarki_adi, sanatci, kapak_url, dinlenme_sayisi, son_dinlenme, ilk_dinlenme)
  values
    (p_kullanici_id, p_track_id, p_sarki_adi, p_sanatci, p_kapak_url, 1, now(), now())
  on conflict (kullanici_id, track_id) do update
    set dinlenme_sayisi = public.dinlemeler.dinlenme_sayisi + 1,
        son_dinlenme    = now(),
        sarki_adi       = excluded.sarki_adi,
        sanatci         = excluded.sanatci,
        kapak_url       = excluded.kapak_url;
        -- ilk_dinlenme bilerek güncellenmez → ilk değer korunur
end;
$$;
