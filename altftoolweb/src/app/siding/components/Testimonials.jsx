import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Quote, Star, ChevronLeft, ChevronRight } from "lucide-react";

const items = [
  {
    name: "Jessica Hartman",
    location: "Naples, FL",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
    review:
      "EliteShield transformed our coastal home into something out of a magazine. The crew was punctual, immaculate, and walked us through every detail. Our energy bill dropped 19% the first month.",
    project: "Insulated Fiber Cement Install",
  },
  {
    name: "Marcus Williams",
    location: "Denver, CO",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
    review:
      "After three quotes, EliteShield was the only company that treated our home like their own. Two storms later, not a single panel has budged. Genuinely the best contractor we've worked with.",
    project: "Vinyl Siding Replacement",
  },
  {
    name: "Priya & Daniel Shah",
    location: "Austin, TX",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=400&q=80",
    review:
      "The project manager texted us photos every single day. Finished two days ahead of schedule and the warranty paperwork was registered before they pulled out of the driveway. Five stars.",
    project: "Modern Farmhouse Composite",
  },
  {
    name: "Eleanor Whitfield",
    location: "Boston, MA",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
    review:
      "Restoring a 1908 Victorian is no small task. EliteShield matched our historic trim profiles perfectly and the inspector said it's the cleanest envelope she has ever seen. Highly recommend.",
    project: "Heritage Restoration",
  },
  {
    name: "Carlos Mendoza",
    location: "Phoenix, AZ",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    review:
      "Professional from quote to cleanup. They protected our landscaping, used drop cloths everywhere, and the foreman did a final walkthrough that caught two tiny details I would have missed.",
    project: "Composite Siding Install",
  },
];

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
            Customer Reviews
          </div>
          <h2 className="font-display font-extrabold text-4xl lg:text-5xl text-primary leading-tight">
            Loved by 10,000+ Homeowners
          </h2>
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
                "{cur.review}"
              </blockquote>
              <div className="mt-8 flex items-center gap-4">
                <img src={cur.avatar} alt={cur.name} className="w-14 h-14 rounded-full object-cover ring-2 ring-white shadow-md" />
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
