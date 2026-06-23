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
        // Spodie kendi kimlik paleti — Spotify/Discord renkleri DEĞİL.
        // Ana vurgu: ametist moru + camgöbeği (teal) ikincil vurgu.
        spodie: {
          bg: "#0d0b14", // çok koyu mor-siyah arka plan
          surface: "#171326", // kart yüzeyi
          surface2: "#211b38", // hover / yükseltilmiş yüzey
          border: "#2c2545",
          text: "#ece9f7",
          muted: "#9c93c2",
          accent: "#a86bff", // ametist mor (ana marka rengi)
          accent2: "#3fd6c4", // teal (ikincil vurgu)
          gold: "#ffcb6b", // #1 sıralama vurgusu
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 40px -10px rgba(168, 107, 255, 0.45)",
      },
    },
  },
  plugins: [],
};

export default config;
