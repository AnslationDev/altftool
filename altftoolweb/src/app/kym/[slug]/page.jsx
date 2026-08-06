import { notFound } from "next/navigation";
import KymArticlePage from "../components/KymArticlePage";
import KymGenericPage from "../components/KymGenericPage";
import KymPollPage from "../components/KymPollPage";
import { findKymItem } from "../data/entries";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import { getRelatedContentForPreset, RelatedContentSection } from "@/platform/linking";
import {
  buildKymEntryDescription,
  buildKymEntryTitle,
} from "../data/entryMeta";
import { roundupArticle } from "../data/articleData";
import { pollOptions } from "../data/pollData";

import { isKymIndexable } from "../data/indexPolicy";
/**
 * Both custom-page descriptions are derived from the data these pages actually
 * render, so a change to the roundup's sections or to the poll's option list
 * cannot leave a stale claim in the snippet. They replaced scaffolding strings
 * ("Local encyclopedia article page for the weekly meme roundup.", "Vote for May
 * 2026's meme of the month.") that described the implementation rather than the
 * page and were too short to earn a click. The poll wording matches what the
 * page tells the reader: a pick is stored locally and no vote is ever submitted
 * or tallied.
 */
function joinTitles(titles) {
  if (titles.length <= 1) return titles[0] || "";
  return `${titles.slice(0, -1).join(", ")} and ${titles[titles.length - 1]}`;
}

const ROUNDUP_SECTIONS = joinTitles(roundupArticle.sections.map((section) => section.title));
const ROUNDUP_DESCRIPTION = `Meme roundup for ${roundupArticle.date}: ${ROUNDUP_SECTIONS} — the reaction images, remixes and edits of the week.`;

const CUSTOM_PAGES = {
  "weekly-meme-roundup": {
    title: "The Weekly Meme Roundup",
    description:
      ROUNDUP_DESCRIPTION.length <= 158
        ? ROUNDUP_DESCRIPTION
        : `Meme roundup for ${roundupArticle.date}: the reaction images, remixes, fan redesigns and quote formats that spread fastest across timelines that week.`,
    component: KymArticlePage,
  },
  "meme-of-the-month-may-2026": {
    title: "May 2026 Meme Of The Month Poll",
    description: `An archived poll on May 2026's meme of the month, with ${pollOptions.length} entries to choose from. Your pick is stored in this browser only: no vote is submitted or tallied.`,
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
    // findKymItem() (see ../data/entries.js) matches both `item.href === path`
    // and `slugifyTitle(item.title) === slug`, the same two forms the hub's
    // link generator produces, so this branch should only be hit by a slug
    // that matches neither form (e.g. a stale bookmark or external link).
    // This route has no generateStaticParams/output:export — it renders
    // dynamically — but the response still needs a noindex here since it's
    // an indexable page otherwise.
    return createPageMetadata({
      title: "Entry Not Found",
      description:
        "No meme encyclopedia entry is filed under this address. Browse the AltFTool meme encyclopedia for entry origins, spread notes and common examples.",
      path,
      noindex: true,
    });
  }

  // "Local encyclopedia detail page for X." was scaffolding text, and it shipped
  // as the meta description on every entry — the snippet a searcher reads
  // described the page's implementation rather than the meme. Its replacement
  // then broke on the real catalog ("a episode entry", "What What Does
  // 'Tweaking' Mean? … means", "a entry entry"), so the template now lives in
  // ../data/entryMeta.js where it can be checked against all 37 entries.
  //
  // Both fields come from that module and nothing may shadow them. The
  // description used to read `item.lede || item.about || build…(item)`, which
  // was dead on this catalog — a KYM record is `{ title, image, category?,
  // meta?, href? }` and carries neither field — but it was a live trapdoor:
  // adding a one-line `lede` to any card would have bypassed the builder and
  // shipped that line, unmeasured, as the snippet.
  //
  // `${item.title} — Meaning, Origin and Examples` used to be inlined here and
  // rendered 23-161 characters, over 60 on 23 of the 37 routes; the builder
  // clamps on a phrase boundary instead.
  return createPageMetadata({
    title: buildKymEntryTitle(item),
    description: buildKymEntryDescription(item),
    path,
    // indexPolicy.js says the hub metadata, the detail metadata and the sitemap
    // loop all read this constant. The hub and the sitemap do; this route stopped
    // when commit 36cdb473e dropped the import. Live, that left /kym noindexed
    // and absent from the sitemap while the 37 templated entries beneath it
    // answered "index, follow" — a hub that disowns pages Google is still being
    // invited to index. Restored rather than re-decided: KYM_INDEXABLE is the
    // one switch, and it is still false.
    noindex: !isKymIndexable(path),
    follow: true,
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
 * Source-card `meta` strings with unverified bylines or relative dates are
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
        description={buildKymEntryDescription(item)}
        category={item.category}
      />
    </>
  );
}
