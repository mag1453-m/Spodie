import { MenuBar } from "@/components/MenuBar";
import { PremiumSayfa } from "@/components/PremiumSayfa";
import { TopPanel } from "@/components/TopPanel";

export default function SarkilarPage() {
  return (
    <>
      <MenuBar />
      <PremiumSayfa
        baslik="Tüm şarkılar"
        aciklama="Spotify'da en çok dinlediğin şarkılar — 4 hafta, 6 ay ve tüm zamanlar."
      >
        <TopPanel sabitTur="tracks" />
      </PremiumSayfa>
    </>
  );
}
