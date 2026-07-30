import { notFound } from "next/navigation";
import KymArticlePage from "../components/KymArticlePage";
import KymGenericPage, { findKymItem } from "../components/KymGenericPage";
import KymPollPage from "../components/KymPollPage";
import { createPageMetadata } from "@/platform/seo/generateMetadata";
import { isKymIndexable } from "../data/indexPolicy";
import { getRelatedContentForPreset, RelatedContentSection } from "@/platform/linking";

const CUSTOM_PAGES = {
  "weekly-meme-roundup": {
    title: "The Weekly Meme Roundup",
    description: "Local KYM-style article page for the weekly meme roundup.",
    component: KymArticlePage,
  },
  "meme-of-the-month-may-2026": {
    title: "May 2026 Meme Of The Month — Local Pick",
    description:
      "Choose a May 2026 meme of the month and save the pick locally in your browser.",
    component: KymPollPage,
  },
};

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const path = `/kym/${slug}`;
  const customPage = CUSTOM_PAGES[slug];

  // See ../data/indexPolicy.js: 35 of the 37 entries are assembled from eight
  // shared templates, so the family is out of the index. `follow` stays true —
  // these pages keep passing link equity to the routes that can rank.
  const robots = { noindex: !isKymIndexable(path), follow: true };

  if (customPage) {
    return createPageMetadata({
      title: customPage.title,
      description: customPage.description,
      path,
      ...robots,
    });
  }

  const item = findKymItem(slug);

  if (!item) {
    // 36 of the 44 links on the /kym hub resolve to nothing and land here, so
    // this branch is not rare. Without noindex each one is an indexable page
    // titled "KYM Page" carrying the site's default description — a
    // statically generated notFound() is served with a 200 on this deployment,
    // so the robots directive is what keeps them out of the index.
    return createPageMetadata({
      title: "Entry Not Found",
      description: "This Know Your Meme entry does not exist.",
      path,
      // Unconditional, unlike the other two branches: this one means the
      // entry does not exist, so path-level indexability is beside the point.
      noindex: true,
      follow: true,
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
    ...robots,
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

  // The band always renders: a noindexed page keeps its human navigation and
  // keeps passing link equity onward. Only its ItemList markup is dropped,
  // since rich schema on a page that cannot appear in results buys nothing.
  return (
    <RelatedContentSection
      eyebrow="More on AltFTool"
      title="Keep exploring AltFTool"
      items={items}
      path={`/kym/${slug}`}
      jsonLdName={
        isKymIndexable(`/kym/${slug}`) ? "Keep exploring AltFTool" : undefined
      }
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
