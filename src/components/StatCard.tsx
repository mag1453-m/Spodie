/** Özet kartı: bir sayı + etiket. Ana sayfanın üstünde kullanılır. */
export function StatCard({
  etiket,
  deger,
  ikon,
}: {
  etiket: string;
  deger: string | number;
  ikon: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-spodie-border bg-spodie-surface p-5 transition hover:border-spodie-accent/40">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-spodie-surface2 text-spodie-accent">
        {ikon}
      </div>
      <div>
        <div className="text-2xl font-bold leading-tight">{deger}</div>
        <div className="text-sm text-spodie-muted">{etiket}</div>
      </div>
    </div>
  );
}
