import Image from "next/image";
import type { Dinleme } from "@/lib/types";

/** En çok dinlenen listesinde tek bir satır. */
export function TrackRow({ track, sira }: { track: Dinleme; sira: number }) {
  // İlk 3 sıraya özel renk vurgusu
  const siraRengi =
    sira === 1
      ? "text-spodie-gold"
      : sira === 2
        ? "text-spodie-accent2"
        : sira === 3
          ? "text-spodie-accent"
          : "text-spodie-muted";

  // İlk satırlar sırayla belirsin (stagger). Çok satırda gecikme birikmesin diye sınır.
  const gecikme = sira <= 20 ? `${(sira - 1) * 0.04}s` : "0s";

  return (
    <div
      className="group flex animate-slidein items-center gap-4 rounded-xl px-3 py-2.5 transition-colors duration-200 hover:bg-spodie-surface2"
      style={{ animationDelay: gecikme }}
    >
      {/* Sıra numarası */}
      <div
        className={`w-7 shrink-0 text-center text-lg font-bold tabular-nums transition-transform duration-200 group-hover:scale-110 ${siraRengi}`}
      >
        {sira}
      </div>

      {/* Albüm kapağı */}
      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-spodie-surface2 shadow-sm transition-transform duration-200 group-hover:scale-105">
        {track.kapak_url ? (
          <Image
            src={track.kapak_url}
            alt={track.sarki_adi}
            fill
            sizes="48px"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-spodie-muted">
            ♪
          </div>
        )}
      </div>

      {/* Şarkı adı + sanatçı */}
      <div className="min-w-0 flex-1">
        <div className="truncate font-medium text-spodie-text">{track.sarki_adi}</div>
        <div className="truncate text-sm text-spodie-muted">{track.sanatci}</div>
      </div>

      {/* Dinlenme sayısı */}
      <div className="shrink-0 text-right">
        <div className="text-lg font-bold tabular-nums text-spodie-text">
          {track.dinlenme_sayisi}
        </div>
        <div className="text-xs text-spodie-muted">dinlenme</div>
      </div>
    </div>
  );
}
