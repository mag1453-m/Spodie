"use client";

import { useEffect, useState } from "react";
import { StatCard } from "./StatCard";
import type { Dinleme } from "@/lib/types";

/**
 * Detaylı istatistikler (premium). Bizim kendi takip verimizden hesaplanır.
 * Toplam dinleme, farklı şarkı, en çok sanatçı, ilk şarkı vb.
 */
export function IstatistikPanel() {
  const [tracks, setTracks] = useState<Dinleme[]>([]);
  const [toplam, setToplam] = useState(0);
  const [yukleniyor, setYukleniyor] = useState(true);

  useEffect(() => {
    fetch("/api/dinlemeler", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => {
        if (Array.isArray(j.dinlemeler)) setTracks(j.dinlemeler as Dinleme[]);
        setToplam(typeof j.toplam === "number" ? j.toplam : 0);
      })
      .catch(() => {})
      .finally(() => setYukleniyor(false));
  }, []);

  if (yukleniyor) {
    return (
      <div className="rounded-2xl border border-spodie-border bg-spodie-surface p-10 text-center text-spodie-muted">
        Yükleniyor…
      </div>
    );
  }

  if (tracks.length === 0) {
    return (
      <div className="rounded-2xl border border-spodie-border bg-spodie-surface p-10 text-center text-spodie-muted">
        Henüz yeterli dinleme verisi yok. Dinledikçe burada istatistiklerin birikir.
      </div>
    );
  }

  const toplamDinleme = tracks.reduce((t, x) => t + x.dinlenme_sayisi, 0);

  // En çok dinlenen sanatçı
  const sanatciSayac = new Map<string, number>();
  for (const t of tracks) {
    for (const ad of t.sanatci.split(",").map((s) => s.trim()).filter(Boolean)) {
      sanatciSayac.set(ad, (sanatciSayac.get(ad) ?? 0) + t.dinlenme_sayisi);
    }
  }
  const sanatciSirali = [...sanatciSayac.entries()].sort((a, b) => b[1] - a[1]);
  const enCokSanatci = sanatciSirali[0]?.[0] ?? "—";

  // İlk dinlediğin şarkı
  const ilkSarki = [...tracks].sort((a, b) => {
    const ta = new Date(a.ilk_dinlenme ?? a.son_dinlenme).getTime();
    const tb = new Date(b.ilk_dinlenme ?? b.son_dinlenme).getTime();
    return ta - tb;
  })[0];

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard etiket="Toplam farklı şarkı" deger={toplam} ikon={<Ikon tip="sarki" />} />
        <StatCard etiket="Toplam dinleme" deger={toplamDinleme} ikon={<Ikon tip="dinleme" />} />
        <StatCard etiket="En çok dinlenen sanatçı" deger={enCokSanatci} ikon={<Ikon tip="kisi" />} />
        {ilkSarki && (
          <StatCard etiket="İlk dinlediğin şarkı" deger={ilkSarki.sarki_adi} ikon={<Ikon tip="saat" />} />
        )}
      </div>

      {/* En çok dinlenen 5 sanatçı listesi */}
      {sanatciSirali.length > 0 && (
        <section className="rounded-2xl border border-spodie-border bg-spodie-surface p-5">
          <h2 className="mb-3 text-lg font-semibold text-spodie-text">En çok dinlenen sanatçılar</h2>
          <div className="flex flex-col gap-2">
            {sanatciSirali.slice(0, 5).map(([ad, sayi], i) => (
              <div key={ad} className="flex items-center gap-3">
                <span className="w-5 text-center text-sm font-bold text-spodie-muted">{i + 1}</span>
                <span className="flex-1 truncate text-spodie-text">{ad}</span>
                <span className="text-sm font-medium text-spodie-accent2">{sayi} dinleme</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function Ikon({ tip }: { tip: "sarki" | "dinleme" | "kisi" | "saat" }) {
  const ortak = { width: 22, height: 22, viewBox: "0 0 24 24", fill: "none" } as const;
  if (tip === "sarki")
    return (
      <svg {...ortak}>
        <path d="M9 18V5l12-2v13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="6" cy="18" r="3" stroke="currentColor" strokeWidth="2" />
        <circle cx="18" cy="16" r="3" stroke="currentColor" strokeWidth="2" />
      </svg>
    );
  if (tip === "dinleme")
    return (
      <svg {...ortak}>
        <path d="M3 12h3l3 8 4-16 3 8h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  if (tip === "kisi")
    return (
      <svg {...ortak}>
        <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
        <path d="M4 20c0-3.3 3.6-6 8-6s8 2.7 8 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  return (
    <svg {...ortak}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
