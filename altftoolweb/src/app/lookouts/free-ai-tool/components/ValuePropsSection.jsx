import { VALUE_PROPS } from "../data/tools";
import SectionHeading from "./SectionHeading";

export default function ValuePropsSection() {
  return (
    <section id="why-us" className="scroll-mt-24 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Why this directory"
          title="Built to save you the search"
          subtitle="No dark patterns, no pay-to-rank listings — just a fast way to find a free AI tool that actually works."
        />

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {VALUE_PROPS.map(({ icon: Icon, title, description }) => (
            <div key={title} className="fat-card rounded-3xl p-6">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50">
                <Icon className="h-5 w-5 text-violet-600" aria-hidden="true" />
              </span>
              <h3 className="mt-4 text-base font-bold text-slate-900">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
