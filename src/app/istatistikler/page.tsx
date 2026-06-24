import { MenuBar } from "@/components/MenuBar";
import { PremiumSayfa } from "@/components/PremiumSayfa";
import { IstatistikPanel } from "@/components/IstatistikPanel";

export default function IstatistiklerPage() {
  return (
    <>
      <MenuBar />
      <PremiumSayfa
        baslik="İstatistikler"
        aciklama="Dinleme alışkanlıklarının detaylı dökümü."
      >
        <IstatistikPanel />
      </PremiumSayfa>
    </>
  );
}
