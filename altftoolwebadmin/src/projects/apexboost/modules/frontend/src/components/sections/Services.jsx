import { Check, ArrowRight } from "lucide-react";
import Container from "../ui/Container";
import Reveal from "../ui/Reveal";
import SectionHeading from "../ui/SectionHeading";
import { services, servicesHeading } from "../../data/services";
import { goTo } from "../../utils/nav";

export default function Services() {

  return (
    <section id="services" className="sec bg-soft dark:bg-slate-900/40">
      <Container>
        <SectionHeading
          eyebrow={servicesHeading.eyebrow}
          title={servicesHeading.title}
          highlight={servicesHeading.highlight}
          subtitle={servicesHeading.subtitle}
        />

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {services.map((s, i) => (
            <Reveal key={s.id} delay={i * 0.1}>
              <div className="group relative h-full overflow-hidden rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-brand/10 dark:border-white/10 dark:bg-slate-900">
                <div className={`pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-gradient-to-br ${s.accent} opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-30`} />
                <div className={`relative mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br ${s.accent} text-white shadow-lg`}>
                  <s.icon size={26} />
                </div>
                <h3 className="text-xl font-bold">{s.title}</h3>
                <p className="mt-1 text-sm font-medium text-brand">{s.tagline}</p>
                <p className="mt-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{s.description}</p>
                <ul className="mt-5 space-y-2.5">
                  {s.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
                      <span className="grid h-5 w-5 place-items-center rounded-full bg-success/15 text-success">
                        <Check size={13} strokeWidth={3} />
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => goTo(`/services/${s.id}`)}
                  className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-brand transition group-hover:gap-2.5"
                >
                  View Details <ArrowRight size={15} />
                </button>
              </div>
            </Reveal>
          ))}
        </div>


      </Container>
    </section>
  );
}
