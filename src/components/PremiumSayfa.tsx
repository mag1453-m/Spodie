"use client";

import { useEffect, useState } from "react";

/**
 * Premium sayfa kabuğu.
 * - Giriş yoksa: "Spotify Bağla" çağrısı
 * - Premium değilse: kilit + "Premium al" kutusu
 * - Premium ise: children (asıl içerik)
 */
export function PremiumSayfa({
  baslik,
  aciklama,
  children,
}: {
  baslik: string;
  aciklama: string;
  children: React.ReactNode;
}) {
  const [durum, setDurum] = useState<"yukleniyor" | "girisYok" | "premiumYok" | "acik">(
    "yukleniyor"
  );

  useEffect(() => {
    fetch("/api/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => {
        if (!j.user) setDurum("girisYok");
        else if (!j.user.premium) setDurum("premiumYok");
        else setDurum("acik");
      })
      .catch(() => setDurum("girisYok"));
  }, []);

  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="mb-6 animate-fadeup">
        <h1 className="flex items-center gap-2 text-2xl font-extrabold text-spodie-text">
          <span className="text-spodie-gold">✦</span> {baslik}
        </h1>
        <p className="mt-1 text-sm text-spodie-muted">{aciklama}</p>
      </div>

      {durum === "yukleniyor" ? (
        <div className="rounded-2xl border border-spodie-border bg-spodie-surface p-10 text-center text-spodie-muted">
          Yükleniyor…
        </div>
      ) : durum === "girisYok" ? (
        <div className="rounded-2xl border border-spodie-border bg-spodie-surface p-10 text-center animate-fadeup">
          <div className="mb-3 text-4xl">🎧</div>
          <h2 className="mb-2 text-xl font-bold text-spodie-text">Önce bağlan</h2>
          <p className="mb-5 text-sm text-spodie-muted">
            Bu özelliği görmek için Spotify hesabını bağlaman gerekiyor.
          </p>
          <a
            href="/api/auth/login"
            className="inline-block rounded-full bg-gradient-to-r from-spodie-accent to-spodie-accent2 px-6 py-2.5 font-semibold text-spodie-bg transition hover:scale-[1.03]"
          >
            Spotify Bağla
          </a>
        </div>
      ) : durum === "premiumYok" ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-spodie-accent/40 bg-spodie-accent/5 p-10 text-center animate-fadeup">
          <div className="text-4xl">🔒</div>
          <h2 className="text-xl font-bold text-spodie-text">Premium özellik</h2>
          <p className="max-w-md text-sm text-spodie-muted">
            {baslik}, Spodie Premium ile açılır. Premium şu an erken aşamada — açtırmak
            için bizimle iletişime geç.
          </p>
          <div className="flex gap-3">
            <a
              href="/"
              className="rounded-full bg-spodie-surface2 px-5 py-2.5 text-sm font-medium text-spodie-text transition hover:bg-spodie-border"
            >
              ← Ana sayfa
            </a>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent("spodie:premium"))}
              className="rounded-full bg-gradient-to-r from-spodie-accent to-spodie-accent2 px-5 py-2.5 text-sm font-semibold text-spodie-bg transition hover:scale-[1.03]"
            >
              ✦ Premium hakkında
            </button>
          </div>
        </div>
      ) : (
        <div className="animate-fadeup">{children}</div>
      )}
    </main>
  );
}
