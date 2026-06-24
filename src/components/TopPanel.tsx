"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import type { TopTrack, TopArtist, TopAralik } from "@/lib/types";

type Tur = "tracks" | "artists";

const ARALIK_LABEL: Record<TopAralik, string> = {
  kisa: "Son 4 hafta",
  orta: "Son 6 ay",
  uzun: "Tüm zamanlar",
};

/**
 * Spotify "en çok dinlediklerin" listesi (premium sayfalarda kullanılır).
 * sabitTur verilirse şarkı/sanatçı sekmesi gizlenir (o tür sabitlenir).
 */
export function TopPanel({ sabitTur }: { sabitTur?: Tur }) {
  const [tur, setTur] = useState<Tur>(sabitTur ?? "tracks");
  const [aralik, setAralik] = useState<TopAralik>("kisa");
  const [ogeler, setOgeler] = useState<(TopTrack | TopArtist)[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [hata, setHata] = useState<string | null>(null);

  const cek = useCallback(async () => {
    setYukleniyor(true);
    setHata(null);
    try {
      const res = await fetch(`/api/top?tur=${tur}&aralik=${aralik}`, { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        setOgeler(json.ogeler ?? []);
      } else {
        const json = await res.json().catch(() => ({}));
        setHata(json.hata ?? "Veri alınamadı");
        setOgeler([]);
      }
    } catch {
      setHata("Bağlantı hatası");
      setOgeler([]);
    }
    setYukleniyor(false);
  }, [tur, aralik]);

  useEffect(() => {
    cek();
  }, [cek]);

  return (
    <section className="animate-fadeup rounded-2xl border border-spodie-border bg-spodie-surface p-3 sm:p-5">
      {/* Şarkılar / Sanatçılar sekmesi (sabitTur yoksa) */}
      {!sabitTur && (
        <div className="mb-3 flex gap-2 px-3">
          {(["tracks", "artists"] as Tur[]).map((t) => (
            <button
              key={t}
              onClick={() => setTur(t)}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                tur === t
                  ? "bg-spodie-accent text-spodie-bg"
                  : "bg-spodie-surface2 text-spodie-muted hover:text-spodie-text"
              }`}
            >
              {t === "tracks" ? "Şarkılar" : "Sanatçılar"}
            </button>
          ))}
        </div>
      )}

      {/* Zaman aralığı */}
      <div className="mb-4 flex flex-wrap gap-1.5 px-3">
        {(["kisa", "orta", "uzun"] as TopAralik[]).map((a) => (
          <button
            key={a}
            onClick={() => setAralik(a)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition ${
              aralik === a
                ? "bg-spodie-accent2/20 text-spodie-accent2 ring-1 ring-spodie-accent2/40"
                : "text-spodie-muted hover:text-spodie-text"
            }`}
          >
            {ARALIK_LABEL[a]}
          </button>
        ))}
      </div>

      {/* İçerik */}
      {yukleniyor ? (
        <div className="flex flex-col gap-1">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-2 py-2">
              <div className="skeleton h-4 w-4 rounded" />
              <div className="skeleton h-11 w-11 rounded-md" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-3.5 w-1/2 rounded" />
                <div className="skeleton h-3 w-1/3 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : hata ? (
        <div className="py-10 text-center text-sm text-spodie-muted">
          {hata.includes("429")
            ? "Spotify şu an çok yoğun, birazdan tekrar dene."
            : "Veri alınamadı, birazdan tekrar dene."}
        </div>
      ) : ogeler.length === 0 ? (
        <div className="py-10 text-center text-sm text-spodie-muted">
          Bu aralık için Spotify&apos;da yeterli veri yok.
        </div>
      ) : (
        <div className="flex flex-col">
          {ogeler.map((o, i) => {
            const sarki = "sanatci" in o;
            const resim = sarki ? (o as TopTrack).kapak_url : (o as TopArtist).resim_url;
            const altYazi = sarki
              ? (o as TopTrack).sanatci
              : (o as TopArtist).tur ?? "Sanatçı";
            const siraRengi =
              i === 0
                ? "text-spodie-gold"
                : i === 1
                  ? "text-spodie-accent2"
                  : i === 2
                    ? "text-spodie-accent"
                    : "text-spodie-muted";
            return (
              <div
                key={o.id}
                className="group flex animate-slidein items-center gap-3 rounded-xl px-2 py-2 transition hover:bg-spodie-surface2"
                style={{ animationDelay: `${Math.min(i, 18) * 0.03}s` }}
              >
                <div
                  className={`w-7 shrink-0 text-center text-base font-bold tabular-nums ${siraRengi}`}
                >
                  {i + 1}
                </div>
                <div
                  className={`relative h-11 w-11 shrink-0 overflow-hidden bg-spodie-surface2 transition-transform duration-200 group-hover:scale-105 ${
                    sarki ? "rounded-md" : "rounded-full"
                  }`}
                >
                  {resim ? (
                    <Image src={resim} alt={o.isim} fill sizes="44px" className="object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-spodie-muted">
                      ♪
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium text-spodie-text">{o.isim}</div>
                  <div className="truncate text-sm text-spodie-muted">{altYazi}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
