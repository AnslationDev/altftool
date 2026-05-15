import ToolClient from "@/app/tools/[category]/[slug]/ToolClient";
import { createPageMetadata, normalizeSlug } from "@/platform/seo/generateMetadata";

export async function generateMetadata({ params }) {
  const { skill, country } = await params;
  const decodedSkill = decodeURIComponent(skill).toUpperCase();
  const decodedCountry = decodeURIComponent(country).toUpperCase();

  return createPageMetadata({
    title: `${decodedSkill} Job Market Demand & Salary in ${decodedCountry} | AltFTool`,
    description: `Analyze the real-time job market demand, average salary, and future growth trends for ${decodedSkill} in ${decodedCountry}.`,
    path: `/skill/${normalizeSlug(decodedSkill)}/${normalizeSlug(decodedCountry)}`,
    keywords: [
      `${decodedSkill} jobs`,
      `${decodedSkill} salary`,
      `${decodedSkill} market demand`,
      `${decodedCountry} tech jobs`,
    ],
  });
}

export default async function SkillSeoPage({ params }) {
  const { skill, country } = await params;

  // We reuse the existing ToolClient wrapper for the skill-demand-analyzer
  // In a real production setup, we might pass initialData down here,
  // but for now setting the metadata is the primary SEO goal.
  return <ToolClient slug="skill-demand-analyzer" initialSearch={decodeURIComponent(skill)} initialCountry={decodeURIComponent(country)} />;
}
