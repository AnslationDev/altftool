/**
 * Browser-chrome colours (theme-color meta + web app manifest).
 *
 * These are the ONLY places in the platform that must carry literal colour
 * values: a `<meta name="theme-color">` and a `.webmanifest` are consumed by
 * the OS/browser shell, not by CSS, so they cannot read a design token at
 * runtime. Every value below mirrors a token in packages/ui/src/tokens.css —
 * keep them in sync if the token changes.
 *
 *   CHROME_LIGHT -> --anslation-ds-page (light)  #f7f8fb
 *   CHROME_DARK  -> --anslation-ds-page (dark)   #070d18
 *
 * Matching the page background exactly is what makes the status bar / URL bar
 * read as part of the app instead of a browser frame sitting on top of it.
 */

export const CHROME_LIGHT = "#f7f8fb";
export const CHROME_DARK = "#070d18";

/**
 * Splash-screen and install-tile colour for the manifest. The manifest has a
 * single value with no media query, so it commits to the dark navy — the same
 * background baked into the maskable and apple-touch icons, which keeps the
 * install tile, the splash and the icon one continuous surface.
 */
export const MANIFEST_BACKGROUND = CHROME_DARK;
export const MANIFEST_THEME = CHROME_DARK;
