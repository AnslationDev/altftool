import { categoryTone, markStyle, monogram } from "../_lib/presentation";

const SIZES = {
  sm: { box: "h-9 w-9", text: "text-[0.8125rem]" },
  md: { box: "h-12 w-12", text: "text-base" },
  lg: { box: "h-16 w-16", text: "text-xl" },
  xl: { box: "h-20 w-20 sm:h-24 sm:w-24", text: "text-2xl sm:text-3xl" },
};

/**
 * The generated stand-in for a site's logo.
 *
 * Screenshots and favicons would mean hundreds of third-party requests, a
 * referer leak per card, and steady rot as sites redesign or die. A mark
 * derived from the slug costs nothing, never breaks, and stays recognisable.
 */
export default function SiteMark({ site, size = "md", className = "" }) {
  const dimensions = SIZES[size] || SIZES.md;

  return (
    <span
      aria-hidden="true"
      className={`rh-mark ${dimensions.box} ${dimensions.text} ${className}`}
      style={markStyle(site.slug, categoryTone(site.category))}
    >
      <span className="rh-mark__glyph">{monogram(site.name)}</span>
    </span>
  );
}
