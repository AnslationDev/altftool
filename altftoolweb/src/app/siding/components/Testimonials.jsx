import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Quote, Star, ChevronLeft, ChevronRight } from "lucide-react";

/**
 * The five reviews that used to be here — Jessica Hartman (Naples, FL),
 * Marcus Williams (Denver, CO), Priya & Daniel Shah (Austin, TX), Eleanor
 * Whitfield (Boston, MA), Carlos Mendoza (Phoenix, AZ) — were fabricated:
 * invented names, invented quotes, real US cities picked to look plausible.
 * See docs/BACKLINK_EXECUTION_KIT.md ("STOP — read before promoting
 * anything").
 *
 * This component isn't rendered — see the comment in ../App.jsx — but it's
 * kept as a scaffold for whenever there are real reviews, given with
 * permission. That only holds if the placeholder data below never reads as a
 * real person's endorsement, so it's generic copy rather than a disclaimer
 * bolted onto invented names and quotes.
 */
const items = [
  {
    name: "Example Reviewer",
    location: "Sample City, ST",
    review:
      "Placeholder review text showing how a homeowner testimonial displays in this carousel. Swap in a real review once a customer has given permission.",
    project: "Example Project Type",
  },
  {
    name: "Example Reviewer",
    location: "Sample City, ST",
    review:
      "A second placeholder entry, to demonstrate the carousel rotating between reviews. Not a real customer or a real quote.",
    project: "Example Project Type",
  },
  {
    name: "Example Reviewer",
    location: "Sample City, ST",
    review:
      "A third placeholder entry. Replace all of these with genuine, permissioned reviews before this component is ever re-enabled.",
    project: "Example Project Type",
  },
];

const initialsOf = (name) =>
  name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

export default function Testimonials() {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % items.length), 6000);
    return () => clearInterval(t);
  }, [paused]);

  const cur = items[idx];

  return (
    <section id="testimonials" className="pt-4 pb-12 lg:pt-6 lg:pb-16 bg-surface relative overflow-hidden">
      <div className="absolute top-20 left-10 w-72 h-72 bg-secondary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />

      <div className="relative max-w-6xl mx-auto px-5 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-14"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary/10 text-primary text-xs font-bold tracking-wider uppercase mb-4">
            Sample Reviews
          </div>
          <h2 className="font-display font-extrabold text-4xl lg:text-5xl text-primary leading-tight">
            Illustrative Homeowner Feedback
          </h2>
          <p className="mt-4 text-sm font-semibold text-foreground/75">
            Example reviews for this demo template — not real customers.
          </p>
        </motion.div>

        <div
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          className="relative bg-gradient-to-br from-light to-surface rounded-3xl border border-border shadow-premium p-8 lg:p-14"
        >
          <Quote className="absolute top-6 right-6 lg:top-10 lg:right-10 w-16 h-16 text-secondary/15" />

          <AnimatePresence mode="wait">
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex gap-1 mb-5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-warning text-warning" />
                ))}
              </div>
              <blockquote className="font-display text-xl lg:text-2xl text-primary leading-relaxed font-medium">
                &quot;{cur.review}&quot;
              </blockquote>
              <div className="mt-8 flex items-center gap-4">
                <div
                  aria-hidden="true"
                  className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-secondary text-primary-foreground flex items-center justify-center font-display font-bold text-lg ring-2 ring-white shadow-md"
                >
                  {initialsOf(cur.name)}
                </div>
                <div>
                  <div className="font-bold text-primary">{cur.name}</div>
                  <div className="text-sm text-foreground/75">{cur.location} • {cur.project}</div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="mt-8 flex items-center justify-between">
            <div className="flex gap-2">
              {items.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIdx(i)}
                  className={`h-2 rounded-full transition-all ${i === idx ? "w-8 bg-primary" : "w-2 bg-border"}`}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setIdx((i) => (i - 1 + items.length) % items.length)}
                className="w-11 h-11 rounded-full bg-surface border border-border hover:border-secondary text-primary flex items-center justify-center transition">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button onClick={() => setIdx((i) => (i + 1) % items.length)}
                className="w-11 h-11 rounded-full bg-gradient-to-r from-primary to-primary-hover text-primary-foreground flex items-center justify-center hover:scale-105 transition">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
