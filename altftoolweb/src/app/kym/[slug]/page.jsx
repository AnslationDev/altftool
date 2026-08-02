import { notFound } from "next/navigation";
import KymArticlePage from "../components/KymArticlePage";
import KymGenericPage, { findKymItem } from "../components/KymGenericPage";
import KymPollPage from "../components/KymPollPage";
import JsonLd from "@/platform/seo/JsonLd";
import {
  compactBrandedTitle,
  createBreadcrumbJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import { getRelatedContentForPreset, RelatedContentSection } from "@/platform/linking";

const CUSTOM_PAGES = {
  // Both descriptions were scaffolding: "Local KYM-style article page for the
  // weekly meme roundup." described the implementation rather than the content
  // and shipped as the <meta description> a searcher reads, and the poll's was
  // 38 characters. Replacements are read off what these two pages actually
  // render — ../data/articleData.js (roundupArticle: intro plus the sections
  // "He Tryna Ignore It", "Bowie Knife99", "Julie Tsirkin And Kit Bodega") and
  // ../components/KymPollPage.jsx, whose vote is written to localStorage only.
  "weekly-meme-roundup": {
    title: "The Weekly Meme Roundup",
    description:
      "This week in internet culture: the He Tryna Ignore It dog, Bowie Knife99, and the Julie Tsirkin and Kit Bodega clips, with the redraws and edits behind them.",
    component: KymArticlePage,
  },
  "meme-of-the-month-may-2026": {
    title: "May 2026 Meme Of The Month Poll",
    description:
      "Pick your favorite meme of May 2026 from the shortlist on this page. Your choice is saved in your own browser, not to an account or a shared tally.",
    component: KymPollPage,
  },
};

/** Clip to `max` characters on a word boundary, without an ellipsis. */
function clipToWords(value = "", max = 90) {
  const clean = String(value).replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const clipped = clean.slice(0, max + 1);
  const lastSpace = clipped.lastIndexOf(" ");
  const base = lastSpace > max * 0.5 ? clipped.slice(0, lastSpace) : clean.slice(0, max);
  return base.replace(/[,:;\-–—\s]+$/g, "").trim();
}

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
      description:
        "This meme encyclopedia entry does not exist. Browse the AltFTool meme encyclopedia for entries that do, with their origins and examples.",
      path,
      noindex: true,
    });
  }

  // "Local KYM-style detail page for X." was scaffolding text, and it shipped
  // as the meta description on every entry — the snippet a searcher reads
  // described the page's implementation rather than the meme.
  //
  // Its replacement, `What ${item.title} means, where it came from and how it
  // spread — a ${category} entry...`, had two faults of its own, both measured
  // against the 39 records in ../data/kymData.js:
  //   - It assumed the title was a short noun phrase. Most are full sentences,
  //     so it produced "What What Does 'Tweaking' Mean? ... means, where it
  //     came from", and it read "a episode entry" whenever the category began
  //     with a vowel (/kym/the-classic-loss-meme-explained served exactly
  //     that).
  //   - It ran past the 160-character cut in trimMetaDescription() on 15 of
  //     the 39 entries, the longest reaching 248 characters, so those shipped
  //     clipped.
  // Leading with the entry name and appending a fixed tail keeps every entry
  // between 74 and 155 characters, and drops the category from the sentence
  // entirely so there is no article to get wrong. What the tail claims is what
  // KymGenericPage actually renders: about, origin, spread and examples.
  const entryName = clipToWords(item.title, 90);
  return createPageMetadata({
    // Was `${item.title} — Meaning, Origin and Examples`. Entry titles are
    // already full sentences ("What Does 'Tweaking' Mean? The Slang Term
    // Explained", 50 chars), so the 31-character suffix pushed the rendered
    // <title> past 60 once the layout appended " | AltFTool" — and it was the
    // same suffix on all 37 entries, so it added no distinguishing words.
    // compactBrandedTitle() clips to 60 including the brand and, because the
    // result carries the brand, resolveDocumentTitle() treats it as absolute
    // and the layout does not append a second suffix.
    title: compactBrandedTitle(item.title, 60),
    description:
      item.lede ||
      item.about ||
      `${entryName} — origin, spread and examples in the AltFTool meme encyclopedia.`,
    path,
  });
}

/**
 * Breadcrumb only — and deliberately no entity for the meme itself.
 *
 * A KYM entry record is `{ title, image, category?, meta?, href? }` and nothing
 * more (src/app/kym/data/kymData.js). Every paragraph the page renders — about,
 * origin, spread, examples, notes — is category boilerplate assembled by
 * getArticleProfile() in KymGenericPage.jsx from the title, so it is identical
 * across every entry sharing a category and says nothing verifiable about the
 * meme. There is no description, no publication date and no real author: the
 * `meta` strings ("KYM Staff - 19 hours ago", "K.J. Genualdo - a day ago") are
 * scaffolding bylines and relative timestamps, exactly the kind of value that
 * had to be stripped from this codebase once already. Emitting an Article or a
 * CreativeWork here would mean publishing a headline plus template filler as if
 * it documented the subject, and any author/datePublished would be fabricated.
 *
 * The breadcrumb makes no claim about the content, only about where the page
 * sits, so it is the one node these entries can carry honestly.
 */
function KymBreadcrumb({ slug, title }) {
  return (
    <JsonLd
      id={`kym-${slug}-breadcrumb`}
      data={createBreadcrumbJsonLd([
        { name: "Home", path: "/" },
        { name: "Meme Encyclopedia", path: "/kym" },
        { name: title, path: `/kym/${slug}` },
      ])}
    />
  );
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
        <KymBreadcrumb slug={slug} title={customPage.title} />
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
      <KymBreadcrumb slug={slug} title={item.title} />
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
