import PageView from "./PageView";
import { createPageMetadata } from "@/platform/seo/generateMetadata";

export async function generateMetadata() {
  return createPageMetadata({
    // All 100 quizzes are served from this single URL via ?id= (see
    // components/QuizPage.jsx useSearchParams), so there is one indexable page
    // here, not 100 — it has zero impressions in the 7-day GSC export. The copy
    // is fixed because "Play Quiz – Playbuzz" and "your Playbuzz quiz" used
    // another company's name as our own page title; the structural problem
    // (per-quiz routes) is reported, not solved here. The description also no
    // longer says "in the same format as Playbuzz" — describing our own page by
    // reference to someone else's product is the same borrowed-brand problem in
    // a politer sentence, and it spent snippet space on their name, not ours.
    title: "Play a Free Quiz: Personality Tests & Trivia",
    description:
      "Pick a quiz, answer a few questions and get your result straight away. Free personality quizzes and trivia tests in your browser, with no signup.",
    path: "/playbuzz/quiz-play",
  });
}

export default function Page(props) {
  return <PageView {...props} />;
}
