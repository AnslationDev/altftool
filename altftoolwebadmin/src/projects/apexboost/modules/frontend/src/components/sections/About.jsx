import { motion } from "framer-motion";
import { Target, Eye, Rocket, Award, CheckCircle2, ArrowRight } from "lucide-react";
import Container from "../ui/Container";
import Reveal from "../ui/Reveal";
import SectionHeading from "../ui/SectionHeading";
import aboutTeam from "../../assets/about-team.jpg";
import { goTo } from "../../utils/nav";

const pillars = [
  { icon: Target, title: "Our Mission", desc: "To make measurable, profitable growth accessible to every ambitious brand through honest, data-driven marketing." },
  { icon: Eye, title: "Our Vision", desc: "A world where every marketing dollar is accountable — and every business can grow with confidence." },
  { icon: Rocket, title: "Our Goal", desc: "Generate $1B+ in client revenue by 2030 through performance-focused Digital, Affiliate & Advertising campaigns." },
];

const points = [
  "Senior strategists, not juniors",
  "Full-funnel, cross-channel thinking",
  "Obsessive about ROI & retention",
  "Radical transparency, always",
];

export default function About() {
  return (
    <section id="about" className="sec">
      <Container>
        <div className="grid items-stretch gap-14 lg:grid-cols-2">
          <Reveal className="h-full">
            <div className="relative h-full min-h-[420px]">
              <div className="absolute -left-4 -top-4 h-24 w-24 rounded-2xl bg-gradient-to-br from-brand to-brand-purple opacity-20 blur-2xl" />
              <div className="h-full overflow-hidden rounded-[2rem] border border-slate-200 shadow-xl dark:border-white/10">
                <img
                  src={aboutTeam}
                  alt="ApexBoost marketing team collaborating in a modern office"
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="absolute -bottom-6 -right-3 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl dark:border-white/10 dark:bg-slate-900 sm:-right-6"
              >
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-brand to-brand-purple text-white">
                  <Award size={24} />
                </div>
                <div>
                  <div className="text-xl font-bold text-ink dark:text-white">12+ Years</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Of growth expertise</div>
                </div>
              </motion.div>
            </div>
          </Reveal>

          <div>
            <SectionHeading
              eyebrow="Who We Are"
              center={false}
              title="A performance team built to grow your revenue"
              subtitle="ApexBoost was founded by marketers tired of vanity metrics and empty promises. We exist to do one thing: deliver real, compounding growth across Digital, Affiliate and Advertising — and prove every result."
            />
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {pillars.map((p, i) => (
                <Reveal key={p.title} delay={i * 0.1} className="h-full">
                  <div className="crd flex h-full flex-col p-5 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand/10">
                    <div className="mb-3 grid h-11 w-11 place-items-center rounded-xl bg-brand/10 text-brand">
                      <p.icon size={22} />
                    </div>
                    <h4 className="text-base font-bold">{p.title}</h4>
                    <p className="mt-1.5 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{p.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
            <Reveal delay={0.2}>
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {points.map((pt) => (
                  <div key={pt} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 size={18} className="shrink-0 text-success" />
                    <span className="text-slate-700 dark:text-slate-200">{pt}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => goTo("/services")}
                className="btn btn-p mt-8"
              >
                Explore Our Services <ArrowRight size={16} />
              </button>
            </Reveal>
          </div>
        </div>
      </Container>
    </section>
  );
}
