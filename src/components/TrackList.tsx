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
      .limit(200);

    if (!error && data) {
      setTracks(data as Dinleme[]);
    }
    setYukleniyor(false);
  }, []);

  useEffect(() => {
    veriyiCek();

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

    // Yedek: realtime patlarsa 30 sn'de bir yine de güncelle
    const interval = setInterval(veriyiCek, 30_000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [veriyiCek]);

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
          </div>
        )}
      </section>
    </div>
  );
}
