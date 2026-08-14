import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import PageView from "./PageView";

export async function generateMetadata() {
  return createPageMetadata({
    title: "Newsletter – Coming Soon | AltFTool News",
    description:
      "The AltFTool News email briefing is not live yet. Sign-ups are not open, and no email addresses are being collected. Read the news feed in the meantime.",
    path: "/news/newsletter",
    keywords: ["news newsletter", "local news newsletter", "daily news digest"],
  });
}

export default function Page(props) {
  return (
    <>
      {/* BreadcrumbList only. This page lists no content — it is a signup form
          (email + frequency) plus feature copy — so CollectionPage/ItemList
          would be false. There is also nothing to sell or subscribe to yet:
          the form only writes ALTFT_NEWS_NEWSLETTER_OPTIN to localStorage and
          the success state says the newsletter has not launched, so a Product,
          Offer or SubscribeAction node would assert a service that does not
          run. No ratings, prices or issue dates exist to claim either. */}
      <JsonLd
        id="news-newsletter-schema"
        data={[
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "News", path: "/news" },
            { name: "Newsletter", path: "/news/newsletter" },
          ]),
        ]}
      />
      <PageView {...props} />
    </>
  );
}
