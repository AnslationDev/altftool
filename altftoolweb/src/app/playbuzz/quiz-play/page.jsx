import PageView from "./PageView";
import { createPageMetadata } from "@/platform/seo/generateMetadata";

export async function generateMetadata() {
  return createPageMetadata({
    // All 100 quizzes are served from this single URL via ?id= (see
    // components/QuizPage.jsx useSearchParams), so there is one indexable page
    // here, not 100 — it has zero impressions in the 7-day GSC export. The copy
    // is generic because all quiz records share this query-parameter route.
    title: "Play a Free Quiz — Personality Tests & Trivia",
    description:
      "Pick a quiz, answer a few questions and get your result straight away. Free personality quizzes and trivia with no signup.",
    path: "/playbuzz/quiz-play",
  });
}

export default function Page(props) {
  return <PageView {...props} />;
}
