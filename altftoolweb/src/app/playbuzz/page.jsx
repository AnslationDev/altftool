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
    // The count is real: data.js holds 100 quiz objects, and the categories are
    // the ones components/NavMenu.jsx actually renders. Nothing here cites a
    // play count or a creator — data.js carries a `plays` string and an
    // author/creator name on 99 of the 100 quizzes, and both are invented seed
    // values, so they must never reach a snippet.
    description:
      "Free quizzes — personality, trivia, love, movies, music and more. Pick one, answer a few questions, get your result. No signup, no app.",
    path: "/playbuzz",
  });
}

export default function Page(props) {
  return <PageView {...props} />;
}
