"use client";

import { useEffect, useState, useCallback } from "react";
import { StatCard } from "./StatCard";
import { TrackRow } from "./TrackRow";
import type { Dinleme } from "@/lib/types";

/**
 * Dinleme listesi + özet kartları. KİŞİYE ÖZEL:
 * - Veriyi /api/dinlemeler'den çeker (oturuma göre sadece kendi verisi).
 * - Giriş yoksa "Spotify Bağla" çağrısı gösterir.
 * - 30 sn'de bir takibi tetikler + listeyi tazeler.
 */
export function TrackList() {
  const [tracks, setTracks] = useState<Dinleme[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [girisVar, setGirisVar] = useState(true); // başta true varsayıp /api/dinlemeler düzeltir

  const veriyiCek = useCallback(async () => {
    try {
      const res = await fetch("/api/dinlemeler", { cache: "no-store" });
      const json = await res.json();
      setGirisVar(!!json.giris);
      if (json.giris && Array.isArray(json.dinlemeler)) {
        setTracks(json.dinlemeler as Dinleme[]);
      } else {
        setTracks([]);
      }
    } catch {
      // sessizce geç
    }
    setYukleniyor(false);
  }, []);

  // Takip artık SADECE Supabase cron'un işi (her dakika). Site açıkken Spotify'ı
  // ayrıca tetiklemiyoruz (429 riski). Burada sadece DB'den veriyi tazeliyoruz.
  useEffect(() => {
    veriyiCek();
    const interval = setInterval(veriyiCek, 30_000);
    return () => clearInterval(interval);
  }, [veriyiCek]);

  const toplamSarki = tracks.length;
  const toplamDinleme = tracks.reduce((t, x) => t + x.dinlenme_sayisi, 0);

  // En çok dinlenen sanatçı: her şarkının sanatçı(lar)ına dinlenme sayısını dağıt, topla.
  // "Motive, Bekom" gibi birden çok sanatçıyı virgülden ayırıp her birine sayarız.
  const sanatciSayac = new Map<string, number>();
  for (const t of tracks) {
    for (const ad of t.sanatci.split(",").map((s) => s.trim()).filter(Boolean)) {
      sanatciSayac.set(ad, (sanatciSayac.get(ad) ?? 0) + t.dinlenme_sayisi);
    }
  }
  let enCokSanatci = "—";
  let enCokSanatciSayi = 0;
  for (const [ad, sayi] of sanatciSayac) {
    if (sayi > enCokSanatciSayi) {
      enCokSanatci = ad;
      enCokSanatciSayi = sayi;
    }
  }

  // İlk dinlediğin şarkı: en eski "ilk_dinlenme" (yoksa son_dinlenme) olan kayıt.
  const ilkSarki =
    tracks.length > 0
      ? [...tracks].sort((a, b) => {
          const ta = new Date(a.ilk_dinlenme ?? a.son_dinlenme).getTime();
          const tb = new Date(b.ilk_dinlenme ?? b.son_dinlenme).getTime();
          return ta - tb;
        })[0]
      : null;

  // Giriş yapılmamışsa: liste/kartlar yerine "Spotify Bağla" çağrısı göster
  if (!yukleniyor && !girisVar) {
    return (
      <div className="rounded-2xl border border-spodie-border bg-spodie-surface p-10 text-center animate-fadeup">
        <div className="mb-3 text-4xl">🎧</div>
        <h2 className="mb-2 text-xl font-bold text-spodie-text">
          Dinlemelerini görmek için bağlan
        </h2>
        <p className="text-sm text-spodie-muted">
          Yukarıdaki <span className="font-semibold text-spodie-accent2">Spotify Bağla</span>{" "}
          butonuna bas. Bağlandıktan sonra dinlediğin şarkılar burada kişiye özel listelenir.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Özet kartları */}
      <div className="grid animate-fadeup grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard
          etiket="Toplam farklı şarkı"
          deger={toplamSarki}
          ikon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M9 18V5l12-2v13"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="6" cy="18" r="3" stroke="currentColor" strokeWidth="2" />
              <circle cx="18" cy="16" r="3" stroke="currentColor" strokeWidth="2" />
            </svg>
          }
        />
        <StatCard
          etiket="Toplam dinleme"
          deger={toplamDinleme}
          ikon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M3 12h3l3 8 4-16 3 8h5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          }
        />
        <StatCard
          etiket={`En çok dinlenen sanatçı${enCokSanatciSayi ? ` · ${enCokSanatciSayi} dinleme` : ""}`}
          deger={enCokSanatci}
          not="veri biriktikçe netleşir"
          ikon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
              <path
                d="M4 20c0-3.3 3.6-6 8-6s8 2.7 8 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          }
        />
        {ilkSarki && (
          <StatCard
            etiket="İlk dinlediğin şarkı"
            deger={ilkSarki.sarki_adi}
            ikon={
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                <path
                  d="M12 7v5l3 2"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            }
          />
        )}
      </div>

      {/* Liste */}
      <section className="animate-fadeup delay-2 rounded-2xl border border-spodie-border bg-spodie-surface p-3 sm:p-5">
        <h2 className="px-3 pb-3 text-lg font-semibold text-spodie-text">
          En çok dinlenenler
        </h2>

        {yukleniyor ? (
          // Shimmer iskelet — düz "Yükleniyor" yerine şık yer tutucu satırlar
          <div className="flex flex-col gap-1">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-3 py-2.5">
                <div className="skeleton h-4 w-4 rounded" />
                <div className="skeleton h-12 w-12 rounded-md" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-3.5 w-1/2 rounded" />
                  <div className="skeleton h-3 w-1/3 rounded" />
                </div>
                <div className="skeleton h-6 w-8 rounded" />
              </div>
            ))}
          </div>
        ) : tracks.length === 0 ? (
          <div className="py-16 text-center text-spodie-muted">
            Henüz dinleme kaydı yok. Spotify&apos;da bir şarkıyı 40 saniyeden uzun çal,
            takip motoru yakalayacak.
          </div>
        ) : (
          <div className="flex flex-col">
            {tracks.map((t, i) => (
              <TrackRow key={t.id} track={t} sira={i + 1} />
            ))}

            {/* 100 sınırına ulaşıldıysa: premium ipucu */}
            {tracks.length >= 100 && (
              <div className="mt-3 rounded-xl border border-dashed border-spodie-border px-4 py-4 text-center text-sm text-spodie-muted">
                İlk <span className="font-semibold text-spodie-accent">100</span> şarkıyı
                görüyorsun. Daha fazlası{" "}
                <span className="font-semibold text-spodie-text">Premium</span> ile
                yakında. 🔒
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
