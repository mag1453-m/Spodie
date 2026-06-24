import type { Metadata } from "next";
import { YasalSayfa, Bolum } from "@/components/YasalSayfa";

export const metadata: Metadata = {
  title: "Gizlilik Politikası · Spodie",
  description: "Spodie hangi verileri toplar, neden saklar ve nasıl korur.",
};

export default function GizlilikPage() {
  return (
    <YasalSayfa baslik="Gizlilik Politikası" guncelleme="24 Haziran 2026">
      <p>
        Spodie, Spotify hesabını kullanarak dinleme alışkanlıklarını takip eden kişisel
        bir istatistik panosudur. Gizliliğin bizim için önemli — bu sayfa hangi verileri
        topladığımızı, neden topladığımızı ve nasıl koruduğumuzu açıkça anlatır.
      </p>

      <Bolum baslik="Spodie nedir, kim işletir?">
        <p>
          Spodie bağımsız bir projedir ve <strong>Spotify ile bağlantılı, ortak veya
          onaylı değildir</strong>. &quot;Spotify&quot; markası ve verileri, Spotify AB&apos;ye
          aittir. Spodie yalnızca Spotify&apos;ın resmi Web API&apos;sini, sen izin verdiğin
          ölçüde kullanır.
        </p>
      </Bolum>

      <Bolum baslik="Hangi verileri topluyoruz?">
        <p>
          Spotify hesabınla bağlandığında, yalnızca aşağıdaki verilere erişiriz ve
          saklarız:
        </p>
        <ul className="ml-5 list-disc space-y-1">
          <li>
            <strong>Spotify kullanıcı kimliğin ve görünen adın</strong> — seni tanımak ve
            verilerini sana göstermek için.
          </li>
          <li>
            <strong>Profil fotoğrafının bağlantısı</strong> — arayüzde göstermek için.
          </li>
          <li>
            <strong>Son çalınan şarkıların</strong> (şarkı adı, sanatçı, kapak görseli,
            çalınma zamanı) — &quot;neyi kaç kez dinledin&quot; istatistiğini oluşturmak için.
          </li>
          <li>
            <strong>En çok dinlediğin şarkı ve sanatçılar</strong> (Spotify&apos;ın sunduğu
            özet) — yalnızca sana göstermek için, kaydetmeden anlık çekeriz.
          </li>
        </ul>
        <p>
          E-posta adresini, şifreni, ödeme bilgilerini veya çaldığın şarkıların ses
          içeriğini <strong>toplamayız</strong>.
        </p>
      </Bolum>

      <Bolum baslik="Erişim izinleri (scope)">
        <p>
          Spotify&apos;dan yalnızca şu izinleri isteriz:{" "}
          <code className="rounded bg-spodie-surface px-1.5 py-0.5 text-xs">
            user-read-recently-played
          </code>
          ,{" "}
          <code className="rounded bg-spodie-surface px-1.5 py-0.5 text-xs">
            user-read-currently-playing
          </code>
          ,{" "}
          <code className="rounded bg-spodie-surface px-1.5 py-0.5 text-xs">
            user-read-playback-state
          </code>{" "}
          ve{" "}
          <code className="rounded bg-spodie-surface px-1.5 py-0.5 text-xs">
            user-top-read
          </code>
          . Bu izinler yalnızca dinleme verini okumak içindir; hesabında hiçbir değişiklik
          yapamayız (şarkı çalamaz, çalma listesi düzenleyemeyiz).
        </p>
      </Bolum>

      <Bolum baslik="Verini nasıl ve nerede saklıyoruz?">
        <p>
          Verilerin, güvenli bir veritabanı sağlayıcısı olan{" "}
          <strong>Supabase</strong> üzerinde saklanır. Spotify erişim ve yenileme
          anahtarların (token) veritabanına <strong>şifrelenmiş</strong> olarak (AES-256-GCM)
          kaydedilir; düz metin olarak tutulmaz. Verilerine yalnızca sen, kendi oturumunla
          erişebilirsin.
        </p>
      </Bolum>

      <Bolum baslik="Verini kimseyle paylaşmıyoruz">
        <p>
          Dinleme verilerini üçüncü taraflara <strong>satmıyor, kiralamıyor veya
          pazarlama amacıyla paylaşmıyoruz</strong>. Verilerin yalnızca senin
          istatistiklerini sana göstermek için kullanılır.
        </p>
      </Bolum>

      <Bolum baslik="Çerezler">
        <p>
          Seni oturum açık tutmak için tek bir güvenli, imzalı oturum çerezi kullanırız.
          Bu çerez yalnızca Spotify kimliğini taşır ve reklam/izleme amacı taşımaz.
        </p>
      </Bolum>

      <Bolum baslik="Verini silme hakkın">
        <p>
          İstediğin an hesabını ve tüm dinleme verilerini sildirmek isteyebilirsin.
          Bunun için{" "}
          <a
            href="mailto:beratgc644@gmail.com"
            className="text-spodie-accent2 underline"
          >
            beratgc644@gmail.com
          </a>{" "}
          adresine yazman yeterli; talebini aldıktan sonra verilerin kalıcı olarak silinir.
          Ayrıca Spotify hesabının{" "}
          <a
            href="https://www.spotify.com/account/apps/"
            target="_blank"
            rel="noreferrer"
            className="text-spodie-accent2 underline"
          >
            Uygulamalar
          </a>{" "}
          sayfasından Spodie&apos;nin erişimini dilediğin an kaldırabilirsin.
        </p>
      </Bolum>

      <Bolum baslik="Değişiklikler">
        <p>
          Bu politikayı zaman zaman güncelleyebiliriz. Önemli bir değişiklik olduğunda
          bu sayfadaki &quot;Son güncelleme&quot; tarihini yenileriz.
        </p>
      </Bolum>

      <Bolum baslik="İletişim">
        <p>
          Gizlilikle ilgili her türlü soru için:{" "}
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
