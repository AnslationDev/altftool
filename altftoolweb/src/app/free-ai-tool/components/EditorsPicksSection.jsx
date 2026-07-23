import { Award } from "lucide-react";
import { getEditorsPickTools } from "../data/tools";
import SectionHeading from "./SectionHeading";
import ToolCard from "./ToolCard";

export default function EditorsPicksSection() {
  const tools = getEditorsPickTools();

  return (
    <section id="editors-picks" className="scroll-mt-24 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow={
            <span className="inline-flex items-center gap-1.5">
              <Award className="h-3.5 w-3.5" aria-hidden="true" />
              Staff favorites
            </span>
          }
          title="Editor's picks"
          subtitle="Eight standouts our team keeps coming back to, one from nearly every corner of the directory."
        />

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {tools.map((tool) => (
            <ToolCard key={`${tool.name}-${tool.domain}`} tool={tool} />
          ))}
        </div>
      </div>
    </section>
  );
}
