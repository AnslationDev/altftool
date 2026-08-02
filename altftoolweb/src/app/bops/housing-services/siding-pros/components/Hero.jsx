import { motion, useInView, animate } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, PlayCircle, Star, Home, Award, PaintBucket, Ruler, ChevronDown, ShieldCheck } from "lucide-react";

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
    <section id="home" className="relative min-h-screen overflow-hidden bg-[#0D3B66]">
      <div className="absolute inset-0">
        <img
          src="https://images.pexels.com/photos/8134821/pexels-photo-8134821.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=2000&h=1200"
          alt="Modern luxury home exterior with premium siding and landscaped driveway"
          className="w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#071f38]/78 via-[#0D3B66]/48 to-[#0D3B66]/12" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#071f38]/55 via-transparent to-[#071f38]/12" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_28%_38%,rgba(0,174,239,0.08),transparent_28%),radial-gradient(circle_at_75%_18%,rgba(255,255,255,0.08),transparent_24%)]" />
      </div>

      <div className="absolute top-32 -left-24 w-96 h-96 rounded-full bg-[#00AEEF]/20 blur-3xl" />
      <div className="absolute bottom-20 right-10 w-[28rem] h-[28rem] rounded-full bg-[#1E5AA8]/30 blur-3xl" />
      <div className="absolute inset-0 bg-grid opacity-[0.04]" />

      <div className="relative max-w-7xl mx-auto px-5 lg:px-8 pt-36 pb-24 lg:pt-44 lg:pb-32 flex items-center justify-center text-center">
        {/* Left content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-5xl mx-auto text-white text-center"
        >
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full glass-dark text-xs font-semibold tracking-wide uppercase mb-5 shadow-[0_0_30px_rgba(0,174,239,0.18)]"
          >
            <span className="relative flex w-2 h-2">
              <span className="absolute inset-0 rounded-full bg-[#00AEEF] animate-ping opacity-75" />
              <span className="relative rounded-full w-2 h-2 bg-[#00AEEF]" />
            </span>
            EliteShield Signature Siding Systems
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-4 flex items-center justify-center gap-3 text-[#9be8ff]"
          >
            <span className="h-px w-12 bg-gradient-to-r from-[#00AEEF] to-transparent" />
            <span className="text-sm font-bold tracking-[0.28em] uppercase">EliteShield</span>
          </motion.div>

          <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl xl:text-7xl leading-[1.02] tracking-tight max-w-5xl mx-auto">
            Premium Siding<br />
            <span className="text-white">
              Solutions Built
            </span>
            <br />
            to Protect & Beautify Your Home
          </h1>

          <p className="mt-7 max-w-3xl mx-auto text-base lg:text-lg text-white/86 leading-relaxed">
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
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 backdrop-blur px-4 py-2 text-sm font-semibold text-white/90"
              >
                <item.icon className="w-4 h-4 text-[#00AEEF]" />
                {item.label}
              </motion.div>
            ))}
          </div>

          <div className="mt-9 flex flex-wrap justify-center gap-4">
            <a
              href="#contact"
              className="group inline-flex items-center gap-2 px-7 py-4 rounded-full border border-white/20 bg-white/8 backdrop-blur text-white font-semibold hover:bg-white/15 transition-colors"
            >
              Get My Free Estimate
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="#services"
              className="inline-flex items-center gap-2 px-7 py-4 rounded-full border border-white/20 bg-white/8 backdrop-blur text-white font-semibold hover:bg-white/15 transition-colors"
            >
              <PlayCircle className="w-5 h-5" />
              Explore Services
            </a>
          </div>

          {/*
            The trust row that sat here claimed "4.9/5 from 3,200+ reviews",
            "BBB A+ Accredited" and "Licensed & Insured". None of the three is
            true: there is no review mechanism behind the rating, the BBB
            accreditation does not exist, and no licence does either. On a page
            that asks a homeowner for their phone number, those are the lines
            that make them trust it.
          */}
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
              className={`absolute ${card.pos} w-64 glass rounded-2xl p-5 shadow-premium border border-white/60 hover:scale-[1.03] transition-transform`}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0D3B66] to-[#00AEEF] flex items-center justify-center text-white">
                  {card.icon}
                </div>
                <div>
                  <div className="text-3xl font-extrabold font-display text-[#0D3B66] leading-none">
                    {card.decimal ? (
                      <>{card.value}{card.suffix}</>
                    ) : (
                      <Counter to={card.value} suffix={card.suffix} />
                    )}
                  </div>
                  <div className="text-xs font-semibold text-slate-600 mt-1">{card.label}</div>
                </div>
              </div>
              <div className="mt-3 h-1 rounded-full bg-slate-100 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "85%" }}
                  transition={{ delay: card.delay + 0.4, duration: 1.2 }}
                  className="h-full bg-gradient-to-r from-[#0D3B66] to-[#00AEEF]"
                />
              </div>
            </motion.div>
          ))}

          {/* Floating ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full border-2 border-dashed border-white/18"
          />
        </div>
      </div>

      <motion.a
        href="#services"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden lg:flex flex-col items-center gap-2 text-white/70 hover:text-white transition"
      >
        <span className="text-[10px] font-bold tracking-[0.22em] uppercase">Scroll</span>
        <motion.span animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.6 }} className="w-9 h-9 rounded-full border border-white/20 bg-white/8 backdrop-blur flex items-center justify-center">
          <ChevronDown className="w-4 h-4" />
        </motion.span>
      </motion.a>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent" />
    </section>
  );
}
