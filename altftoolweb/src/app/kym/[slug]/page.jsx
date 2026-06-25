import { notFound } from "next/navigation";
import KymArticlePage from "../components/KymArticlePage";
import KymGenericPage, { findKymItem } from "../components/KymGenericPage";
import KymPollPage from "../components/KymPollPage";

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
  const customPage = CUSTOM_PAGES[slug];

  if (customPage) {
    return {
      title: customPage.title,
      description: customPage.description,
    };
  }

  const item = findKymItem(slug);

  if (!item) {
    return {
      title: "KYM Page",
    };
  }

  return {
    title: item.title,
    description: `Local KYM-style detail page for ${item.title}.`,
  };
}

export default async function Page({ params }) {
  const { slug } = await params;
  const customPage = CUSTOM_PAGES[slug];

  if (customPage) {
    const CustomComponent = customPage.component;
    return <CustomComponent />;
  }

  const item = findKymItem(slug);

  if (!item) {
    notFound();
  }

  return <KymGenericPage item={item} />;
}
