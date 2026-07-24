import Link from "next/link";
import { BrandLogo } from "@altftool/ui";

/**
 * "by [AltFTool]" co-brand byline, sat beside a module's own brand lockup.
 *
 * Renders as a SIBLING of the module's brand link, never inside it — the
 * module name links to the module, the logo links to altftool.com, and
 * anchors cannot nest.
 *
 * The shared vector lockup keeps this byline identical to the main web and
 * admin shells without maintaining route-local logo files.
 */
export default function AltfByline({ className = "" }) {
  return (
    <span className={`altf-by ${className}`.trim()}>
      <span className="altf-by-label">by</span>
      <Link href="/" className="altf-by-link">
        <BrandLogo className="altf-by-logo" />
      </Link>
    </span>
  );
}
