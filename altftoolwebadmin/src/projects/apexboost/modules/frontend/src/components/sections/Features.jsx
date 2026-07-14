import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Container from "../ui/Container";
import Reveal from "../ui/Reveal";
import SectionHeading from "../ui/SectionHeading";
import { features, featuresHeading } from "../../data/features";
import { goTo } from "../../utils/nav";

const featureImages = [
  "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=1200&q=80",
];

export default function Features() {
  const [activeFeature, setActiveFeature] = useState(0);

  // Use only first 6 features to keep the list clean and balanced with the image height
  const displayFeatures = features.slice(0, 6);

  return (
    <section className="sec bg-soft dark:bg-slate-900/40">
      <Container>
        <SectionHeading
          eyebrow={featuresHeading.eyebrow}
          title={featuresHeading.title}
          highlight={featuresHeading.highlight}
          subtitle={featuresHeading.subtitle}
        />
        
        <div className="mt-16 grid items-start gap-12 lg:grid-cols-[1fr_1fr] xl:gap-20">
          
          {/* Left: Feature List */}
          <div className="flex flex-col gap-4">
            {displayFeatures.map((f, i) => {
              const isActive = activeFeature === i;
              return (
                <Reveal key={f.title} delay={i * 0.1}>
                  <div
                    onMouseEnter={() => setActiveFeature(i)}
                    className={`group cursor-pointer rounded-3xl border p-6 transition-all duration-300 ${
                      isActive
                        ? "border-brand/40 bg-white shadow-xl shadow-brand/10 dark:border-brand/40 dark:bg-slate-800"
                        : "border-transparent bg-transparent hover:bg-white/60 dark:hover:bg-slate-800/50"
                    }`}
                  >
                    <div className="flex items-start gap-5">
                      <div
                        className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl shadow-sm transition-colors duration-300 ${
                          isActive
                            ? "bg-gradient-to-br from-brand to-brand-cyan text-white"
                            : "bg-brand/10 text-brand dark:bg-white/10 dark:text-slate-300"
                        }`}
                      >
                        <f.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                      </div>
                      <div>
                        <h3
                          className={`text-lg font-bold transition-colors ${
                            isActive ? "text-brand dark:text-brand-cyan" : "text-ink dark:text-white"
                          }`}
                        >
                          {f.title}
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                          {f.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>

          {/* Right: Interactive Image Container */}
          <Reveal delay={0.3}>
            <div className="sticky top-28 overflow-hidden rounded-[2.5rem] border border-slate-200 bg-slate-900 shadow-2xl dark:border-white/10">
              <div className="relative aspect-square w-full sm:aspect-[4/3] lg:aspect-square xl:aspect-[4/3]">
                <AnimatePresence mode="popLayout">
                  <motion.img
                    key={activeFeature}
                    src={displayFeatures[activeFeature].image || featureImages[activeFeature % featureImages.length]}
                    alt={displayFeatures[activeFeature].title}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6 }}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                </AnimatePresence>
                
                {/* Image overlay gradients for premium look */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-8 left-8 right-8">
                  <motion.div
                    key={`text-${activeFeature}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-xs font-semibold text-white backdrop-blur-md">
                      <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
                      Live Preview
                    </div>
                    <h4 className="mt-3 text-2xl font-bold text-white drop-shadow-md">
                      {displayFeatures[activeFeature].title}
                    </h4>
                  </motion.div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>

        <Reveal>
          <div className="mt-20 flex flex-col items-center justify-between gap-5 rounded-3xl bg-gradient-to-r from-brand to-brand-purple p-8 text-white sm:flex-row sm:p-10">
            <div>
              <h3 className="text-2xl font-bold text-white">See your growth live.</h3>
              <p className="mt-1 text-white/80">Get a free walkthrough of our performance dashboard tailored to your brand.</p>
            </div>
            <button
              onClick={() => goTo("/contact")}
              className="btn btn-l shrink-0"
            >
              Request Demo <ArrowRight size={16} />
            </button>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
