import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { useState } from "react";

const rows = [
  { attribute: "Durability",        vinyl: "Good",       fiber: "Excellent",  wood: "Moderate",  composite: "Excellent" },
  { attribute: "Maintenance",       vinyl: "Very Low",   fiber: "Low",        wood: "High",      composite: "Low" },
  { attribute: "Cost (per sq ft)",  vinyl: "$3 – $7",    fiber: "$6 – $13",   wood: "$8 – $18",  composite: "$7 – $14" },
  { attribute: "Appearance",        vinyl: "Versatile",  fiber: "Premium",    wood: "Authentic", composite: "Modern" },
  { attribute: "Energy Efficiency", vinyl: "Good",       fiber: "Very Good",  wood: "Moderate",  composite: "Excellent" },
  { attribute: "Lifespan",          vinyl: "20–30 yrs",  fiber: "40–50 yrs",  wood: "20–40 yrs", composite: "30–50 yrs" },
];

const tabs = ["Vinyl", "Fiber Cement", "Wood", "Composite"];
const keys = ["vinyl", "fiber", "wood", "composite"];

const ratingColor = (v) => {
  if (/Excellent|Very Low|Authentic|Modern|Premium/i.test(v)) return "text-emerald-600 bg-emerald-50";
  if (/Good|Very Good|Versatile|Low/i.test(v)) return "text-[#1E5AA8] bg-[#1E5AA8]/10";
  if (/Moderate/i.test(v)) return "text-amber-600 bg-amber-50";
  if (/High/i.test(v)) return "text-rose-600 bg-rose-50";
  return "text-slate-700 bg-slate-100";
};

export default function ComparisonTable() {
  const [active, setActive] = useState(1);

  return (
    <section id="comparison" className="py-24 lg:py-32 bg-gradient-soft">
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-14"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#00AEEF]/10 text-[#0D3B66] text-xs font-bold tracking-wider uppercase mb-4">
            Siding Types Compared
          </div>
          <h2 className="font-display font-extrabold text-4xl lg:text-5xl text-[#0D3B66] leading-tight">
            Find the Right Siding for Your Project
          </h2>
          <p className="mt-5 text-lg text-slate-600">
            A transparent side-by-side comparison of the most popular siding materials.
          </p>
        </motion.div>

        {/* Mobile tabs */}
        <div className="lg:hidden flex gap-2 mb-6 overflow-x-auto no-scrollbar">
          {tabs.map((t, i) => (
            <button
              key={t}
              onClick={() => setActive(i)}
              className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition ${
                active === i ? "bg-[#0D3B66] text-white" : "bg-white text-slate-600 border border-slate-200"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-3xl bg-white shadow-premium border border-slate-100 overflow-hidden"
        >
          {/* Desktop */}
          <div className="hidden lg:block">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-[#0D3B66] to-[#1E5AA8] text-white">
                  <th className="text-left p-6 font-display text-base font-bold">Attribute</th>
                  {tabs.map((t) => (
                    <th key={t} className="p-6 text-center font-display text-base font-bold">{t}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={r.attribute} className={i % 2 === 0 ? "bg-white" : "bg-[#F8FAFC]"}>
                    <td className="p-6 font-semibold text-[#0D3B66]">{r.attribute}</td>
                    {keys.map((k) => (
                      <td key={k} className="p-6 text-center">
                        <span className={`inline-block px-3 py-1.5 rounded-full text-sm font-semibold ${ratingColor(r[k])}`}>
                          {r[k]}
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
                <tr className="bg-white">
                  <td className="p-6"></td>
                  {keys.map((k) => (
                    <td key={k} className="p-6 text-center">
                      <a href="#contact" className="inline-flex items-center gap-1.5 text-sm font-bold text-[#00AEEF] hover:underline">
                        <Check className="w-4 h-4" /> Quote
                      </a>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Mobile single-column */}
          <div className="lg:hidden p-5 space-y-3">
            {rows.map((r) => (
              <div key={r.attribute} className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0">
                <span className="font-semibold text-[#0D3B66]">{r.attribute}</span>
                <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${ratingColor(r[keys[active]])}`}>
                  {r[keys[active]]}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
