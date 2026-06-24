/** Özet kartı: bir sayı + etiket (+ opsiyonel küçük alt not). */
export function StatCard({
  etiket,
  deger,
  ikon,
  not,
}: {
  etiket: string;
  deger: string | number;
  ikon: React.ReactNode;
  not?: string;
}) {
  return (
    <div className="group flex h-full items-center gap-4 rounded-2xl border border-spodie-border bg-spodie-surface p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-spodie-accent/40 hover:shadow-glow">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-spodie-surface2 text-spodie-accent transition-transform duration-300 group-hover:scale-110">
        {ikon}
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-center">
        {/* Etiket üstte (küçük), değer altında (büyük) — her kartta aynı düzen */}
        <div className="text-xs font-medium uppercase tracking-wide text-spodie-muted">
          {etiket}
        </div>
        <div className="truncate text-xl font-bold leading-tight text-spodie-text">
          {deger}
        </div>
        {not && <div className="mt-0.5 text-[11px] text-spodie-muted/70">{not}</div>}
      </div>
    </div>
  );
}
