import { motion } from "framer-motion";

const serviceHighlights = [
  { title: "Homeowner-First Approach", label: "Focused on Your Project" },
  { title: "Clear, Upfront Pricing", label: "No Hidden Fees" },
  { title: "Dependable Scheduling", label: "Work Around Your Timeline" },
  { title: "Attentive Project Support", label: "Questions Answered Fast" },
];

const qualityPoints = [
  { name: "Quality Workmanship", subline: "Guaranteed", style: "font-black text-3xl tracking-tight" },
  { name: "Careful Site Protection", subline: "Every Project", style: "font-extrabold text-2xl tracking-tight" },
  { name: "Materials Built to Last", subline: "For the Elements", style: "font-black text-3xl tracking-tight" },
  { name: "Clean Job Sites", subline: "Respect for Your Home", style: "font-extrabold text-2xl tracking-tight" },
  { name: "Clear Communication", subline: "Daily Updates", style: "font-black text-3xl tracking-[0.04em]" },
  { name: "Responsive Support", subline: "Fast Answers", style: "font-extrabold text-xl tracking-[0.12em]" },
];

function ServiceHighlight({ item }) {
  return (
    <div className="text-center">
      <div className="text-2xl lg:text-3xl font-extrabold font-display text-gradient leading-tight">
        {item.title}
      </div>
      <div className="mt-3 text-sm font-semibold text-foreground/75">{item.label}</div>
    </div>
  );
}

function QualityPoint({ cert }) {
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
              Built Around Homeowner Trust
            </h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4">
            {serviceHighlights.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="border-l border-border first:border-l-0 lg:px-4"
              >
                <ServiceHighlight item={item} />
              </motion.div>
            ))}
          </div>
        </motion.div>

        <div className="mt-10 overflow-hidden border-y border-border bg-surface py-6">
          <div className="text-center text-xs font-extrabold tracking-[0.2em] uppercase text-foreground/75 mb-6">
            Our Service Commitments
          </div>
          <div className="relative">
            <div className="flex gap-10 animate-marquee whitespace-nowrap">
              {[...Array(2)].flatMap((_, k) =>
                qualityPoints.map((cert, i) => (
                  <QualityPoint key={`${k}-${i}`} cert={cert} />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
