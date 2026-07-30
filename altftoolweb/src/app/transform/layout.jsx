import { SECTION } from "./_lib/manifest";

/**
 * Section shell. The root layout already provides the site header, footer,
 * fonts and theme, so this only frames the Transform pages in a centered,
 * padded container that matches the other developer tools.
 */
export const metadata = {
  description: SECTION.description,
  openGraph: {
    type: "website",
    siteName: "AltFTool",
  },
};

export default function TransformLayout({ children }) {
  return (
    <div className="min-h-screen w-full bg-(--background) px-3 py-6 [font-family:var(--font-ibm-plex-sans,inherit)] sm:px-6 sm:py-8 lg:px-10">
      <div className="mx-auto w-full max-w-[1200px]">{children}</div>
    </div>
  );
}
