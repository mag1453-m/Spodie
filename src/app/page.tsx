import { cookies } from "next/headers";
import { SpodieLogo } from "@/logo/SpodieLogo";
import { ConnectButton } from "@/components/ConnectButton";
import { TrackList } from "@/components/TrackList";
import { MenuBar } from "@/components/MenuBar";
import { GeciciBildirim } from "@/components/GeciciBildirim";
import { readSession, SESSION_COOKIE_NAME } from "@/lib/crypto";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ baglandi?: string; hata?: string }>;
}) {
  const sp = await searchParams;
  const baglandi = sp.baglandi === "1";
  const hata = sp.hata;

  // Giriş yapılmış mı? (oturum çerezi geçerliyse koca butonu gizleyeceğiz)
  const cookieStore = await cookies();
  const girisVar = !!readSession(cookieStore.get(SESSION_COOKIE_NAME)?.value);

  return (
    <>
      {/* En üstte menü bar (logo + premium özellikler taç ile) */}
      <MenuBar />

      <main className="mx-auto min-h-screen w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      {/* Üst başlık */}
      <header className="mb-10 flex flex-col items-center gap-5 text-center animate-fadeup">
        <div className="flex items-center gap-3">
          <span className="animate-pulse-glow">
            <SpodieLogo size={48} />
          </span>
          <h1 className="animate-gradient bg-gradient-to-r from-spodie-accent via-spodie-accent2 to-spodie-accent bg-clip-text text-5xl font-extrabold tracking-tight text-transparent">
            Spodie
          </h1>
        </div>
        {girisVar ? (
          <p className="max-w-md text-spodie-muted">
            En çok dinlediğin şarkılar aşağıda. Dinledikçe otomatik güncellenir.
          </p>
        ) : (
          <>
            <p className="max-w-md text-spodie-muted">
              Dinlediğin şarkıları otomatik takip eder, hangisini kaç kez dinlediğini sayar.
            </p>
            <ConnectButton />
          </>
        )}
      </header>

      {/* Bağlanma bildirimi — 5 sn sonra kendiliğinden kaybolur */}
      {baglandi && (
        <GeciciBildirim>
          ✓ Spotify hesabın bağlandı. Artık dinlemelerin otomatik sayılacak.
        </GeciciBildirim>
      )}
      {hata && (
        <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-center text-sm text-red-300 animate-fadeup">
          Bağlanırken bir sorun oldu: {decodeURIComponent(hata)}
        </div>
      )}

      {/* İstatistikler + liste */}
      <div className="animate-fadeup">
        <TrackList />
      </div>

      {/* Alt bilgi */}
      <footer className="mt-12 text-center text-xs text-spodie-muted">
        Spodie · kişisel dinleme istatistikleri · Spotify Web API ile çalışır
      </footer>
      </main>
    </>
  );
}
