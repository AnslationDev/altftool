import Link from "next/link";
import Image from "next/image";

/**
 * "by [AltFTool]" co-brand byline, sat beside a module's own brand lockup.
 *
 * Renders as a SIBLING of the module's brand link, never inside it — the
 * module name links to the module, the logo links to altftool.com, and
 * anchors cannot nest.
 *
 * ONE asset is used for both themes, recoloured in CSS. The two supplied
 * wordmarks are not geometrically interchangeable: altf-wordmark.png is
 * 256x89 with zero transparent padding, while altf_white.png is 366x192 with
 * 35px top / 46px bottom padding and a different ink aspect ratio (3.225 vs
 * 2.865). Swapping between them at a fixed CSS height would render the white
 * one's actual wordmark ~42% smaller and vertically offset, so the logo would
 * visibly jump on theme change. Recolouring a single asset removes that class
 * of bug entirely.
 */
export default function AltfByline({ className = "" }) {
  return (
    <span className={`altf-by ${className}`.trim()}>
      <span className="altf-by-label">by</span>
      <Link href="/" className="altf-by-link">
        <Image
          className="altf-by-logo"
          src="/assets/altf-wordmark.png"
          alt="AltFTool"
          width={256}
          height={89}
          priority
        />
      </Link>
    </span>
  );
}
