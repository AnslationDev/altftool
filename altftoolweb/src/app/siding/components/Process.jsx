import { motion } from "framer-motion";
import { MessageSquare, Search, Hammer, ClipboardCheck } from "lucide-react";

const steps = [
  {
    icon: MessageSquare,
    title: "Consultation",
    desc: "We learn about your vision, walk you through siding options, and provide a free in-home design consultation.",
    duration: "Day 1",
  },
  {
    icon: Search,
    title: "Inspection",
    desc: "Our project engineers perform a 27-point exterior inspection and provide a detailed transparent quote.",
    duration: "Day 2–3",
  },
  {
    icon: Hammer,
    title: "Installation",
    desc: "Certified crews complete your installation in 5–10 days using premium fasteners, flashing, and weather barriers.",
    duration: "Day 4–14",
  },
  {
    icon: ClipboardCheck,
    title: "Final Walkthrough",
    desc: "Quality manager performs a 50-point inspection with you and registers your lifetime warranty on the spot.",
    duration: "Final Day",
  },
];

export default function Process() {
  return (
    <section id="process" className="pt-12 pb-12 lg:pt-16 lg:pb-16 bg-primary relative overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-[0.06]" />
      <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-secondary/15 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-5 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-dark text-primary-foreground text-xs font-bold tracking-wider uppercase mb-4">
            Our Process
          </div>
          <h2 className="font-display font-extrabold text-4xl lg:text-5xl text-primary-foreground leading-tight">
            A Simple, Stress-Free Project Experience
          </h2>
          <p className="mt-5 text-lg text-primary-foreground/80">
            From your first call to your final walkthrough — clear communication every step of the way.
          </p>
        </motion.div>

        <div className="relative">
          {/* Connector line */}
          <div className="hidden lg:block absolute top-12 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-secondary/60 to-transparent" />

          <div className="grid lg:grid-cols-4 gap-8 lg:gap-6 relative">
            {steps.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                className="relative text-center"
              >
                <div className="relative inline-flex">
                  <div className="relative w-24 h-24 rounded-full bg-surface text-primary flex items-center justify-center shadow-glow">
                    <s.icon className="w-9 h-9" strokeWidth={2} />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-br from-secondary to-primary-hover text-primary-foreground text-sm font-bold flex items-center justify-center shadow-lg border-2 border-primary">
                    {i + 1}
                  </div>
                </div>
                <div className="mt-5 text-xs font-bold tracking-wider uppercase text-secondary">{s.duration}</div>
                <h3 className="mt-2 font-display font-bold text-2xl text-primary-foreground">{s.title}</h3>
                <p className="mt-3 text-primary-foreground/80 leading-relaxed max-w-xs mx-auto">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
