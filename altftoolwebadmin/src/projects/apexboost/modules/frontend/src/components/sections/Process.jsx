import Container from "../ui/Container";
import Reveal from "../ui/Reveal";
import SectionHeading from "../ui/SectionHeading";
import { process } from "../../data/process";

export default function Process() {
  return (
    <section className="relative sec overflow-hidden bg-ink text-white">
      <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-[40rem] -translate-x-1/2 rounded-full bg-brand/25 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 bg-g opacity-40" />
      <Container className="relative">
        <SectionHeading
          eyebrow="Our Process"
          title="A proven path from idea to impact"
          subtitle="Eight disciplined steps that turn raw ambition into predictable, scalable marketing growth."
          light
        />
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {process.map((step, i) => (
            <Reveal key={step.title} delay={(i % 4) * 0.08}>
              <div className="group relative h-full rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur transition hover:bg-white/10">
                <div className="mb-5 flex items-center justify-between">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-brand to-brand-purple text-white shadow-lg">
                    <step.icon size={22} />
                  </div>
                  <span className="font-display text-4xl font-extrabold text-white/10 transition group-hover:text-white/20">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white">{step.title}</h3>
                <p className="mt-1.5 text-sm text-white/60">{step.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
