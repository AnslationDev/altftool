import { motion, useInView, animate } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, PlayCircle, Star, Home, Award, ShieldCheck, PaintBucket, Ruler, ChevronDown } from "lucide-react";

function Counter({ to, suffix = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, to, {
      duration: 2,
      ease: "easeOut",
      onUpdate: (v) => setVal(Math.floor(v)),
    });
    return () => controls.stop();
  }, [inView, to]);
  return (
    <span ref={ref}>
      {val.toLocaleString()}
      {suffix}
    </span>
  );
}

export default function Hero() {
  return (
    <section id="home" className="relative min-h-screen overflow-hidden bg-primary">
      <div className="absolute inset-0">
        <img
          src="https://images.pexels.com/photos/8134821/pexels-photo-8134821.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=2000&h=1200"
          alt="Modern luxury home exterior with premium siding and landscaped driveway"
          className="w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-dark/78 via-primary/48 to-primary/12" />
        <div className="absolute inset-0 bg-gradient-to-t from-dark/55 via-transparent to-dark/12" />
        <div className="absolute inset-0 bg-gradient-radial" />
      </div>

      <div className="absolute top-32 -left-24 w-96 h-96 rounded-full bg-secondary/20 blur-3xl" />
      <div className="absolute bottom-20 right-10 w-[28rem] h-[28rem] rounded-full bg-primary-hover/30 blur-3xl" />
      <div className="absolute inset-0 bg-grid opacity-[0.04]" />

      <div className="relative max-w-7xl mx-auto px-5 lg:px-8 pt-36 pb-24 lg:pt-44 lg:pb-32 flex items-center justify-center text-center">
        {/* Left content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-5xl mx-auto text-primary-foreground text-center"
        >
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full glass-dark text-xs font-semibold tracking-wide uppercase mb-5 shadow-glow"
          >
            <span className="relative flex w-2 h-2">
              <span className="absolute inset-0 rounded-full bg-secondary animate-ping opacity-75" />
              <span className="relative rounded-full w-2 h-2 bg-secondary" />
            </span>
            EliteShield Signature Siding Systems
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-4 flex items-center justify-center gap-3 text-secondary"
          >
            <span className="h-px w-12 bg-gradient-to-r from-secondary to-transparent" />
            <span className="text-sm font-bold tracking-[0.28em] uppercase">EliteShield</span>
          </motion.div>

          <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl xl:text-7xl leading-[1.02] tracking-tight max-w-5xl mx-auto">
            Premium Siding<br />
            <span className="text-primary-foreground">
              Solutions Built
            </span>
            <br />
            to Protect & Beautify Your Home
          </h1>

          <p className="mt-7 max-w-3xl mx-auto text-base lg:text-lg text-primary-foreground/86 leading-relaxed">
            High-performance siding installation designed to increase curb appeal,
            improve energy efficiency, and protect your property for decades —
            backed by a lifetime craftsmanship guarantee.
          </p>

          <div className="mt-7 flex flex-wrap justify-center gap-3">
            {[
              { icon: ShieldCheck, label: "Storm-ready materials" },
              { icon: PaintBucket, label: "Designer color matching" },
              { icon: Ruler, label: "Precision-fit installation" },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 + i * 0.08 }}
                className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/15 bg-surface/8 backdrop-blur px-4 py-2 text-sm font-semibold text-primary-foreground/90"
              >
                <item.icon className="w-4 h-4 text-secondary" />
                {item.label}
              </motion.div>
            ))}
          </div>

          <div className="mt-9 flex flex-wrap justify-center gap-4">
            <a
              href="#contact"
              className="group inline-flex items-center gap-2 px-7 py-4 rounded-full border border-primary-foreground/20 bg-surface/8 backdrop-blur text-primary-foreground font-semibold hover:bg-surface/15 transition-colors"
            >
              Get My Free Estimate
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="#services"
              className="inline-flex items-center gap-2 px-7 py-4 rounded-full border border-primary-foreground/20 bg-surface/8 backdrop-blur text-primary-foreground font-semibold hover:bg-surface/15 transition-colors"
            >
              <PlayCircle className="w-5 h-5" />
              Explore Services
            </a>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-5 text-primary-foreground/80 text-sm">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-secondary" /> Storm-Ready Materials
            </div>
            <div className="h-4 w-px bg-surface/25" />
            <div className="flex items-center gap-2"><Award className="w-4 h-4 text-secondary" /> Free In-Home Estimates</div>
          </div>
        </motion.div>

        {/* Right floating stats */}
        <div className="hidden">
          {[
            {
              icon: <Award className="w-6 h-6" />,
              value: 25,
              suffix: "+",
              label: "Years Experience",
              pos: "top-0 left-4",
              delay: 0.3,
            },
            {
              icon: <Home className="w-6 h-6" />,
              value: 10000,
              suffix: "+",
              label: "Homes Protected",
              pos: "top-40 right-0",
              delay: 0.5,
            },
            {
              icon: <Star className="w-6 h-6 fill-current" />,
              value: 4.9,
              suffix: "★",
              label: "Customer Rating",
              pos: "bottom-4 left-12",
              delay: 0.7,
              decimal: true,
            },
          ].map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: card.delay, duration: 0.7, ease: "easeOut" }}
              className={`absolute ${card.pos} w-64 glass rounded-2xl p-5 shadow-premium border border-primary-foreground/60 hover:scale-[1.03] transition-transform`}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-foreground">
                  {card.icon}
                </div>
                <div>
                  <div className="text-3xl font-extrabold font-display text-primary leading-none">
                    {card.decimal ? (
                      <>{card.value}{card.suffix}</>
                    ) : (
                      <Counter to={card.value} suffix={card.suffix} />
                    )}
                  </div>
                  <div className="text-xs font-semibold text-foreground/75 mt-1">{card.label}</div>
                </div>
              </div>
              <div className="mt-3 h-1 rounded-full bg-surface-soft overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "85%" }}
                  transition={{ delay: card.delay + 0.4, duration: 1.2 }}
                  className="h-full bg-gradient-to-r from-primary to-secondary"
                />
              </div>
            </motion.div>
          ))}

          {/* Floating ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full border-2 border-dashed border-primary-foreground/18"
          />
        </div>
      </div>

      <motion.a
        href="#services"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden lg:flex flex-col items-center gap-2 text-primary-foreground/70 hover:text-primary-foreground transition"
      >
        <span className="text-[10px] font-bold tracking-[0.22em] uppercase">Scroll</span>
        <motion.span animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.6 }} className="w-9 h-9 rounded-full border border-primary-foreground/20 bg-surface/8 backdrop-blur flex items-center justify-center">
          <ChevronDown className="w-4 h-4" />
        </motion.span>
      </motion.a>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-surface to-transparent" />
    </section>
  );
}
