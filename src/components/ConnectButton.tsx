/**
 * "Spotify Bağla" butonu.
 * Tıklayınca /api/auth/login'e gider, o da kullanıcıyı Spotify onayına yollar.
 * Not: Telif için Spotify logosu/markası KULLANILMAZ — kendi ametist/teal kimliğimiz.
 */
export function ConnectButton({ className = "" }: { className?: string }) {
  return (
    <a
      href="/api/auth/login"
      className={
        "group inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-spodie-accent to-spodie-accent2 " +
        "px-7 py-3.5 text-base font-semibold text-spodie-bg shadow-glow transition " +
        "hover:scale-[1.03] hover:shadow-[0_0_50px_-8px_rgba(168,107,255,0.6)] active:scale-100 " +
        className
      }
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        className="transition group-hover:rotate-12"
        aria-hidden
      >
        {/* Genel "bağlan/halka" ikonu — markaya özel, Spotify ikonu değil */}
        <path
          d="M9 7a5 5 0 0 1 5 5v0a5 5 0 0 1-5 5H7a3 3 0 0 1 0-6h2"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M15 17a5 5 0 0 1-5-5v0a5 5 0 0 1 5-5h2a3 3 0 0 1 0 6h-2"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
      Spotify Bağla
    </a>
  );
}
