/**
 * Spodie logosu — public/logo-seffaf.png (şeffaf zeminli yeşil yüz).
 * Header ve menüde kullanılır. Koyu zeminde güzel durur.
 */
export function SpodieLogo({ size = 40 }: { size?: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo-seffaf.png"
      alt="Spodie"
      width={size}
      height={size}
      className="object-contain"
      style={{ width: size, height: size }}
    />
  );
}
