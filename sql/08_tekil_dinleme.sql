-- ════════════════════════════════════════════════════════════
-- SPODIE — Dinleme sayım şişmesini KÖKTEN düzelt
-- Her dinleme olayını (track_id + played_at) benzersiz kaydederiz.
-- Böylece aynı dinleme bir daha asla sayılmaz.
-- Supabase > SQL Editor > New query → yapıştır → Run
-- ════════════════════════════════════════════════════════════

-- ── 1) Tekil dinleme olayları tablosu ───────────────────────
-- (kullanici_id, track_id, played_at) benzersiz: aynı "şu şarkı şu an çalındı"
-- olayı yalnızca bir kez girilebilir.
create table if not exists public.dinleme_olaylari (
  id            uuid primary key default gen_random_uuid(),
  kullanici_id  text not null references public.kullanicilar(id) on delete cascade,
  track_id      text not null,
  sarki_adi     text not null,
  sanatci       text not null,
  kapak_url     text,
  played_at     timestamptz not null,
  unique (kullanici_id, track_id, played_at)
);

create index if not exists dinleme_olaylari_kullanici_idx
  on public.dinleme_olaylari (kullanici_id, track_id);

-- ── 2) Yeni tekil dinleme kaydet (çakışırsa sayma) ──────────
-- Döndürür: gerçekten YENİ bir olay eklendiyse true, zaten varsa false.
create or replace function public.dinleme_olay_ekle(
  p_kullanici_id text,
  p_track_id     text,
  p_sarki_adi    text,
  p_sanatci      text,
  p_kapak_url    text,
  p_played_at    timestamptz
)
returns boolean
language plpgsql
security definer
as $$
declare
  v_eklendi boolean := false;
begin
  -- Olayı eklemeyi dene; çakışırsa hiçbir şey yapma
  insert into public.dinleme_olaylari
    (kullanici_id, track_id, sarki_adi, sanatci, kapak_url, played_at)
  values
    (p_kullanici_id, p_track_id, p_sarki_adi, p_sanatci, p_kapak_url, p_played_at)
  on conflict (kullanici_id, track_id, played_at) do nothing;

  -- Gerçekten eklendiyse (yeni satır), özet sayacı +1 yap
  if found then
    v_eklendi := true;
    insert into public.dinlemeler
      (kullanici_id, track_id, sarki_adi, sanatci, kapak_url, dinlenme_sayisi, son_dinlenme, ilk_dinlenme)
    values
      (p_kullanici_id, p_track_id, p_sarki_adi, p_sanatci, p_kapak_url, 1, p_played_at, p_played_at)
    on conflict (kullanici_id, track_id) do update
      set dinlenme_sayisi = public.dinlemeler.dinlenme_sayisi + 1,
          son_dinlenme    = greatest(public.dinlemeler.son_dinlenme, p_played_at),
          ilk_dinlenme    = least(public.dinlemeler.ilk_dinlenme, p_played_at),
          sarki_adi       = excluded.sarki_adi,
          sanatci         = excluded.sanatci,
          kapak_url       = excluded.kapak_url;
  end if;

  return v_eklendi;
end;
$$;

-- ── 3) Realtime (olaylar tablosu için gerekmez; dinlemeler zaten ekli) ──

-- ════════════════════════════════════════════════════════════
-- Çalıştırınca bir sonraki SQL (09) şişmiş sayıları düzeltir.
-- ════════════════════════════════════════════════════════════
