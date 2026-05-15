import { motion } from "framer-motion";
import { BadgeCheck, FileText, Globe2, ShieldCheck } from "lucide-react";
import { useTypingEffect } from "../hooks/useTypingEffect";

export default function Hero() {
  const typed = useTypingEffect("Fill business details once. Get a professional GDPR/CCPA-ready policy instantly.", 22);
  const stats = [
    { label: "Policy sections", value: "13+", icon: FileText },
    { label: "Compliance modes", value: "GDPR + CCPA", icon: BadgeCheck },
    { label: "Website types", value: "Apps, SaaS, Web", icon: Globe2 },
  ];

  return (
    <section className="pp-hero pp-glass pp-neon overflow-hidden rounded-3xl p-5 sm:p-6 lg:p-7">
      <motion.div
        className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.48fr)] lg:items-center"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div className="min-w-0">
          <div className="mb-4 inline-flex max-w-full items-center gap-2 rounded-full border border-blue-500/25 bg-blue-500/10 px-3.5 py-1.5 text-xs font-black uppercase tracking-wide text-blue-600">
            <ShieldCheck className="h-4 w-4 shrink-0" />
            <span className="min-w-0 truncate">Legal readiness builder</span>
          </div>
          <h1 className="pp-title-gradient max-w-4xl text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
            Privacy Policy Generator
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-(--muted-foreground) sm:text-lg">
            {typed}
            <span className="ml-1 inline-block h-4 w-0.5 translate-y-0.5 bg-blue-500" />
          </p>
        </div>

        <div className="grid min-w-0 gap-3 sm:grid-cols-3 lg:grid-cols-1">
          {stats.map(({ label, value, icon: Icon }) => (
            <div key={label} className="pp-hero-stat">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-blue-500/10 text-blue-600">
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-black uppercase tracking-wide text-(--muted-foreground)">{label}</p>
                <p className="break-words text-lg font-black text-(--foreground)">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
