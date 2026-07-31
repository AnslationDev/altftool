import PageView from "./PageView";
import { createPageMetadata } from "@/platform/seo/generateMetadata";

export async function generateMetadata() {
  return createPageMetadata({
    // Playbuzz is another company's brand: a quiz platform founded in 2012 that
    // rebranded to EX.CO in November 2019, so the consumer quiz site people are
    // searching for no longer exists. That is the one material difference from
    // /pixel-thought — the trademark holder is not serving this intent any more,
    // and the residual demand behind "playbuzz quizzes" is genuinely generic.
    //
    // It does not license using the name as ours, though, and the page was doing
    // exactly that: no H1 at all, and a two-tone "playbuzz" wordmark as the
    // largest text on the screen. So the brand is out of the title and the
    // description here (it was "Playbuzz Alternative"), Home.jsx now carries a
    // real H1 on the generic intent, and Header.jsx no longer renders a
    // lookalike wordmark. The route itself still says /playbuzz — that rename
    // needs a redirect and a sitemap entry, so it is reported, not done here.
    //
    // 41 chars authored, 52 rendered with the layout's " | AltFTool" suffix.
    title: "Free Personality Quizzes and Trivia Tests",
    // The categories named here are the ones components/NavMenu.jsx actually
    // renders. No play count, creator, or quiz total appears: data.js carries a
    // `plays` string ("1.6M plays") and an author name on nearly every quiz and
    // both are invented seed values, so they must never reach a snippet. (For
    // the record, rawQuizzesData holds 99 objects, not the 100 claimed here
    // before — which is exactly why unverified numbers stay out of the copy.)
    //
    // 143 chars, under trimMetaDescription's 160-char cap, so it reaches the
    // SERP whole rather than being cut at a sentence boundary.
    description:
      "Take a free personality quiz or trivia test — love, movies, music, animals, sports and more. A few questions, an instant result, and no signup.",
    path: "/playbuzz",
  });
}

export default function Page(props) {
  return <PageView {...props} />;
}
