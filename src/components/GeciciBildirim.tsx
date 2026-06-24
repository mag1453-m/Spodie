"use client";

import { useEffect, useState } from "react";

/**
 * Belirli süre sonra YUMUŞAKÇA kaybolan bildirim kutusu.
 * Önce solar (fade-out + yukarı kayar), sonra DOM'dan kalkar.
 */
export function GeciciBildirim({
  children,
  sure = 5000,
}: {
  children: React.ReactNode;
  sure?: number;
}) {
  const [soluyor, setSoluyor] = useState(false); // animasyon başladı mı
  const [kalktimi, setKalktimi] = useState(false); // DOM'dan çıktı mı

  useEffect(() => {
    // sure sonunda solmayı başlat
    const t1 = setTimeout(() => setSoluyor(true), sure);
    // solma animasyonu (400ms) bitince tamamen kaldır
    const t2 = setTimeout(() => setKalktimi(true), sure + 400);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [sure]);

  if (kalktimi) return null;

  return (
    <div
      className={`mb-6 rounded-xl border border-spodie-accent2/40 bg-spodie-accent2/10 px-4 py-3 text-center text-sm text-spodie-accent2 transition-all duration-[400ms] ease-out ${
        soluyor ? "-translate-y-2 opacity-0" : "animate-fadeup opacity-100"
      }`}
    >
      {children}
    </div>
  );
}
