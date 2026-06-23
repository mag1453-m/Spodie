import { SpodieLogo } from "@/logo/SpodieLogo";
import { ConnectButton } from "@/components/ConnectButton";
import { TrackList } from "@/components/TrackList";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ baglandi?: string; hata?: string }>;
}) {
  const sp = await searchParams;
  const baglandi = sp.baglandi === "1";
  const hata = sp.hata;

  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      {/* Üst başlık */}
      <header className="mb-10 flex flex-col items-center gap-5 text-center animate-fadeup">
        <div className="flex items-center gap-3">
          <SpodieLogo size={48} />
          <h1 className="bg-gradient-to-r from-spodie-accent to-spodie-accent2 bg-clip-text text-5xl font-extrabold tracking-tight text-transparent">
            Spodie
          </h1>
        </div>
        <p className="max-w-md text-spodie-muted">
          Dinlediğin şarkıları otomatik takip eder, hangisini kaç kez dinlediğini sayar.
        </p>
        <ConnectButton />
      </header>

      {/* Bağlanma / hata bildirimi */}
      {baglandi && (
        <div className="mb-6 rounded-xl border border-spodie-accent2/40 bg-spodie-accent2/10 px-4 py-3 text-center text-sm text-spodie-accent2 animate-fadeup">
          ✓ Spotify hesabın bağlandı. Artık dinlemelerin otomatik sayılacak.
        </div>
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
  );
}
