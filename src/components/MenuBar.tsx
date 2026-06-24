"use client";

import { useState, useEffect } from "react";
import { SpodieLogo } from "@/logo/SpodieLogo";

/**
 * Üst menü bar.
 * Solda Spodie logo+isim. Sağda menü öğeleri.
 * Premium gerektiren öğelerin yanında taç (👑) durur; tıklayınca
 * "Premium al" mesaj kutusu açılır.
 */

// Taç ikonu (SVG — emoji yerine, tema rengine uysun diye)
function Tac({ className = "" }: { className?: string }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M3 8l4 4 5-7 5 7 4-4v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8z" />
    </svg>
  );
}

// Premium menü öğeleri (taçlı) — her biri kendi sayfasına gider.
// Premium değilse sayfa zaten kilit kutusu gösterir.
const PREMIUM_OGELER = [
  { ad: "Tüm şarkılar", href: "/sarkilar", aciklama: "Spotify'da en çok dinlediğin şarkılar" },
  { ad: "Sanatçı sıralaması", href: "/sanatcilar", aciklama: "En çok dinlediğin sanatçılar" },
  { ad: "İstatistikler", href: "/istatistikler", aciklama: "Detaylı dinleme dökümün" },
];

export function MenuBar() {
  const [acikOzellik, setAcikOzellik] = useState<string | null>(null);
  const [kullanici, setKullanici] = useState<{
    display_name: string | null;
    avatar_url: string | null;
    premium?: boolean;
  } | null>(null);
  const [profilAcik, setProfilAcik] = useState(false);

  useEffect(() => {
    fetch("/api/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => setKullanici(j.user))
      .catch(() => {});
  }, []);

  // Sayfanın başka yerinden (liste kilidi gibi) premium kutusu açma isteği
  useEffect(() => {
    const ac = () => setAcikOzellik("Premium");
    window.addEventListener("spodie:premium", ac);
    return () => window.removeEventListener("spodie:premium", ac);
  }, []);

  // Dropdown dışına tıklayınca kapansın.
  // Dinleyiciyi bir sonraki tick'te ekliyoruz ki menüyü AÇAN tık,
  // hemen "dışarı tık" sayılıp menüyü kapatmasın.
  useEffect(() => {
    if (!profilAcik) return;
    const kapat = () => setProfilAcik(false);
    const t = setTimeout(() => document.addEventListener("click", kapat), 0);
    return () => {
      clearTimeout(t);
      document.removeEventListener("click", kapat);
    };
  }, [profilAcik]);

  return (
    <>
      <nav className="sticky top-0 z-40 border-b border-spodie-border bg-spodie-bg/85 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          {/* Sol: logo + isim */}
          <a href="/" className="flex items-center gap-2">
            <SpodieLogo size={28} />
            <span className="bg-gradient-to-r from-spodie-accent to-spodie-accent2 bg-clip-text text-lg font-extrabold tracking-tight text-transparent">
              Spodie
            </span>
          </a>

          {/* Sağ: premium öğeler (kayabilir) + profil (sabit, overflow'suz) */}
          <div className="flex min-w-0 items-center gap-1">
            {/* Premium öğeler — taşarsa yatay kayar */}
            <div className="flex items-center gap-1 overflow-x-auto">
              {PREMIUM_OGELER.map((o) => (
                <a
                  key={o.ad}
                  href={o.href}
                  className="flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-spodie-muted transition hover:bg-spodie-surface2 hover:text-spodie-text"
                >
                  <Tac className="text-spodie-gold" />
                  <span className="whitespace-nowrap">{o.ad}</span>
                </a>
              ))}
            </div>

            {/* Giriş yapmışsa: profil butonu + açılır menü (overflow YOK ki dropdown kırpılmasın) */}
            {kullanici && (
              <div className="relative ml-1 shrink-0 border-l border-spodie-border pl-2">
                {/* Tek buton: avatar + isim + ok */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setProfilAcik((v) => !v);
                  }}
                  className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 transition hover:bg-spodie-surface2"
                >
                  {kullanici.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={kullanici.avatar_url}
                      alt={kullanici.display_name ?? "Profil"}
                      className="h-7 w-7 shrink-0 rounded-full border border-spodie-border object-cover"
                    />
                  ) : (
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-spodie-surface2 text-xs font-bold text-spodie-accent">
                      {(kullanici.display_name ?? "S").charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="hidden whitespace-nowrap text-sm font-medium text-spodie-text sm:inline">
                    {kullanici.display_name ?? "Sen"}
                  </span>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    className={`text-spodie-muted transition-transform duration-200 ${
                      profilAcik ? "rotate-180" : ""
                    }`}
                  >
                    <path
                      d="M6 9l6 6 6-6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

                {/* Açılır menü */}
                {profilAcik && (
                  <div
                    className="absolute right-0 top-full z-50 mt-2 w-52 origin-top-right animate-popin overflow-hidden rounded-xl border border-spodie-border bg-spodie-surface shadow-glow"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Spotify'a git */}
                    <a
                      href="https://open.spotify.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2.5 px-4 py-3 text-sm text-spodie-text transition hover:bg-spodie-surface2"
                    >
                      <span className="text-spodie-accent">♫</span>
                      Spotify&apos;a git
                    </a>

                    {/* Premium durumu */}
                    {kullanici.premium ? (
                      <div className="flex items-center gap-2.5 px-4 py-3 text-sm text-spodie-gold">
                        <Tac className="text-spodie-gold" />
                        Premium üyesin ✓
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setProfilAcik(false);
                          setAcikOzellik("Premium");
                        }}
                        className="flex w-full items-center gap-2.5 px-4 py-3 text-left text-sm text-spodie-text transition hover:bg-spodie-surface2"
                      >
                        <Tac className="text-spodie-gold" />
                        Planı yükselt
                      </button>
                    )}

                    {/* Çıkış */}
                    <a
                      href="/api/auth/logout"
                      className="flex items-center gap-2.5 border-t border-spodie-border px-4 py-3 text-sm text-spodie-muted transition hover:bg-red-500/15 hover:text-red-400"
                    >
                      <span>⏻</span>
                      Çıkış
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Premium mesaj kutusu */}
      {acikOzellik && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 animate-fadeup"
          onClick={() => setAcikOzellik(null)}
        >
          <div
            className="w-full max-w-sm animate-popin rounded-2xl border border-spodie-border bg-spodie-surface p-6 text-center shadow-glow"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex justify-center text-spodie-gold">
              <Tac className="h-9 w-9" />
            </div>
            <h3 className="mb-1 text-xl font-bold text-spodie-text">
              {acikOzellik === "Premium" ? "Spodie Premium" : acikOzellik}
            </h3>
            <p className="mb-3 text-sm font-medium text-spodie-accent2">
              {acikOzellik === "Premium" ? "Daha fazlası için" : "Premium özellik"}
            </p>
            {acikOzellik === "Premium" ? (
              <>
                <ul className="mb-4 space-y-2 text-left text-sm text-spodie-text">
                  {PREMIUM_OGELER.map((o) => (
                    <li key={o.ad} className="flex items-start gap-2">
                      <span className="mt-0.5 text-spodie-accent2">✓</span>
                      <span>
                        <span className="font-semibold">{o.ad}</span> — {o.aciklama}
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="mb-5 rounded-lg bg-spodie-surface2 px-3 py-2 text-xs text-spodie-muted">
                  Premium şu an erken aşamada. Açtırmak için bizimle iletişime geç.
                </p>
              </>
            ) : (
              <p className="mb-5 text-sm text-spodie-muted">
                {PREMIUM_OGELER.find((o) => o.ad === acikOzellik)?.aciklama}
                <br />
                Bu özellik için{" "}
                <span className="font-semibold text-spodie-text">Spodie Premium</span>{" "}
                gerekiyor. Yakında!
              </p>
            )}
            <button
              onClick={() => setAcikOzellik(null)}
              className="w-full rounded-full bg-gradient-to-r from-spodie-accent to-spodie-accent2 px-5 py-2.5 font-semibold text-spodie-bg transition hover:scale-[1.02]"
            >
              Tamam
            </button>
          </div>
        </div>
      )}
    </>
  );
}
