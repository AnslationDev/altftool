import { notFound } from "next/navigation";
import KymArticlePage from "../components/KymArticlePage";
import KymGenericPage, { findKymItem } from "../components/KymGenericPage";
import KymPollPage from "../components/KymPollPage";
import { createPageMetadata } from "@/platform/seo/generateMetadata";
import { getRelatedContentForPreset, RelatedContentSection } from "@/platform/linking";

const CUSTOM_PAGES = {
  "weekly-meme-roundup": {
    title: "The Weekly Meme Roundup",
    description: "Local KYM-style article page for the weekly meme roundup.",
    component: KymArticlePage,
  },
  "meme-of-the-month-may-2026": {
    title: "May 2026 Meme Of The Month Poll",
    description: "Vote for May 2026's meme of the month.",
    component: KymPollPage,
  },
};

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const path = `/kym/${slug}`;
  const customPage = CUSTOM_PAGES[slug];

  if (customPage) {
    return createPageMetadata({
      title: customPage.title,
      description: customPage.description,
      path,
    });
  }

  const item = findKymItem(slug);

  if (!item) {
    // findKymItem() (see KymGenericPage.jsx) matches both `item.href === path`
    // and `slugifyTitle(item.title) === slug`, the same two forms the hub's
    // link generator produces, so this branch should only be hit by a slug
    // that matches neither form (e.g. a stale bookmark or external link).
    // This route has no generateStaticParams/output:export — it renders
    // dynamically — but the response still needs a noindex here since it's
    // an indexable page otherwise.
    return createPageMetadata({
      title: "Entry Not Found",
      description: "This meme encyclopedia entry does not exist.",
      path,
      noindex: true,
    });
  }

  // "Local KYM-style detail page for X." was scaffolding text, and it shipped
  // as the meta description on every entry — the snippet a searcher reads
  // described the page's implementation rather than the meme.
  const category = item.category ? item.category.toLowerCase() : "internet culture";
  return createPageMetadata({
    title: `${item.title} — Meaning, Origin and Examples`,
    description:
      item.lede ||
      item.about ||
      `What ${item.title} means, where it came from and how it spread — a ${category} entry with origin, examples and related memes.`,
    path,
  });
}

function KymRelatedBand({ slug, title, description, category }) {
  const items = getRelatedContentForPreset(
    {
      href: `/kym/${slug}`,
      title,
      description,
      tags: ["memes", "internet culture", category].filter(Boolean),
      section: "news",
    },
    "editorial",
  );

  return (
    <RelatedContentSection
      eyebrow="More on AltFTool"
      title="Keep exploring AltFTool"
      items={items}
      path={`/kym/${slug}`}
      jsonLdName="Keep exploring AltFTool"
    />
  );
}

export default async function Page({ params }) {
  const { slug } = await params;
  const customPage = CUSTOM_PAGES[slug];

  if (customPage) {
    const CustomComponent = customPage.component;
    return (
      <>
        <CustomComponent />
        <KymRelatedBand
          slug={slug}
          title={customPage.title}
          description={customPage.description}
        />
      </>
    );
  }

  const item = findKymItem(slug);

  if (!item) {
    notFound();
  }

  return (
    <>
      <KymGenericPage item={item} />
      <KymRelatedBand
        slug={slug}
        title={item.title}
        description={`Local KYM-style detail page for ${item.title}.`}
        category={item.category}
      />
    </>
  );
}
