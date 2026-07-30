import { notFound } from "next/navigation";
import { toolMetaMap } from "@/platform/registry/toolMetaMap";
import { createPageMetadata } from "@/platform/seo/generateMetadata";
import { isEmbeddable, getEmbedAttributionUrl } from "../../embedRegistry";
import EmbedToolClient from "./EmbedToolClient";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  if (!isEmbeddable(slug)) {
    return createPageMetadata({
      title: "AltFTool widget",
      description: "This embeddable widget could not be found.",
      path: `/embed/widget/${slug}`,
      noindex: true,
    });
  }

  const tool = toolMetaMap[slug];
  return {
    // `absolute` bypasses the layout's "| AltFTool" title template.
    title: { absolute: `${tool.name} — AltFTool widget` },
    // Iframe shells must never compete with the canonical tool page: noindex,
    // and canonical pointing at the public tool page (overrides the inherited
    // root-layout canonical, which points at the homepage).
    robots: { index: false, follow: true },
    alternates: { canonical: `/tools/all/${slug}` },
  };
}

export default async function EmbedToolPage({ params, searchParams }) {
  const { slug } = await params;
  if (!isEmbeddable(slug)) notFound();

  const tool = toolMetaMap[slug];
  const attributionUrl = getEmbedAttributionUrl(slug);
  const { theme } = (await searchParams) || {};
  const forcedTheme = theme === "dark" || theme === "light" ? theme : null;

  return (
    <div className="flex min-h-screen flex-col bg-(--page) text-(--foreground)">
      {forcedTheme ? (
        // Embedders pin the widget theme via ?theme=dark|light; the token
        // system switches on html[data-theme], so set it before paint and
        // pin the mode so the site-level theme script leaves it alone.
        <script
          dangerouslySetInnerHTML={{
            __html: `document.documentElement.setAttribute("data-theme","${forcedTheme}");document.documentElement.setAttribute("data-theme-mode","${forcedTheme}");document.documentElement.style.colorScheme="${forcedTheme}";`,
          }}
        />
      ) : null}
      <main className="flex-1 p-3 sm:p-4">
        <EmbedToolClient slug={slug} fallbackHref={attributionUrl} />
      </main>
      <footer className="border-t border-(--border) bg-(--surface) px-4 py-2.5">
        <p className="text-xs text-(--muted-foreground)">
          {tool.name} widget by{" "}
          <a
            href={attributionUrl}
            target="_top"
            rel="noopener"
            className="font-semibold text-(--primary-text) underline underline-offset-2 focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--anslation-ds-primary-hover)]/35"
          >
            AltFTool — free online tools
          </a>
        </p>
      </footer>
    </div>
  );
}
