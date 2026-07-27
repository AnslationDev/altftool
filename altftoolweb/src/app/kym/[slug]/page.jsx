import { notFound } from "next/navigation";
import KymArticlePage from "../components/KymArticlePage";
import KymGenericPage, { findKymItem } from "../components/KymGenericPage";
import KymPollPage from "../components/KymPollPage";
import { createPageMetadata } from "@/platform/seo/generateMetadata";
import { getRelatedContentForPreset, RelatedContentSection } from "@/platform/linking";

const CUSTOM_PAGES = {
  "weekly-meme-roundup": {
    title: "The Weekly Meme Roundup",
    description:
      "The AltFTool weekly meme roundup: the formats, edits and reaction images that moved fastest this week.",
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
    return createPageMetadata({
      title: "Meme Encyclopedia",
      path,
    });
  }

  return createPageMetadata({
    title: item.title,
    description: `${item.title} explained in the AltFTool meme encyclopedia: origin, spread and common examples.`,
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
        description={`${item.title} explained in the AltFTool meme encyclopedia: origin, spread and common examples.`}
        category={item.category}
      />
    </>
  );
}
