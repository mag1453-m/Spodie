"use client";

import { useEffect, useState, useCallback } from "react";
import { createBrowserSupabase } from "@/lib/supabase";
import { StatCard } from "./StatCard";
import { TrackRow } from "./TrackRow";
import type { Dinleme } from "@/lib/types";

/**
 * Dinleme listesi + özet kartları.
 * - İlk yükte Supabase'den en çok dinlenenleri çeker.
 * - Realtime ile `dinlemeler` tablosundaki değişiklikleri canlı dinler.
 * - Realtime bir sebeple çalışmazsa 30 sn'de bir yedek yenileme yapar.
 */
export function TrackList() {
  const [tracks, setTracks] = useState<Dinleme[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);

  const veriyiCek = useCallback(async () => {
    const supabase = createBrowserSupabase();
    const { data, error } = await supabase
      .from("dinlemeler")
      .select("*")
      .order("dinlenme_sayisi", { ascending: false })
      .order("son_dinlenme", { ascending: false })
      .limit(100); // İlk 100 şarkı gösterilir. 100+ ileride premium ile açılacak.

    if (!error && data) {
      setTracks(data as Dinleme[]);
    }
    setYukleniyor(false);
  }, []);

  // Takip motorunu tetikle (şu an çalanı yakala), sonra listeyi tazele.
  // Site açık olduğu sürece bu sayede dinlemeler otomatik sayılır — elle tetikleme yok.
  const tetikleVeCek = useCallback(async () => {
    try {
      await fetch("/api/tick", { cache: "no-store" });
    } catch {
      // tetikleme başarısız olsa bile listeyi yine de çekelim
    }
    await veriyiCek();
  }, [veriyiCek]);

  useEffect(() => {
    // İlk açılışta hem takibi tetikle hem listeyi çek
    tetikleVeCek();

    const supabase = createBrowserSupabase();

    // Realtime: dinlemeler tablosunda her değişiklikte listeyi tazele
    const channel = supabase
      .channel("dinlemeler-degisiklik")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "dinlemeler" },
        () => veriyiCek()
      )
      .subscribe();

    // Her 30 sn'de: takibi tetikle (çalanı yakala) + listeyi güncelle
    const interval = setInterval(tetikleVeCek, 30_000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [veriyiCek, tetikleVeCek]);

  const toplamSarki = tracks.length;
  const toplamDinleme = tracks.reduce((t, x) => t + x.dinlenme_sayisi, 0);

  return (
    <div className="flex flex-col gap-8">
      {/* Özet kartları */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
      </div>

      {/* Liste */}
      <section className="rounded-2xl border border-spodie-border bg-spodie-surface p-3 sm:p-5">
        <h2 className="px-3 pb-3 text-lg font-semibold text-spodie-text">
          En çok dinlenenler
        </h2>

        {yukleniyor ? (
          <div className="py-16 text-center text-spodie-muted">Yükleniyor…</div>
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
