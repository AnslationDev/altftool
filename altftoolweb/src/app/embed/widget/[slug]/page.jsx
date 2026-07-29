import { notFound } from "next/navigation";
import { toolMetaMap } from "@/platform/registry/toolMetaMap";
import {
  isEmbeddable,
  getEmbedAttributionUrl,
  getOEmbedEndpointUrl,
} from "../../embedRegistry";
import EmbedToolClient from "./EmbedToolClient";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const tool = toolMetaMap[slug];
  const embeddable = isEmbeddable(slug);

  return {
    // `absolute` bypasses the layout's "| AltFTool" title template.
    title: { absolute: tool ? `${tool.name} — AltFTool widget` : "AltFTool widget" },
    // Iframe shells must never compete with the canonical tool page: noindex,
    // and canonical pointing at the public tool page (overrides the inherited
    // root-layout canonical, which points at the homepage).
    robots: { index: false, follow: true },
    ...(tool
      ? {
          alternates: {
            canonical: `/tools/all/${slug}`,
            // oEmbed discovery. This URL — the widget document — is what the
            // /embed hub tells publishers to paste, so this is the page that
            // has to advertise the endpoint: a consumer (WordPress, Ghost,
            // Discourse) fetches the pasted URL and looks for exactly this
            // link before it will expand the paste into a live embed.
            // Advertised only for slugs that really are embeddable, so a
            // consumer never discovers an endpoint that answers 404.
            ...(embeddable
              ? {
                  types: {
                    "application/json+oembed": [
                      {
                        url: getOEmbedEndpointUrl(slug),
                        title: `${tool.name} — AltFTool widget`,
                      },
                    ],
                  },
                }
              : {}),
          },
        }
      : {}),
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
          {/*
            The credit link back to our own tool page. `rel="noopener"` is a
            window-handle guard only — it is NOT a link-relationship hint.
            Never add nofollow/sponsored/ugc here: this is a link to our own
            property, not a paid placement, and it is the point of the embed
            programme.
          */}
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
