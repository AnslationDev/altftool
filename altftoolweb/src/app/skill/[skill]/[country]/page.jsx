import ToolClient from "@/app/tools/[category]/[slug]/ToolClient";
import { createPageMetadata } from "@/platform/seo/generateMetadata";

const TOOL_SLUG = "skill-demand-analyzer";
const TOOL_PATH = `/tools/all/${TOOL_SLUG}`;

// This route has NO per-skill or per-country data behind it. Every URL renders
// the same client-side Skill Demand Analyzer — the tool fetches its numbers at
// runtime from the user's own input, so /skill/react/india and /skill/foo/bar
// are byte-identical to each other and to the canonical tool page.
//
// It previously built an indexable title/description ("<SKILL> Job Market
// Demand & Salary in <COUNTRY>") out of the raw URL segments and returned 200 +
// index,follow with a self-canonical, so any string pair minted a new page in
// the index off content that does not exist. There is nothing real to validate
// the segments against, so the whole route is noindex and canonicalises to the
// tool it duplicates (same treatment as the /embed/widget shells).
export async function generateMetadata() {
  return createPageMetadata({
    title: "Skill Demand Analyzer",
    description:
      "Score how much the job market wants a skill from live openings, growth, applicants per posting, salary premium and remote share.",
    path: TOOL_PATH,
    canonical: TOOL_PATH,
    noindex: true,
  });
}

export default function SkillSeoPage() {
  // ToolClient only takes `slug`/`category`; there is no prefill to pass, which
  // is exactly why this route has no content of its own.
  return <ToolClient slug={TOOL_SLUG} />;
}
