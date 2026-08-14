import PageView from "./PageView";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";

// The description is shared with the JSON-LD below so the snippet and the
// schema cannot drift.
const DESCRIPTION =
  "Free quizzes — personality, trivia, love, movies, music and more. Pick one, answer a few questions, get your result. No signup, no app.";

export async function generateMetadata() {
  return createPageMetadata({
    title: "Quiz Studio — Free Personality Quizzes & Trivia",
    // The categories are the ones components/NavMenu.jsx actually renders.
    // Nothing here cites a play count or creator because those details are
    // absent unless backed by real data.
    description: DESCRIPTION,
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
  // CollectionPage + BreadcrumbList only. This URL lists the quiz cards, so
  // CollectionPage is what it is.
  //
  // An ItemList of the quizzes was considered and dropped for the same reason
  // /top10 dropped its own: every card links to /playbuzz/quiz-play?id=N, one
  // route serving all of them from a query string — quiz-play/page.jsx says so
  // itself — so the list would assert one URL per quiz for a set the site
  // treats as a single indexable page. The NavMenu categories are client-side
  // filter buttons, not URLs, so they cannot back a list either.
  //
  // No aggregateRating and no interactionStatistic: articlesData maps a `plays`
  // field through (data.js), but not one quiz record defines it, so no card
  // renders a play count and there is no number here to publish.
  return (
    <>
      <JsonLd
        id="playbuzz-schema"
        data={[
          createCollectionPageJsonLd({
            path: "/playbuzz",
            // The name /labs and site search already publish for this route
            // (packages/core/src/experienceCatalog.js), matching the h1 above.
            name: "Quiz Studio",
            description: DESCRIPTION,
          }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Quiz Studio", path: "/playbuzz" },
          ]),
        ]}
      />
      <PageView {...props}>
        <PageHeading />
      </PageView>
    </>
  );
}
