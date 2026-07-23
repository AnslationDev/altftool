import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import Services from "./Services.jsx";
import About from "./About.jsx";
import Contact from "./Contact.jsx";
import Blog from "./Blog.jsx";
import { useActionPopup } from "../components/ActionPopup.jsx";
import Icon from "../components/Icons.jsx";
import {
  Container,
  Reveal,
  SectionHeading,
  Eyebrow,
  Button,
  Stars,
  Pill,
} from "../components/ui.jsx";
import {
  img,
  company,
  stats,
  services,
  windowDesigns,
  features,
  steps,
  testimonials,
} from "../data/site.js";

const spanClass = (size) =>
  size === "tall"
    ? "row-span-2"
    : size === "wide"
    ? "col-span-2 sm:col-span-2"
    : "";

export default function Home() {
  const { trigger: triggerPopup, Popup } = useActionPopup();
  const { hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const id = hash.replace("#", "");
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [hash]);

  return (
    <>
      <Popup />
      {/* ===== HERO ===== */}
      <section className="relative flex min-h-[100svh] items-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={img(6580239, 1600)}
            alt="Sunlit living room with floor-to-ceiling windows overlooking a lake"
            className="h-full w-full animate-pan object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-ink/80 via-ink/60 to-ink/70" />
        </div>

        <Container className="relative z-10 pt-32 pb-28">
          <div className="mx-auto max-w-3xl text-center">
            <Reveal>
              <Eyebrow light>Window Design &amp; Facade Specialists</Eyebrow>
            </Reveal>
            <Reveal delay={90}>
              <h1 className="mt-5 font-display text-[2.7rem] font-semibold leading-[1.05] text-white sm:text-6xl lg:text-7xl">
                Windows that{" "}
                <span className="relative whitespace-nowrap text-bronze-300">
                  frame
                  <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" fill="none" preserveAspectRatio="none">
                    <path d="M2 9C50 3 150 3 198 9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
                  </svg>
                </span>{" "}
                your world
              </h1>
            </Reveal>
            <Reveal delay={180}>
              <p className="mt-7 text-lg leading-relaxed text-stone-200">
                From sleek floor-to-ceiling glazing to timeless bay windows, we
                design, manufacture and install premium windows that bring light,
                comfort and elegance to every space.
              </p>
            </Reveal>
            <Reveal delay={260}>
              <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
                <button
                  onClick={triggerPopup}
                  className="group inline-flex items-center gap-2 rounded-full bg-bronze-600 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-bronze-700/20 transition-all hover:-translate-y-0.5 hover:bg-bronze-700 hover:shadow-xl"
                >
                  Explore Designs
                  <Icon name="arrowRight" className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </Reveal>
            <Reveal delay={340}>
              <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm text-stone-300">
                <div className="flex items-center gap-3">
                  <Stars value={5} />
                  <span>
                    <span className="font-semibold text-white">4.9/5</span> from 600+ homeowners
                  </span>
                </div>
                <span className="hidden h-4 w-px bg-white/20 sm:block" />
                <div className="flex items-center gap-2">
                  <Icon name="shield" className="h-5 w-5 text-bronze-300" />
                  Up to 10-year warranty
                </div>
              </div>
            </Reveal>
          </div>
        </Container>


      </section>



      {/* ===== INTRO / ABOUT ===== */}
      <section className="py-24 sm:py-32">
        <Container className="grid items-center gap-14 lg:grid-cols-2">
          <Reveal className="relative">
            <div className="relative overflow-hidden rounded-[2rem]">
              <img
                src={img(8082312, 1100)}
                alt="Elegant living room with large windows and natural light"
                className="aspect-[4/5] w-full object-cover sm:aspect-[5/5]"
              />
            </div>
            <div className="absolute -bottom-8 -right-2 hidden w-56 rounded-2xl border border-stone-200 bg-white p-6 shadow-2xl shadow-ink/10 sm:block">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-bronze-100 text-bronze-700">
                  <Icon name="award" className="h-6 w-6" />
                </span>
                <div>
                  <div className="font-display text-xl font-semibold text-ink">25+</div>
                  <div className="text-xs text-stone-500">years of craft</div>
                </div>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-stone-600">
                Trusted by architects &amp; homeowners across India.
              </p>
            </div>
            <div className="absolute -left-4 -top-4 -z-10 h-40 w-40 rounded-3xl bg-bronze-200/50" />
          </Reveal>

          <div>
            <Eyebrow>Welcome to {company.name}</Eyebrow>
            <Reveal delay={80}>
              <h2 className="mt-4 font-display text-3xl font-semibold leading-tight text-ink sm:text-4xl">
                Crafting light, comfort &amp; timeless elegance — one window at a time.
              </h2>
            </Reveal>
            <Reveal delay={150}>
              <p className="mt-6 text-lg leading-relaxed text-stone-600">
                For over two decades, {company.full} has blended architectural
                precision with artisanal care. We don't just fit windows — we
                engineer daylight, frame views and elevate the way you live.
              </p>
            </Reveal>
            <Reveal delay={210}>
              <ul className="mt-8 grid gap-4 sm:grid-cols-2">
                {[
                  "In-house design & manufacturing",
                  "Certified, tidy installation",
                  "Premium aluminium, uPVC & glass",
                  "Honest pricing & real warranties",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-bronze-100 text-bronze-700">
                      <Icon name="check" className="h-4 w-4" strokeWidth={2.2} />
                    </span>
                    <span className="text-sm font-medium text-stone-700">{item}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal delay={280}>
              <div className="mt-9 flex flex-wrap items-center gap-4">
                <button
                  onClick={triggerPopup}
                  className="group inline-flex items-center gap-2 rounded-full bg-bronze-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-bronze-700/20 transition-all hover:-translate-y-0.5 hover:bg-bronze-700 hover:shadow-xl"
                >
                  More About Us
                  <Icon name="arrowRight" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>
                <Button to="/contact" variant="ghost">
                  Talk to a designer
                </Button>
              </div>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* ===== SERVICES PREVIEW ===== */}
      <section className="bg-cream-100 py-24 sm:py-32">
        <Container>
          <div className="flex flex-col items-end justify-between gap-6 md:flex-row">
            <SectionHeading
              align="left"
              eyebrow="What We Do"
              title="Window solutions, designed & built end-to-end"
              description="From the first sketch to the final seal, we handle every step so your project is seamless, beautiful and built to last."
            />
            <Reveal delay={120} className="hidden shrink-0 md:block">
              <button
                onClick={triggerPopup}
                className="group inline-flex items-center gap-2 rounded-full border border-stone-300 px-6 py-3 text-sm font-semibold text-stone-700 transition-all hover:-translate-y-0.5 hover:border-bronze-500 hover:bg-bronze-50 hover:text-bronze-700"
              >
                All Services
                <Icon name="arrowRight" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </Reveal>
          </div>

          <div className="mt-14 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s, i) => (
              <Reveal key={s.title} delay={(i % 3) * 90}>
                <Link
                  to="/services"
                  className="group flex h-full flex-col overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-ink/10"
                >
                  <div className="relative h-52 overflow-hidden">
                    <img
                      src={img(s.image, 800)}
                      alt={s.title}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/50 to-transparent opacity-60" />
                    <span className="absolute left-5 top-5">
                      <Pill className="border-white/30 bg-white/15 text-white backdrop-blur-sm">
                        0{i + 1}
                      </Pill>
                    </span>
                    <span className="absolute -bottom-6 left-5 flex h-12 w-12 items-center justify-center rounded-xl bg-bronze-600 text-white shadow-lg shadow-bronze-700/30 ring-4 ring-white transition-transform group-hover:scale-110">
                      <Icon name={s.icon} className="h-6 w-6" />
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-6 pt-9">
                    <h3 className="font-display text-xl font-semibold text-ink transition-colors group-hover:text-bronze-700">
                      {s.title}
                    </h3>
                    <p className="mt-3 flex-1 text-sm leading-relaxed text-stone-600">
                      {s.excerpt}
                    </p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* ===== DESIGN GALLERY ===== */}
      <section className="py-24 sm:py-32">
        <Container>
          <SectionHeading
            eyebrow="Design Showcase"
            title="Windows worth framing"
            description="A look at the styles, materials and details we craft every day — from airy minimalism to warm, classic charm."
          />
          <div className="mt-14 grid auto-rows-[170px] grid-flow-dense grid-cols-2 gap-4 sm:auto-rows-[210px] md:grid-cols-4">
            {windowDesigns.map((d, i) => (
              <Reveal
                key={d.title}
                delay={(i % 4) * 70}
                className={spanClass(d.size)}
              >
                <div className="group relative h-full w-full overflow-hidden rounded-2xl">
                  <img
                    src={img(d.image, d.size === "wide" ? 1000 : 700)}
                    alt={d.title}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent opacity-80 transition-opacity group-hover:opacity-90" />
                  <div className="absolute inset-x-0 bottom-0 translate-y-1 p-5 transition-transform duration-300 group-hover:translate-y-0">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-bronze-300">
                      {d.tag}
                    </span>
                    <h3 className="mt-1 font-display text-lg font-semibold text-white">
                      {d.title}
                    </h3>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal className="mt-12 text-center">
            <button
              onClick={triggerPopup}
              className="group inline-flex items-center gap-2 rounded-full border border-stone-300 px-6 py-3 text-sm font-semibold text-stone-700 transition-all hover:-translate-y-0.5 hover:border-bronze-500 hover:bg-bronze-50 hover:text-bronze-700"
            >
              Explore our designs
              <Icon name="arrowRight" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </Reveal>
        </Container>
      </section>

      {/* ===== WHY CHOOSE US (dark) ===== */}
      <section className="relative overflow-hidden bg-bronze-600 py-24 text-white sm:py-32">
        <div className="bg-grid pointer-events-none absolute inset-0 opacity-40" />
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-bronze-600/20 blur-3xl" />
        <Container className="relative">
          <SectionHeading
            light
            eyebrow="Why Lumina"
            title="The difference is in the details"
            description="Premium materials, obsessive craftsmanship and genuine care — the principles behind every window we make."
          />
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <Reveal
                key={f.title}
                delay={(i % 3) * 80}
                className="group rounded-2xl border border-white/10 bg-white/5 p-7 backdrop-blur-sm transition-colors hover:border-bronze-400/40 hover:bg-white/[0.08]"
              >
                <span className="flex h-13 w-13 items-center justify-center rounded-xl bg-bronze-600/20 text-white ring-1 ring-bronze-400/30 transition-transform group-hover:scale-110">
                  <Icon name={f.icon} className="h-7 w-7" />
                </span>
                <h3 className="mt-5 font-display text-xl font-semibold text-white">
                  {f.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-stone-300">{f.text}</p>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* ===== PROCESS ===== */}
      <section className="py-24 sm:py-32">
        <Container>
          <SectionHeading
            eyebrow="How We Work"
            title="A simple, transparent process"
            description="Four clear steps from first hello to flawless finish — no jargon, no surprises."
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
                <h3 className="mt-5 font-display text-lg font-semibold text-ink">
                  {s.title}
                </h3>
                <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-stone-600">
                  {s.text}
                </p>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className="bg-cream-100 py-24 sm:py-32">
        <Container>
          <SectionHeading
            eyebrow="Client Stories"
            title="Loved by homeowners & architects"
            description="Real words from the people who live and work behind our windows."
          />
          <div className="mt-14 grid gap-7 md:grid-cols-2">
            {testimonials.map((t, i) => (
              <Reveal key={t.name} delay={(i % 2) * 90}>
                <figure className="flex h-full flex-col rounded-3xl border border-stone-200 bg-white p-8 shadow-sm">
                  <div className="flex items-center justify-between">
                    <Icon name="quote" className="h-9 w-9 text-bronze-300" fill="currentColor" strokeWidth={0} />
                    <Stars value={t.rating} />
                  </div>
                  <blockquote className="mt-5 flex-1 text-lg leading-relaxed text-stone-700">
                    "{t.quote}"
                  </blockquote>
                  <figcaption className="mt-7 flex items-center gap-4 border-t border-stone-100 pt-6">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-bronze-500 to-bronze-700 font-display text-sm font-semibold text-white">
                      {t.initials}
                    </span>
                    <div>
                      <div className="font-semibold text-ink">{t.name}</div>
                      <div className="text-sm text-stone-500">{t.role}</div>
                    </div>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* ===== CTA BANNER ===== */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={img(6908367, 1600)}
            alt="Bright modern apartment interior with large windows"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-ink/80" />
        </div>
        <Container className="relative z-10 flex flex-col items-center py-24 text-center sm:py-32">
          <Reveal>
            <Eyebrow light>Ready when you are</Eyebrow>
          </Reveal>
          <Reveal delay={90}>
            <h2 className="mt-5 max-w-2xl font-display text-3xl font-semibold leading-tight text-white sm:text-5xl">
              Let's bring more light into your home.
            </h2>
          </Reveal>
          <Reveal delay={170}>
            <p className="mt-5 max-w-xl text-lg text-stone-200">
              Book a free consultation and discover how the right windows can
              transform your space — beautifully.
            </p>
          </Reveal>
          <Reveal delay={240}>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
              <Button href={`tel:${company.phoneHref}`} variant="outlineLight" size="lg">
                <Icon name="phone" className="h-5 w-5" />
                {company.phone}
              </Button>
            </div>
          </Reveal>
        </Container>
      </section>

      {/* FULL PAGES AS SECTIONS */}
      <section id="services">
        <Services />
      </section>

      <section id="about">
        <About />
      </section>

      <section id="contact">
        <Contact />
      </section>

      <section id="blog">
        <Blog />
      </section>
    </>
  );
}
