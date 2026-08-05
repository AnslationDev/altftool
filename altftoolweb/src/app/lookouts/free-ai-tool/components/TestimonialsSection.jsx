import { Quote } from "lucide-react";
import { TESTIMONIALS } from "../data/tools";
import SectionHeading from "./SectionHeading";

export default function TestimonialsSection() {
  return (
    <section id="testimonials" className="scroll-mt-24 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Who it's for"
          title="Built for people who ship"
          subtitle="A quick look at how different people put this directory to work."
        />

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map(({ role, icon: Icon, quote }) => (
            <figure key={role} className="fat-card flex h-full flex-col rounded-3xl p-6">
              <Quote className="h-6 w-6 text-violet-300" aria-hidden="true" />
              <blockquote className="mt-3 flex-1 text-[15px] leading-relaxed text-slate-700">
                “{quote}”
              </blockquote>
              <figcaption className="mt-5 flex items-center gap-2.5 border-t border-slate-100 pt-4">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-50">
                  <Icon className="h-4 w-4 text-violet-600" aria-hidden="true" />
                </span>
                <span className="text-sm font-semibold text-slate-800">{role}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
