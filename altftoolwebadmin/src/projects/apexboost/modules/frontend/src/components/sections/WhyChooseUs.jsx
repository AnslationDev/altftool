import { ShieldCheck } from "lucide-react";
import Container from "../ui/Container";
import Reveal from "../ui/Reveal";
import SectionHeading from "../ui/SectionHeading";
import { whyChooseUs } from "../../data/whyChooseUs";

export default function WhyChooseUs() {
  return (
    <section className="sec">
      <Container>
        <SectionHeading
          eyebrow="Why Choose Us"
          title="The growth partner brands actually trust"
          subtitle="We're not just another agency. We're an extension of your team — accountable, transparent and relentlessly focused on your results."
        />
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {whyChooseUs.map((item, i) => (
            <Reveal key={item.title} delay={(i % 3) * 0.08}>
              <div className="group relative h-full overflow-hidden rounded-3xl border border-slate-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-brand/30 hover:shadow-xl hover:shadow-brand/5 dark:border-white/10 dark:bg-slate-900/50">
                
                {/* Image Cover */}
                <div className="relative h-48 w-full overflow-hidden">
                  <div className="absolute inset-0 bg-slate-900/10 mix-blend-multiply transition-opacity duration-300 group-hover:opacity-0" />
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>

                {/* Text Content */}
                <div className="p-6 pt-5">
                  <h3 className="text-xl font-bold text-ink dark:text-white">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                    {item.desc}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
