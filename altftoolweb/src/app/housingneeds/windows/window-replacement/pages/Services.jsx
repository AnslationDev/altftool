import Icon from "../components/Icons.jsx";
import PageHero from "../components/PageHero.jsx";
import {
  Container,
  Reveal,
  SectionHeading,
  Eyebrow,
  Button,
  Pill,
} from "../components/ui.jsx";
import { img, services, packages, steps } from "../data/site.js";
import { useActionPopup } from "../components/ActionPopup.jsx";

export default function Services() {
  const { trigger: triggerPopup, Popup } = useActionPopup();
  return (
    <>
      <Popup />
      <PageHero
        eyebrow="Our Services"
        title="Premium windows & facades, built end-to-end"
        description="Design, manufacture, installation and aftercare — one trusted partner for every kind of opening, residential or commercial."
        image={9901861}
        current="Services"
      />

      {/* quick nav chips */}
      <Container className="relative z-20 -mt-10">
        <Reveal className="flex flex-wrap gap-3 rounded-2xl border border-stone-200 bg-white p-4 shadow-lg shadow-ink/5">
          {services.map((s) => (
            <a
              key={s.title}
              href={`#${s.title.replace(/\s+/g, "-").toLowerCase()}`}
              className="inline-flex items-center gap-2 rounded-full bg-cream-100 px-4 py-2 text-sm font-medium text-stone-700 transition-colors hover:bg-bronze-600 hover:text-white"
            >
              <Icon name={s.icon} className="h-4 w-4 text-bronze-600 [.group:hover_&]:text-white" />
              {s.title}
            </a>
          ))}
        </Reveal>
      </Container>

      {/* detailed service rows */}
      <section className="py-24 sm:py-28">
        <Container className="space-y-24">
          {services.map((s, i) => {
            const reversed = i % 2 === 1;
            return (
              <div
                key={s.title}
                id={s.title.replace(/\s+/g, "-").toLowerCase()}
                className="scroll-mt-28 grid items-center gap-10 lg:grid-cols-2 lg:gap-16"
              >
                <Reveal className={reversed ? "lg:order-2" : ""}>
                  <div className="relative">
                    <div className="overflow-hidden rounded-[2rem] shadow-xl shadow-ink/10">
                      <img
                        src={img(s.image, 1000)}
                        alt={s.title}
                        className="aspect-[4/3] w-full object-cover transition-transform duration-700 hover:scale-105"
                      />
                    </div>
                    <div
                      className={`absolute ${
                        reversed ? "-left-4" : "-right-4"
                      } -bottom-6 hidden h-28 w-28 items-center justify-center rounded-2xl bg-bronze-600 text-white shadow-2xl shadow-bronze-700/40 sm:flex`}
                    >
                      <Icon name={s.icon} className="h-12 w-12" />
                    </div>
                    <div
                      className={`absolute ${
                        reversed ? "left-3" : "right-3"
                      } -top-3 -z-10 h-32 w-32 rounded-3xl bg-bronze-200/50`}
                    />
                  </div>
                </Reveal>

                <div className={reversed ? "lg:order-1" : ""}>
                  <Pill>Service 0{i + 1}</Pill>
                  <Reveal delay={80}>
                    <h2 className="mt-4 font-display text-3xl font-semibold leading-tight text-ink sm:text-4xl">
                      {s.title}
                    </h2>
                  </Reveal>
                  <Reveal delay={140}>
                    <p className="mt-5 text-lg leading-relaxed text-stone-600">
                      {s.description}
                    </p>
                  </Reveal>
                  <Reveal delay={200}>
                    <ul className="mt-7 grid gap-3 sm:grid-cols-2">
                      {s.points.map((p) => (
                        <li key={p} className="flex items-start gap-3">
                          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-bronze-100 text-bronze-700">
                            <Icon name="check" className="h-4 w-4" strokeWidth={2.2} />
                          </span>
                          <span className="text-sm font-medium text-stone-700">{p}</span>
                        </li>
                      ))}
                    </ul>
                  </Reveal>
                  <Reveal delay={260}>
                    <button
                      onClick={triggerPopup}
                      className="group mt-8 inline-flex items-center gap-2 rounded-full border border-bronze-600 px-6 py-3 text-sm font-semibold text-bronze-700 transition-all hover:-translate-y-0.5 hover:bg-bronze-600 hover:text-white"
                    >
                      Request this service
                      <Icon name="arrowRight" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </button>
                  </Reveal>
                </div>
              </div>
            );
          })}
        </Container>
      </section>



      {/* PROCESS RECAP */}
      <section className="py-24 sm:py-32">
        <Container>
          <SectionHeading
            eyebrow="How We Work"
            title="From concept to installation"
          />
          <div className="relative mt-16 grid gap-10 md:grid-cols-4">
            <div className="absolute left-0 right-0 top-7 hidden h-px bg-gradient-to-r from-transparent via-bronze-300 to-transparent md:block" />
            {steps.map((s, i) => (
              <Reveal key={s.title} delay={i * 100} className="relative text-center">
                <div className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-bronze-200 bg-white text-bronze-600 shadow-sm">
                  <Icon name={s.icon} className="h-6 w-6" />
                  <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-bronze-600 text-xs font-bold text-white">
                    {i + 1}
                  </span>
                </div>
                <h3 className="mt-5 font-display text-lg font-semibold text-ink">{s.title}</h3>
                <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-stone-600">
                  {s.text}
                </p>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
