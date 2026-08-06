import PageView from "./PageView";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createFaqJsonLd,
  createPageMetadata,
  createToolJsonLd,
} from "@/platform/seo/generateMetadata";
import { FAQ_ITEMS } from "./utils/constants.jsx";

const DESCRIPTION =
  "Explore the history, meaning, and origin of first and last names with the AltFTool ancestry tool and learn the story behind your name.";

export async function generateMetadata() {
  return createPageMetadata({
    title: "Ancestry – Discover Your Name's Meaning & Origin",
    description: DESCRIPTION,
    path: "/ancestory",
  });
}

// FAQ_ITEMS is the array components/AncestorFAQ.jsx renders, so the markup and
// the accordion always agree. It contains "When did people start using last
// names?" twice with two different answers; a FAQPage with duplicate Question
// names is malformed, so only the first of a repeated question is published.
// That publishes a subset of what the page shows, never something it doesn't.
const FAQ_QUESTIONS = FAQ_ITEMS.filter(
  (item, index, list) =>
    list.findIndex((entry) => entry.question === item.question) === index,
).map((item) => ({ question: item.question, answer: item.answer }));

export default function Page(props) {
  // SoftwareApplication/WebApplication + FAQPage + BreadcrumbList.
  //
  // Deliberately NOT emitted:
  //   * ItemList of components/AncestorPopularNames.jsx — every card links to
  //     /ancestory/meaning?type=first&first=<name>, i.e. one route varied only
  //     by query string, and the section footnote on that component calls
  //     itself "Small selection shown for illustration, not an exhaustive
  //     historical ranking". Publishing it as a ranked ItemList would assert a
  //     ranking the page explicitly disclaims.
  //   * Any Offer — the two promo buttons ("Get a free trial", "Order
  //     altfestoryDNA") are rendered `disabled` with title="Coming soon", so
  //     there is no product to describe.
  return (
    <>
      <JsonLd
        id="ancestory-schema"
        data={[
          createToolJsonLd({
            slug: "ancestory",
            path: "/ancestory",
            tool: {
              name: "AltFTool Ancestry",
              description: DESCRIPTION,
              category: ["Reference", "Genealogy"],
              topics: ["name meaning", "name origin", "surname history"],
            },
          }),
          createFaqJsonLd({ path: "/ancestory", questions: FAQ_QUESTIONS }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Ancestry", path: "/ancestory" },
          ]),
        ]}
      />
      <PageView {...props} />
    </>
  );
}
