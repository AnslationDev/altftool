import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, ArrowUpRight } from "lucide-react";
import Container from "../ui/Container";
import SectionHeading from "../ui/SectionHeading";
import { portfolio, portfolioFilters } from "../../data/portfolio";

export default function Portfolio() {
  const [filter, setFilter] = useState("All");
  const items =
    filter === "All"
      ? portfolio
      : portfolio.filter((p) => p.category.includes(filter.replace(" Marketing", "").replace("Advertising", "Advertising")));

  return (
    <section id="portfolio" className="sec">
      <Container>
        <SectionHeading
          eyebrow="Portfolio"
          title="Campaigns that moved the"
          highlight="numbers"
          subtitle="A glimpse of the Digital, Affiliate and Advertising campaigns we've engineered into measurable wins."
        />
        <div className="mt-10 flex flex-wrap justify-center gap-2">
          {portfolioFilters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                filter === f
                  ? "bg-gradient-to-r from-brand to-brand-purple text-white shadow-md shadow-brand/30"
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {items.map((p) => (
              <motion.article
                layout
                key={p.id}
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                transition={{ duration: 0.3 }}
                className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-2 hover:shadow-2xl hover:shadow-brand/10 dark:border-white/10 dark:bg-slate-900"
              >
                <div className={`relative h-52 overflow-hidden bg-gradient-to-br ${p.gradient}`}>
                  {/* Campaign image */}
                  {p.image && (
                    <img
                      src={p.image}
                      alt={p.title}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                  {/* Dark gradient overlay for legibility */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/10" />
                  {/* Category badge */}
                  <span className="absolute right-4 top-4 rounded-full bg-white/20 px-3 py-1 text-[0.7rem] font-semibold text-white backdrop-blur border border-white/30">
                    {p.category}
                  </span>
                  {/* Result chip */}
                  <div className="absolute bottom-4 left-5 right-5 flex items-center gap-2 rounded-xl bg-white/90 px-3 py-2 backdrop-blur dark:bg-slate-950/80 shadow-lg">
                    <TrendingUp size={16} className="text-success" />
                    <span className="text-sm font-bold text-ink dark:text-white">{p.result}</span>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-xs font-semibold uppercase tracking-wide text-brand">{p.client}</p>
                  <h3 className="mt-1 text-lg font-bold leading-snug">{p.title}</h3>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{p.metric}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand transition group-hover:gap-2">View case study <ArrowUpRight size={15} /></span>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </div>
      </Container>
    </section>
  );
}
