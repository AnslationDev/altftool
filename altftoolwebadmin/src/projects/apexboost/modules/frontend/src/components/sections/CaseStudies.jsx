import Container from "../ui/Container";
import Reveal from "../ui/Reveal";
import SectionHeading from "../ui/SectionHeading";
import { caseStudies } from "../../data/caseStudies.jsx";

export default function CaseStudies() {
  return (
    <section id="case-studies" className="sec bg-soft dark:bg-slate-900/40">
      <Container>
        <SectionHeading
          eyebrow="Case Studies"
          title="Real brands. Real"
          highlight="results."
          subtitle="From challenge to strategy to outcome — here's exactly how we drive transformational growth."
        />
        <div className="mt-14 space-y-8">
          {caseStudies.map((c, i) => (
            <Reveal key={c.id} delay={i * 0.05}>
              <div className="grid gap-0 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm transition hover:shadow-xl dark:border-white/10 dark:bg-slate-900 lg:grid-cols-[0.85fr_1.15fr]">
                {/* Image side */}
                <div className="relative min-h-[220px] overflow-hidden">
                  <img
                    src={c.image}
                    alt={`${c.client} case study`}
                    className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                    loading="lazy"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-tr ${c.accent} opacity-20`} />
                  <div className="absolute left-5 top-5 flex items-center gap-3 rounded-2xl bg-white/90 px-4 py-2.5 backdrop-blur shadow-md dark:bg-slate-950/80">
                    <div className={`grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br ${c.accent} shadow-sm`}>
                      <c.Icon />
                    </div>
                    <div>
                      <h3 className="text-base font-bold leading-tight">{c.client}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{c.industry}</p>
                    </div>
                  </div>
                </div>

                {/* Content side */}
                <div className="grid gap-8 p-6 lg:grid-cols-2 lg:p-9">
                  <div className="space-y-4 self-center">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wide text-danger">The Challenge</span>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{c.challenge}</p>
                    </div>
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wide text-brand">Our Strategy</span>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{c.strategy}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 self-center">
                    {c.results.map((r) => (
                      <div
                        key={r.label}
                        className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-5 text-center dark:border-white/10 dark:from-white/5 dark:to-transparent"
                      >
                        <div className={`bg-gradient-to-r ${c.accent} bg-clip-text text-2xl font-extrabold text-transparent sm:text-3xl`}>
                          {r.value}
                        </div>
                        <div className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">{r.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
