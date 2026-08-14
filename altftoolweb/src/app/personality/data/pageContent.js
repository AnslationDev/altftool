/**
 * The copy the /personality landing page renders, lifted out of the client
 * components that render it so page.jsx can build FAQPage and HowTo JSON-LD
 * from the SAME strings. Marking up a second, hand-copied version of this text
 * is how schema silently starts describing a page that no longer exists —
 * these arrays are the single source for both the markup and the pixels.
 *
 * Nothing here is a claim about usage, ratings or accuracy. The two things on
 * this route that were such claims had nothing behind them and have been
 * removed rather than merely excluded from the markup: components/
 * Testimonials.jsx (three invented reviewers at 4–5 stars) is no longer
 * mounted, and the identical "1.2k People Took This Test" label that sat on all
 * six cards in components/Categories.jsx is gone.
 */

/** Rendered by components/Faq.jsx. */
export const FAQ_ITEMS = [
  {
    q: "How long does the personality test take?",
    a: "The reflection contains four questions and has no time limit.",
  },
  {
    q: "Is this a clinical or scientifically validated assessment?",
    a: "No. It is a lightweight self-reflection exercise, not a validated psychological test, diagnosis, or substitute for professional advice.",
  },
  {
    q: "Do I need to sign up to take the test?",
    a: "No sign-up is required. Your four answers are saved in this browser so the result page can calculate the scores immediately.",
  },
  {
    q: "What kind of insights will I receive?",
    a: "You receive one simple score for each question: structure, leadership preference, social energy, and planning style. It is a snapshot of these answers, not a comprehensive profile.",
  },
  {
    q: "Where are my answers stored?",
    a: "The assessment stores your choices in this browser's local storage and does not require an account. You can remove them by clearing this site's browser data; this is local storage, not an encryption guarantee.",
  },
  {
    q: "How should I interpret the results?",
    a: "Treat them as prompts for reflection. Each trait is based on one answer and uses a fixed 1-to-5 scoring rule, so the result should not guide medical, hiring, career, or relationship decisions.",
  },
];

/**
 * Rendered by components/Howitworks.jsx under the "Discover Your Personality
 * In Just Easy 3 Steps" heading, numbered 01/02/03 — an ordered procedure, so
 * it backs a real HowTo. The per-step icon stays in the component: it is
 * presentation, not content.
 */
export const HOW_IT_WORKS_HEADING =
  "See Your Four-Trait Snapshot in 3 Steps";

export const HOW_IT_WORKS_STEPS = [
  {
    num: "01",
    title: "Answer Questions",
    desc: "Choose one response for each of four short self-reflection questions.",
    imgSrc: "/personality/how-it-works/Answer.png",
  },
  {
    num: "02",
    title: "Local Score Calculation",
    desc: "A fixed browser-based rule maps each response from 1 to 5; no AI model is used.",
    imgSrc: "/personality/how-it-works/Ai.png",
  },
  {
    num: "03",
    title: "Read Your Snapshot",
    desc: "Review the four directional scores and their plain-language explanations.",
    imgSrc: "/personality/how-it-works/Get.png",
  },
];
