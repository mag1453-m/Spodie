import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Spodie — Dinleme Takibi",
  description: "Spotify'da ne kadar dinlediğini takip eden kişisel istatistik panosu.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="dark">
      <body className="bg-spodie-bg text-spodie-text font-sans min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
