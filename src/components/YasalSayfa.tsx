import Link from "next/link";
import { SpodieLogo } from "@/logo/SpodieLogo";

/**
 * Yasal sayfalar (Gizlilik, Şartlar) için ortak çerçeve.
 * Sade, okunaklı, Spodie temasıyla uyumlu bir metin düzeni sağlar.
 */
export function YasalSayfa({
  baslik,
  guncelleme,
  children,
}: {
  baslik: string;
  guncelleme: string;
  children: React.ReactNode;
}) {
  return (
    <main className="mx-auto min-h-screen w-full max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
      {/* Üstte logo → ana sayfaya dönüş */}
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-2 text-spodie-muted transition-colors hover:text-spodie-text"
      >
        <SpodieLogo size={28} />
        <span className="text-sm font-semibold">Spodie&apos;ye dön</span>
      </Link>

      <article className="animate-fadeup">
        <h1 className="text-3xl font-extrabold text-spodie-text">{baslik}</h1>
        <p className="mt-2 text-sm text-spodie-muted">Son güncelleme: {guncelleme}</p>

        <div className="yasal mt-8 flex flex-col gap-6 text-[15px] leading-relaxed text-spodie-text/90">
          {children}
        </div>
      </article>

      <footer className="mt-14 border-t border-spodie-border pt-6 text-center text-xs text-spodie-muted">
        <Link href="/gizlilik" className="hover:text-spodie-text">
          Gizlilik Politikası
        </Link>
        <span className="mx-2">·</span>
        <Link href="/sartlar" className="hover:text-spodie-text">
          Kullanım Şartları
        </Link>
      </footer>
    </main>
  );
}

/** Yasal metinlerde bölüm başlığı. */
export function Bolum({ baslik, children }: { baslik: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-lg font-bold text-spodie-text">{baslik}</h2>
      {children}
    </section>
  );
}
