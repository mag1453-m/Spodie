import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Spodie kimlik paleti — yeşil + siyah.
        // Spotify'ın birebir yeşili DEĞİL; daha parlak zümrüt/neon yeşil ton.
        spodie: {
          bg: "#070a08", // neredeyse siyah, hafif yeşilimsi
          surface: "#0f1511", // kart yüzeyi
          surface2: "#18211b", // hover / yükseltilmiş yüzey
          border: "#223027",
          text: "#e8f5ec",
          muted: "#7d9c89",
          accent: "#2ee66b", // ana yeşil (parlak zümrüt)
          accent2: "#7dffb0", // açık yeşil (ikincil vurgu)
          gold: "#c8ff5e", // #1 sıralama vurgusu (lime)
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 40px -10px rgba(46, 230, 107, 0.5)",
      },
    },
  },
  plugins: [],
};

export default config;
