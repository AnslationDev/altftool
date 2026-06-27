import { motion, useInView, animate } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const stats = [
  { value: 5000, suffix: "+", label: "Projects Completed" },
  { value: 98, suffix: "%", label: "Customer Satisfaction" },
  { value: 25, suffix: "+", label: "Years of Experience" },
  { value: 50, suffix: "+", label: "Industry Experts" },
];

const certifications = [
  { name: "BBB", subline: "A+ Accredited", style: "font-black text-3xl tracking-tight" },
  { name: "GAF", subline: "MasterElite", style: "font-black text-3xl tracking-tight" },
  { name: "ENERGY STAR", subline: "Partner", style: "font-extrabold text-xl tracking-[0.16em]" },
  { name: "NARI", subline: "Certified Remodeler", style: "font-black text-3xl tracking-[0.08em]" },
  { name: "EPA", subline: "Lead-Safe Certified", style: "font-black text-3xl tracking-tight" },
  { name: "InstallShield", subline: "Pro Network", style: "font-extrabold text-2xl tracking-tight" },
  { name: "HomeAdvisor", subline: "Elite Service", style: "font-extrabold text-xl tracking-tight" },
  { name: "Angi", subline: "Certified Pro", style: "font-black text-3xl tracking-tight" },
];

function Counter({ to, suffix = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const c = animate(0, to, { duration: 2, ease: "easeOut", onUpdate: (v) => setVal(Math.floor(v)) });
    return () => c.stop();
  }, [inView, to]);
  return (
    <div ref={ref} className="text-5xl lg:text-6xl font-extrabold font-display text-gradient leading-none">
      {val.toLocaleString()}
      {suffix}
    </div>
  );
}

function CertificationLogo({ cert }) {
  return (
    <div className="flex h-20 min-w-[180px] items-center justify-center px-6 text-foreground/75 grayscale opacity-90 transition hover:text-primary hover:opacity-100">
      <div className="text-center leading-none">
        <div className={`${cert.style} uppercase`}>{cert.name}</div>
        <div className="mt-2 text-[10px] font-extrabold uppercase tracking-[0.24em] text-foreground/75">
          {cert.subline}
        </div>
      </div>
    </div>
  );
}

export default function TrustBar() {
  return (
    <section className="relative -mt-20 z-10 px-5 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="bg-surface rounded-3xl shadow-premium border border-border p-8 lg:p-12"
        >
          <div className="text-center mb-10">
            <div className="text-xs font-bold tracking-[0.2em] uppercase text-secondary mb-3">
              Trusted Nationwide
            </div>
            <h2 className="font-display font-extrabold text-2xl lg:text-3xl text-primary">
              Trusted by Thousands of Homeowners
            </h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4">
            {stats.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center border-l border-border first:border-l-0 lg:px-4"
              >
                <Counter to={s.value} suffix={s.suffix} />
                <div className="mt-3 text-sm font-semibold text-foreground/75">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Brand strip */}
        <div className="mt-10 overflow-hidden border-y border-border bg-surface py-6">
          <div className="text-center text-xs font-extrabold tracking-[0.2em] uppercase text-foreground/75 mb-6">
            Certified Partners & Industry Standards
          </div>
          <div className="relative">
            <div className="flex gap-10 animate-marquee whitespace-nowrap">
              {[...Array(2)].flatMap((_, k) =>
                certifications.map((cert, i) => (
                  <CertificationLogo key={`${k}-${i}`} cert={cert} />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
