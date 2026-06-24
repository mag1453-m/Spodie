import type { Metadata } from "next";
import { YasalSayfa, Bolum } from "@/components/YasalSayfa";

export const metadata: Metadata = {
  title: "Kullanım Şartları · Spodie",
  description: "Spodie'yi kullanırken geçerli olan koşullar.",
};

export default function SartlarPage() {
  return (
    <YasalSayfa baslik="Kullanım Şartları" guncelleme="24 Haziran 2026">
      <p>
        Spodie&apos;yi kullanarak aşağıdaki şartları kabul etmiş olursun. Lütfen kullanmaya
        başlamadan önce oku.
      </p>

      <Bolum baslik="Hizmet ne sunar?">
        <p>
          Spodie, Spotify dinleme alışkanlıklarını sana özet olarak gösteren ücretsiz,
          kişisel bir araçtır. Hizmet &quot;olduğu gibi&quot; sunulur; kesintisiz veya hatasız
          çalışacağına dair bir garanti vermez.
        </p>
      </Bolum>

      <Bolum baslik="Spotify ile ilişki">
        <p>
          Spodie, <strong>Spotify ile bağlantılı, ortak veya onaylı değildir</strong>.
          Verilerin Spotify Web API&apos;si üzerinden, sen izin verdiğin ölçüde alınır.
          Spotify&apos;ın{" "}
          <a
            href="https://developer.spotify.com/terms"
            target="_blank"
            rel="noreferrer"
            className="text-spodie-accent2 underline"
          >
            geliştirici şartlarına
          </a>{" "}
          ve hizmet koşullarına da tabisin. Spotify, API erişimini dilediği an
          değiştirebilir veya sonlandırabilir; bu durumda Spodie&apos;nin bazı özellikleri
          çalışmayabilir.
        </p>
      </Bolum>

      <Bolum baslik="Hesabın ve sorumluluğun">
        <p>
          Spodie&apos;ye kendi Spotify hesabınla giriş yaparsın; ayrı bir parola
          oluşturmazsın. Hesabının güvenliğinden sen sorumlusun. Spodie&apos;yi yasalara
          aykırı veya hizmete zarar verecek şekilde (örneğin otomatik aşırı istek)
          kullanmamayı kabul edersin.
        </p>
      </Bolum>

      <Bolum baslik="Premium özellikler">
        <p>
          Spodie&apos;nin bazı ek istatistik özellikleri &quot;Premium&quot; olarak sunulabilir.
          Premium, yalnızca <strong>kendi dinleme verilerini daha ayrıntılı görüntülemeni</strong>{" "}
          sağlayan ek bir görünümdür; Spotify verisini satmak ya da yeniden dağıtmak değildir.
        </p>
      </Bolum>

      <Bolum baslik="İçerik hakları">
        <p>
          Şarkı adları, sanatçı isimleri, kapak görselleri ve benzeri içerikler ilgili hak
          sahiplerine aittir ve Spotify aracılığıyla gösterilir. Spodie bu içerikler
          üzerinde herhangi bir hak iddia etmez.
        </p>
      </Bolum>

      <Bolum baslik="Sorumluluğun sınırı">
        <p>
          Spodie kişisel bir projedir. Hizmetin kullanımından doğabilecek doğrudan veya
          dolaylı zararlardan sorumlu tutulamaz. Hizmeti dilediğin an kullanmayı bırakabilir
          ve Spotify hesabından erişimini kaldırabilirsin.
        </p>
      </Bolum>

      <Bolum baslik="Değişiklikler">
        <p>
          Bu şartları zaman zaman güncelleyebiliriz. Güncel sürüm her zaman bu sayfada yer
          alır; &quot;Son güncelleme&quot; tarihi en güncel hâli gösterir.
        </p>
      </Bolum>

      <Bolum baslik="İletişim">
        <p>
          Sorularını şu adrese iletebilirsin:{" "}
          <a
            href="mailto:beratgc644@gmail.com"
            className="text-spodie-accent2 underline"
          >
            beratgc644@gmail.com
          </a>
        </p>
      </Bolum>
    </YasalSayfa>
  );
}
