import Personalitytestpage from "./pages/Personalitytestpage";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createFaqJsonLd,
  createHowToJsonLd,
  createPageMetadata,
  createToolJsonLd,
} from "@/platform/seo/generateMetadata";
import {
  FAQ_ITEMS,
  HOW_IT_WORKS_HEADING,
  HOW_IT_WORKS_STEPS,
} from "./data/pageContent";
import "./personality.css";

const TITLE = "Four-Question Personality Reflection";
const DESCRIPTION =
  "Answer four self-reflection questions and see local browser-based scores for structure, leadership preference, social energy, and planning style.";

export async function generateMetadata() {
  return createPageMetadata({
    title: TITLE,
    description: DESCRIPTION,
    path: "/personality",
    keywords: ["personality test", "personality type", "self assessment"],
  });
}

export default function Page() {
  // SoftwareApplication/WebApplication + FAQPage + HowTo + BreadcrumbList.
  //
  // WebApplication because the page's job is to run an assessment in the
  // browser (components/Categories.jsx -> /personality/question/1), not to list
  // anything. The FAQ and HowTo nodes are built from data/pageContent.js, the
  // exact arrays components/Faq.jsx and components/Howitworks.jsx render.
  //
  // Deliberately NOT emitted:
  //   * aggregateRating / Review — nothing on this route collects a rating.
  //     components/Testimonials.jsx held three invented reviewers ("Alex Johnson
  //     @alexj", 5 stars, avatar photos); rather than merely keep it out of the
  //     graph, it is no longer mounted — see pages/Personalitytestpage.jsx.
  //   * interactionStatistic — nothing counts takers. All six cards in
  //     components/Categories.jsx carried the identical "1.2k People Took This
  //     Test" string, which has been removed for the same reason.
  //   * ItemList of the six tests — every card calls the same
  //     router.push("/personality/question/1"), so the list would be six
  //     ListItems with one identical URL (the case /top10 documents).
  return (
    <>
      <JsonLd
        id="personality-schema"
        data={[
          createToolJsonLd({
            slug: "personality",
            path: "/personality",
            tool: {
              name: "Four-Question Personality Reflection",
              description: DESCRIPTION,
              category: ["Assessments", "Self Improvement"],
              topics: ["personality test", "personality type", "self assessment"],
            },
          }),
          createFaqJsonLd({
            path: "/personality",
            questions: FAQ_ITEMS.map((item) => ({
              question: item.q,
              answer: item.a,
            })),
          }),
          createHowToJsonLd({
            path: "/personality",
            name: HOW_IT_WORKS_HEADING,
            description:
              "Take an AltFTool personality assessment and read your result.",
            steps: HOW_IT_WORKS_STEPS.map((step) => `${step.title}. ${step.desc}`),
          }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Personality Test", path: "/personality" },
          ]),
        ]}
      />
      <Personalitytestpage />
    </>
  );
}
