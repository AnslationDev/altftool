import Icon from "../components/Icons.jsx";
import PageHero from "../components/PageHero.jsx";
import {
  Container,
  Reveal,
  SectionHeading,
  Eyebrow,
  Button,
} from "../components/ui.jsx";
import { img, company, stats, values, team } from "../data/site.js";
import { useActionPopup } from "../components/ActionPopup.jsx";

export default function About() {
  const { trigger: triggerPopup, Popup } = useActionPopup();
  return (
    <>
      <Popup />
      <PageHero
        eyebrow="About Lumina"
        title="A studio obsessed with light & craft"
        description="We're a team of designers, engineers and craftspeople on a mission to make every opening in your home a thing of beauty."
        image={7587858}
        current="About"
      />

      {/* STORY */}
      <section className="py-24 sm:py-32">
        <Container className="grid items-center gap-14 lg:grid-cols-2">
          <Reveal className="relative order-2 lg:order-1">
            <div className="overflow-hidden rounded-[2rem] shadow-xl shadow-ink/10">
              <img
                src={img(8961394, 1000)}
                alt="A Lumina craftsman at work"
                className="aspect-[4/5] w-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -right-2 hidden w-52 rounded-2xl border border-stone-200 bg-white p-6 shadow-2xl shadow-ink/10 sm:block">
              <div className="font-display text-3xl font-semibold text-bronze-600">Est. 2001</div>
              <p className="mt-1 text-sm text-stone-500">Two decades of refining the craft.</p>
            </div>
            <div className="absolute -left-4 -top-4 -z-10 h-36 w-36 rounded-3xl bg-bronze-200/50" />
          </Reveal>

          <div className="order-1 lg:order-2">
            <Eyebrow>Our Story</Eyebrow>
            <Reveal delay={80}>
              <h2 className="mt-4 font-display text-3xl font-semibold leading-tight text-ink sm:text-4xl">
                It started with a simple belief: a window should be more than a hole in the wall.
              </h2>
            </Reveal>
            <Reveal delay={150}>
              <div className="mt-6 space-y-4 text-lg leading-relaxed text-stone-600">
                <p>
                  Founded in 2001, {company.full} began as a small workshop with a
                  big idea — that windows deserve the same design attention as any
                  piece of architecture. What started with a handful of local
                  homes has grown into one of the region's most trusted names in
                  premium windows and facade systems.
                </p>
                <p>
                  Today we combine an in-house design studio, a precision
                  manufacturing unit and certified installation crews under one
                  roof. That vertical integration is why our work fits perfectly,
                  performs flawlessly and lasts for decades.
                </p>
              </div>
            </Reveal>
            <Reveal delay={220}>
              <div className="mt-8 grid grid-cols-3 gap-6 border-t border-stone-200 pt-7">
                {[
                  { k: "25+", v: "Years" },
                  { k: "60+", v: "Craftspeople" },
                  { k: "12K+", v: "Windows built" },
                ].map((x) => (
                  <div key={x.v}>
                    <div className="font-display text-2xl font-semibold text-bronze-600 sm:text-3xl">
                      {x.k}
                    </div>
                    <div className="text-sm text-stone-500">{x.v}</div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* VALUES */}
      <section className="bg-cream-100 py-24 sm:py-32">
        <Container>
          <SectionHeading
            eyebrow="What We Stand For"
            title="Principles behind every project"
            description="Four values that guide how we design, build and treat the people who trust us with their homes."
          />
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v, i) => (
              <Reveal
                key={v.title}
                delay={(i % 4) * 80}
                className="group rounded-2xl border border-stone-200 bg-white p-7 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-ink/5"
              >
                <span className="flex h-13 w-13 items-center justify-center rounded-xl bg-bronze-100 text-bronze-700 transition-transform group-hover:scale-110">
                  <Icon name={v.icon} className="h-7 w-7" />
                </span>
                <h3 className="mt-5 font-display text-lg font-semibold text-ink">
                  {v.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-stone-600">{v.text}</p>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* MISSION / VISION */}
      <section className="py-24 sm:py-32">
        <Container className="grid gap-7 lg:grid-cols-2">
          <Reveal>
            <div className="relative h-full overflow-hidden rounded-3xl bg-ink p-9 text-white sm:p-11">
              <div className="bg-grid pointer-events-none absolute inset-0 opacity-40" />
              <div className="relative">
                <Icon name="target" className="h-10 w-10 text-bronze-400" />
                <h3 className="mt-5 font-display text-2xl font-semibold">Our Mission</h3>
                <p className="mt-4 text-lg leading-relaxed text-stone-300">
                  To craft windows and facades that elevate the way people
                  experience light, space and comfort — delivered with honesty,
                  precision and care.
                </p>
              </div>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <div className="relative h-full overflow-hidden rounded-3xl bg-gradient-to-br from-bronze-600 to-bronze-800 p-9 text-white sm:p-11">
              <div className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-white/10 blur-2xl" />
              <div className="relative">
                <Icon name="sparkles" className="h-10 w-10 text-white" />
                <h3 className="mt-5 font-display text-2xl font-semibold">Our Vision</h3>
                <p className="mt-4 text-lg leading-relaxed text-bronze-100">
                  To be India's most trusted design-led window and facade studio —
                  setting the benchmark for quality, sustainability and timeless
                  beauty in every opening we create.
                </p>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>



      {/* TEAM */}
      <section className="py-24 sm:py-32">
        <Container>
          <SectionHeading
            eyebrow="Meet the Team"
            title="The people behind your windows"
            description="A close-knit team of designers, engineers and craftspeople who genuinely love what they do."
          />
          <div className="mt-14 grid gap-7 sm:grid-cols-2 lg:grid-cols-4">
            {team.map((m, i) => (
              <Reveal key={m.name} delay={(i % 4) * 80}>
                <div className="group flex flex-col items-center rounded-3xl border border-stone-200 bg-white p-8 text-center transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-ink/5">
                  <img
                    src={img(m.imageId, 400)}
                    alt={m.name}
                    className="h-20 w-20 rounded-full object-cover shadow-lg shadow-bronze-700/20 transition-transform group-hover:scale-105"
                  />
                  <h3 className="mt-5 font-display text-lg font-semibold text-ink">{m.name}</h3>
                  <p className="mt-1 text-sm text-bronze-700">{m.role}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="pb-24 sm:pb-32">
        <Container>
          <div className="relative overflow-hidden rounded-[2rem] border border-stone-200 bg-cream-100 p-10 text-center shadow-sm sm:p-16">
            <Eyebrow>Work with us</Eyebrow>
            <h2 className="mx-auto mt-4 max-w-2xl font-display text-3xl font-semibold leading-tight text-ink sm:text-4xl">
              Let's create something that stands the test of time.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-stone-600">
              Whether it's a single window or an entire facade, we'd love to help.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <button
                  onClick={triggerPopup}
                  className="group inline-flex items-center gap-2 rounded-full border border-stone-300 px-6 py-3 text-sm font-semibold text-stone-700 transition-all hover:-translate-y-0.5 hover:border-bronze-500 hover:bg-bronze-600 hover:text-white"
                >
                  Explore Services
                </button>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
