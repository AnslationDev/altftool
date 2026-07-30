import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  createItemListJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";

import DealsHomeClient from "./DealsHomeClient";
import { getDeals } from "./data/deals";
import "./altf-deals.css";

export async function generateMetadata() {
  return createPageMetadata({
    title: "AltF Deals — Free Lifetime Software Deals",
    description:
      "Handpicked software deals at 100% off forever: free lifetime alternatives to paid tools such as Photoshop, Acrobat and Camtasia, with no signup or card.",
    path: "/deals",
    keywords: [
      "free software deals",
      "lifetime software deals",
      "free alternatives to paid software",
      "AltF Deals",
      "free lifetime deals",
    ],
  });
}

export default function DealsPage() {
  const deals = getDeals();

  return (
    <>
      <JsonLd
        id="altf-deals-schema"
        data={[
          createCollectionPageJsonLd({
            path: "/deals",
            name: "AltF Deals — Free Lifetime Software Deals",
            description:
              "Handpicked software deals at 100% off, forever. Free lifetime alternatives to paid subscription tools.",
          }),
          createItemListJsonLd({
            path: "/deals",
            name: "AltF Deals",
            items: deals.map((deal) => ({ name: deal.name, path: `/deals/${deal.slug}` })),
          }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "AltF Deals", path: "/deals" },
          ]),
        ]}
      />
      <DealsHomeClient />
    </>
  );
}
