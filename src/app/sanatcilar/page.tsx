import { MenuBar } from "@/components/MenuBar";
import { PremiumSayfa } from "@/components/PremiumSayfa";
import { TopPanel } from "@/components/TopPanel";

export default function SanatcilarPage() {
  return (
    <>
      <MenuBar />
      <PremiumSayfa
        baslik="Sanatçı sıralaması"
        aciklama="Spotify'da en çok dinlediğin sanatçılar — 4 hafta, 6 ay ve tüm zamanlar."
      >
        <TopPanel sabitTur="artists" />
      </PremiumSayfa>
    </>
  );
}
