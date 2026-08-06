import PageView from "./PageView";
import { createPageMetadata } from "@/platform/seo/generateMetadata";

export async function generateMetadata() {
  return createPageMetadata({
    title: "Quiz Studio — Free Personality Quizzes & Trivia",
    // The categories are the ones components/NavMenu.jsx actually renders.
    // Nothing here cites a play count or creator because those details are
    // absent unless backed by real data.
    description:
      "Free quizzes — personality, trivia, love, movies, music and more. Pick one, answer a few questions, get your result. No signup, no app.",
    path: "/playbuzz",
  });
}

// This route served no h1 at all: the microsite's only heading elements are the
// h3 inside each quiz card, and the large wordmark in components/
// Header.jsx is a <Link>, not a heading. Nothing was hidden behind hydration —
// there was simply no h1 in the markup. Built here in the server component and
// handed to the client tree as children so it is in the HTML a crawler gets.
//
// "Quiz Studio" is what packages/core/src/experienceCatalog.js calls this route
// (name "Quiz Studio"), which is the name /labs and site
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
