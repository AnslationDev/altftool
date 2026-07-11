import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  PlayCircle,
  CalendarCheck,
  TrendingUp,
  Users,
  Star,
  ShieldCheck,
} from "lucide-react";
import Container from "../ui/Container";
import AnimatedCounter from "../ui/AnimatedCounter";
import { heroStats } from "../../data/stats";
import { goTo } from "../../utils/nav";

const floatingCards = [
  {
    icon: TrendingUp,
    label: "ROAS Today",
    value: "7.4x",
    pos: "left-0 top-24 sm:-left-6",
    color: "text-success",
  },
  {
    icon: Users,
    label: "New Partners",
    value: "+128",
    pos: "right-0 top-44 sm:-right-4",
    color: "text-brand-cyan",
  },
  {
    icon: ShieldCheck,
    label: "Quality Score",
    value: "9.6/10",
    pos: "bottom-10 left-2 sm:-left-4",
    color: "text-brand-purple",
  },
];

const heroImages = [
  "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=800&q=80",
];

export default function Hero() {
  const [currentImg, setCurrentImg] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImg((prev) => (prev + 1) % heroImages.length);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section id="home" className="relative overflow-hidden pt-20 pb-16 sm:pt-24">
      {/* Clean Grid Background without the heavy purple blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-g [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]" />
      {/* Subtle brand glow instead of solid purple */}
      <div className="pointer-events-none absolute right-0 top-1/4 -z-10 h-[30rem] w-[30rem] anim-float-s rounded-full bg-brand/5 blur-3xl dark:bg-brand/10" />

      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <motion.span
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="chp-b"
            >
              <span className="flex h-2 w-2">
                <span className="absolute h-2 w-2 animate-ping rounded-full bg-success opacity-75" />
                <span className="h-2 w-2 rounded-full bg-success" />
              </span>
              #1 Performance Marketing Agency 2026
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.05 }}
              className="mt-5 text-4xl font-extrabold leading-[1.05] tracking-tight text-ink dark:text-white sm:text-5xl lg:text-6xl"
            >
              We Engineer{" "}
              <span className="gt">Marketing Growth</span>{" "}
              That Compounds
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.12 }}
              className="mt-5 max-w-xl text-lg leading-relaxed text-slate-600 dark:text-slate-300"
            >
              ApexBoost turns clicks into customers through{" "}
              <strong className="font-semibold text-ink dark:text-white">Digital</strong>,{" "}
              <strong className="font-semibold text-ink dark:text-white">Affiliate</strong> and{" "}
              <strong className="font-semibold text-ink dark:text-white">Advertising</strong>{" "}
              marketing — powered by data, obsessed with ROI.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.18 }}
              className="mt-8 flex flex-wrap items-center gap-3"
            >
              <button
                onClick={() => goTo("/contact")}
                className="btn btn-p"
              >
                Get Started <ArrowRight size={16} />
              </button>
              <button
                onClick={() => goTo("/contact")}
                className="btn btn-s"
              >
                <CalendarCheck size={16} /> Book Consultation
              </button>
              <button
                onClick={() => goTo("/services")}
                className="btn btn-g"
              >
                <PlayCircle size={18} className="text-brand" /> Watch Demo
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.24 }}
              className="mt-10 grid max-w-md grid-cols-3 gap-4"
            >
              {heroStats.map((s) => (
                <div key={s.label}>
                  <div className="text-2xl font-bold text-ink dark:text-white sm:text-3xl">
                    <AnimatedCounter
                      value={s.value}
                      decimals={s.decimals || 0}
                      prefix={s.prefix || ""}
                      suffix={s.suffix || ""}
                    />
                  </div>
                  <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{s.label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative mx-auto w-full max-w-lg"
          >
            <div className="anim-float">
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl border border-white/20 bg-slate-900 shadow-2xl shadow-brand/20 dark:border-white/10">
                <AnimatePresence mode="popLayout">
                  <motion.img
                    key={currentImg}
                    src={heroImages[currentImg]}
                    alt="Marketing Dashboard"
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                </AnimatePresence>
              </div>
            </div>

            {floatingCards.map((c, i) => (
              <motion.div
                key={c.label}
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.6 + i * 0.15 }}
                className={`absolute ${c.pos} hidden items-center gap-3 rounded-2xl border border-white/50 bg-white/90 p-3 pr-4 shadow-xl backdrop-blur dark:border-white/10 dark:bg-slate-800/90 sm:flex`}
              >
                <div className={`grid h-10 w-10 place-items-center rounded-xl bg-slate-100 dark:bg-white/10 ${c.color}`}>
                  <c.icon size={20} />
                </div>
                <div>
                  <div className="text-[0.7rem] text-slate-500 dark:text-slate-400">{c.label}</div>
                  <div className="text-sm font-bold text-ink dark:text-white">{c.value}</div>
                </div>
              </motion.div>
            ))}

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.9 }}
              className="absolute -bottom-5 right-2 flex items-center gap-2 rounded-2xl border border-white/50 bg-white/90 px-4 py-2.5 shadow-xl backdrop-blur dark:border-white/10 dark:bg-slate-800/90 sm:right-8"
            >
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} className="fill-warning text-warning" />
                ))}
              </div>
              <span className="text-xs font-semibold text-ink dark:text-white">
                4.9/5 · 520+ reviews
              </span>
            </motion.div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
