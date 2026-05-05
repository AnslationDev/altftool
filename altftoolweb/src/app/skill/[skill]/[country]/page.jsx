import { toolMetaMap } from "@/platform/registry/toolMetaMap";
import { notFound } from "next/navigation";
import ToolClient from "@/app/tools/[category]/[slug]/ToolClient";

export async function generateMetadata({ params }) {
  const { skill, country } = await params;
  const decodedSkill = decodeURIComponent(skill).toUpperCase();
  const decodedCountry = decodeURIComponent(country).toUpperCase();

  return {
    title: `${decodedSkill} Job Market Demand & Salary in ${decodedCountry} | AltFTool`,
    description: `Analyze the real-time job market demand, average salary, and future growth trends for ${decodedSkill} in ${decodedCountry}.`,
    keywords: `${decodedSkill} jobs, ${decodedSkill} salary, ${decodedSkill} market demand, ${decodedCountry} tech jobs`,
    openGraph: {
      title: `${decodedSkill} Job Market Demand & Salary in ${decodedCountry}`,
      description: `See the current market demand, growth trends, and average salary for ${decodedSkill}.`,
      type: 'website',
    }
  };
}

export default async function SkillSeoPage({ params }) {
  const { skill, country } = await params;

  // We reuse the existing ToolClient wrapper for the skill-demand-analyzer
  // In a real production setup, we might pass initialData down here, 
  // but for now setting the metadata is the primary SEO goal.
  return <ToolClient slug="skill-demand-analyzer" initialSearch={decodeURIComponent(skill)} initialCountry={decodeURIComponent(country)} />;
}
