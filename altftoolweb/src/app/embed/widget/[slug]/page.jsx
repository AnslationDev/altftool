import { notFound } from "next/navigation";
import { toolMetaMap } from "@/platform/registry/toolMetaMap";
import { isEmbeddable, getEmbedAttributionUrl } from "../../embedRegistry";
import EmbedToolClient from "./EmbedToolClient";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const tool = toolMetaMap[slug];
  return {
    title: tool ? `${tool.name} — AltFTool widget` : "AltFTool widget",
    // Iframe shells must never compete with the canonical tool page.
    robots: { index: false, follow: true },
  };
}

export default async function EmbedToolPage({ params }) {
  const { slug } = await params;
  if (!isEmbeddable(slug)) notFound();

  const tool = toolMetaMap[slug];
  const attributionUrl = getEmbedAttributionUrl(slug);

  return (
    <div className="flex min-h-screen flex-col bg-(--page) text-(--foreground)">
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
