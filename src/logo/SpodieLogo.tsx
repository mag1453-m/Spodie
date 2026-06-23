/**
 * Spodie logosu — tamamen özgün.
 * Konsept: iç içe ses dalgaları + bir nabız/grafik çizgisi (dinleme istatistiği fikri).
 * Spotify'ın yeşil dairesi veya Discord moruyla ALAKASI YOK; kendi ametist/teal paletimiz.
 */
export function SpodieLogo({ size = 40 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Spodie logo"
    >
      <defs>
        <linearGradient id="spodie-grad" x1="0" y1="0" x2="64" y2="64">
          <stop offset="0%" stopColor="#2ee66b" />
          <stop offset="100%" stopColor="#7dffb0" />
        </linearGradient>
      </defs>
      {/* Yuvarlak köşeli kare zemin */}
      <rect width="64" height="64" rx="18" fill="#0f1511" />
      <rect
        x="1.5"
        y="1.5"
        width="61"
        height="61"
        rx="16.5"
        stroke="url(#spodie-grad)"
        strokeOpacity="0.5"
        strokeWidth="1.5"
      />
      {/* Eşitleyici / nabız çubukları */}
      <g stroke="url(#spodie-grad)" strokeWidth="4" strokeLinecap="round">
        <line x1="18" y1="38" x2="18" y2="26" />
        <line x1="27" y1="44" x2="27" y2="20" />
        <line x1="37" y1="40" x2="37" y2="24" />
        <line x1="46" y1="46" x2="46" y2="18" />
      </g>
    </svg>
  );
}
