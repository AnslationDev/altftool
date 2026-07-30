import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import PageView from "./PageView";

export async function generateMetadata() {
  return createPageMetadata({
    title: "Newsletter – Local News Delivered Daily | AltFTool News",
    description:
      "Subscribe to the AltFTool News newsletter and get curated local stories — politics, tech, business, and sports — delivered to your inbox every morning.",
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
