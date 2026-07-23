import Image from "next/image";

/**
 * Photo wrapper for the HousingNeeds pages.
 *
 * - Uses next/image with `fill`, so every photo needs a sized container and
 *   can never cause layout shift.
 * - `quality` must be one of next.config's images.qualities allowlist
 *   ([75, 78, 82]); anything else logs a warning and is ignored.
 * - Stored srcs in _data are bare Unsplash URLs. The sizing params are added
 *   here so the upstream fetch is bounded (the originals are ~2000px+) and the
 *   content files stay clean.
 * - The scrim keeps photos from fighting the page in dark mode, where a bright
 *   daylight image against a near-black surface otherwise glares.
 */
export default function HnImage({
  src,
  alt,
  ratio = "landscape",
  sizes = "(max-width: 960px) 100vw, 50vw",
  priority = false,
  className = "",
  children,
}) {
  if (!src) return null;

  const url = `${src}?auto=format&fit=crop&w=1600&q=80`;

  return (
    <figure className={`hn-img hn-img--${ratio} ${className}`.trim()}>
      <Image
        src={url}
        alt={alt}
        fill
        sizes={sizes}
        quality={78}
        priority={priority}
        className="hn-img-el"
      />
      <span className="hn-img-scrim" aria-hidden="true" />
      {children}
    </figure>
  );
}
