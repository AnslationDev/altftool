import ToolClient from "@/app/tools/[category]/[slug]/ToolClient";
import { createPageMetadata, normalizeSlug } from "@/platform/seo/generateMetadata";

export async function generateMetadata({ params }) {
  const { skill, country } = await params;
  const decodedSkill = decodeURIComponent(skill).toUpperCase();
  const decodedCountry = decodeURIComponent(country).toUpperCase();

  return createPageMetadata({
    title: `${decodedSkill} Job Market Demand & Salary in ${decodedCountry}`,
    description: `Analyze the real-time job market demand, average salary, and future growth trends for ${decodedSkill} in ${decodedCountry}.`,
    path: `/skill/${normalizeSlug(decodedSkill)}/${normalizeSlug(decodedCountry)}`,
    keywords: [
      `${decodedSkill} jobs`,
      `${decodedSkill} salary`,
      `${decodedSkill} market demand`,
      `${decodedCountry} tech jobs`,
    ],
    // This route accepts any [skill]/[country] string pair and renders the
    // same generic, unfilled tool shell for all of them (the underlying
    // skill-demand-analyzer tool doesn't currently read these URL params) —
    // indexing every combination would ship Google unlimited near-duplicate
    // thin-content pages. noindex until the tool actually consumes the params.
    noindex: true,
  });
}

export default async function SkillSeoPage({ params }) {
  const { skill, country } = await params;

  // We reuse the existing ToolClient wrapper for the skill-demand-analyzer
  // In a real production setup, we might pass initialData down here,
  // but for now setting the metadata is the primary SEO goal.
  return <ToolClient slug="skill-demand-analyzer" initialSearch={decodeURIComponent(skill)} initialCountry={decodeURIComponent(country)} />;
}
