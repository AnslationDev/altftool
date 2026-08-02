import PageView from "./PageView";
import { createPageMetadata } from "@/platform/seo/generateMetadata";

export async function generateMetadata() {
  return createPageMetadata({
    // GSC 7-day splits cleanly by intent: the modified queries convert
    // ("playbuzz personality quiz" 7 imp / 1 click / 14.3% CTR, "playbuzz quiz"
    // 14 imp / 1 click / 7.1%) while the bare navigational ones do not
    // ("playbuzz" 74 imp / 0 clicks, "playbuzz quizzes" 40 imp / 0 clicks).
    // So the title now leads with the phrase that already earns clicks rather
    // than with the brand name that never does, and labels the page an
    // alternative instead of claiming to be Playbuzz — the old description said
    // "on Playbuzz", which read as though this site were theirs.
    title: "Free Personality Quizzes — Playbuzz Alternative",
    // The categories are the ones components/NavMenu.jsx actually renders.
    // Nothing here cites a play count or creator because those details are
    // absent unless backed by real data.
    description:
      "Free quizzes — personality, trivia, love, movies, music and more. Pick one, answer a few questions, get your result. No signup, no app.",
    path: "/playbuzz",
  });
}

// This route served no h1 at all: the microsite's only heading elements are the
// h3 inside each quiz card, and the big "playbuzz" wordmark in components/
// Header.jsx is a <Link>, not a heading. Nothing was hidden behind hydration —
// there was simply no h1 in the markup. Built here in the server component and
// handed to the client tree as children so it is in the HTML a crawler gets.
//
// "Quiz Studio" is what packages/core/src/experienceCatalog.js calls this route
// (slug "playbuzz", name "Quiz Studio"), which is the name /labs and site
// search already publish. Using it here rather than coining a third name; the
// wordmark and the title tag still carry the old one (see the report note).
function PageHeading() {
  return (
    <div className="pt-8 max-md:pt-6">
      <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
        Quiz Studio: free personality quizzes and trivia
      </h1>
      <p className="mt-3 max-w-2xl text-base text-muted-foreground">
        Pick a quiz, answer a few questions, get your result. Personality, love,
        movies, music and more — no signup, no app.
      </p>
    </div>
  );
}

export default function Page(props) {
  return (
    <PageView {...props}>
      <PageHeading />
    </PageView>
  );
}
