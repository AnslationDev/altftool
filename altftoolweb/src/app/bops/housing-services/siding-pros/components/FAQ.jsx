import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Plus } from "lucide-react";

const faqs = [
  { q: "How long does a typical siding installation take?",            a: "Most single-family homes are completed in 5–10 business days. Larger or more complex projects may take up to three weeks. Your project manager provides a precise timeline after the on-site inspection." },
  { q: "What siding material lasts the longest?",                       a: "Fiber cement and high-end composite siding lead the pack with 40–50 year lifespans when installed properly. Premium vinyl typically lasts 20–30 years, while cedar wood can last 20–40 years with regular maintenance." },
  { q: "Do you offer financing options?",                               a: "Yes. We partner with leading lenders to provide 0% APR introductory plans, low monthly payments, and same-day approval — even for full-home siding replacements." },
  { q: "Is your work guaranteed?",                                      a: "Every EliteShield installation is backed by a transferable lifetime craftsmanship warranty plus the full manufacturer warranty on materials. Documentation is registered before our team leaves your driveway." },
  { q: "Will you remove and dispose of my old siding?",                 a: "Absolutely. Full tear-off, debris removal, and on-site cleanup are included in every project. We protect landscaping with drop cloths and run a magnet sweep for any fallen nails." },
];

export default function FAQ() {
  const [open, setOpen] = useState(0);
  return (
    <section id="faq" data-siding-faq className="pt-12 pb-4 lg:pt-16 lg:pb-6 bg-gradient-soft">
      <div className="max-w-4xl mx-auto px-5 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#00AEEF]/10 text-[#0D3B66] text-xs font-bold tracking-wider uppercase mb-4">
            FAQ
          </div>
          <h2 className="font-display font-extrabold text-4xl lg:text-5xl text-[#0D3B66] leading-tight">
            Answers to Your Top Questions
          </h2>
          <p className="mt-5 text-lg text-slate-600">Everything you need to know before booking your free estimate.</p>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.03 }}
                className={`rounded-2xl border transition-all overflow-hidden ${
                  isOpen ? "bg-white border-[#00AEEF]/40 shadow-premium" : "bg-white border-slate-100 hover:border-slate-200"
                }`}
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full text-left px-6 lg:px-8 py-5 flex items-center justify-between gap-4"
                >
                  <span className="font-display font-bold text-[#0D3B66] text-base lg:text-lg">{f.q}</span>
                  <span className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all ${isOpen ? "bg-[#00AEEF] text-white rotate-45" : "bg-slate-100 text-[#0D3B66]"}`}>
                    <Plus className="w-4 h-4" />
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="px-6 lg:px-8 pb-6 text-slate-600 leading-relaxed">{f.a}</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
