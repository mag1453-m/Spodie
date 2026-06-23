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

  return (
    <div className="group flex items-center gap-4 rounded-xl px-3 py-2.5 transition hover:bg-spodie-surface2">
      {/* Sıra numarası */}
      <div className={`w-7 shrink-0 text-center text-lg font-bold tabular-nums ${siraRengi}`}>
        {sira}
      </div>

      {/* Albüm kapağı */}
      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-spodie-surface2">
        {track.kapak_url ? (
          <Image
            src={track.kapak_url}
            alt={track.sarki_adi}
            fill
            sizes="48px"
            className="object-cover"
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
