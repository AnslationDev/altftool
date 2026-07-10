import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, CalendarCheck } from "lucide-react";
import { goTo } from "../../utils/nav";

const serviceImages = [
  "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=2000&q=80",
  "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=2000&q=80",
  "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=2000&q=80",
  "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=2000&q=80",
];

/**
 * Services page hero — aspect-video container, image fills edge-to-edge,
 * no left/right bars, no cropping. Text centered on top.
 */
export default function ServicesHero() {
  const [currentImg, setCurrentImg] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImg((prev) => (prev + 1) % serviceImages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative w-full bg-slate-900 pt-20 sm:pt-24">
      {/* 16:9 aspect ratio container — image fills full width & height, no bars, no crop */}
      <div className="relative w-full aspect-video">
        <AnimatePresence mode="popLayout">
          <motion.img
            key={currentImg}
            src={serviceImages[currentImg]}
            alt="Marketing strategy"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
        </AnimatePresence>

        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-slate-900/55" />

        {/* Centered text overlay */}
        <div className="absolute inset-0 flex items-center justify-center px-4">
          <div className="mx-auto w-full max-w-3xl text-center">
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-semibold tracking-wide text-white backdrop-blur-md"
            >
              Full-Funnel Marketing That Delivers Growth
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.05 }}
              className="text-3xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-4xl lg:text-5xl"
            >
              Services that turn clicks into loyal customers
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.12 }}
              className="mt-6 text-lg leading-relaxed text-white/80 sm:text-xl"
            >
              From SEO and paid ads to affiliate programs, ApexBoost combines data-driven
              strategy with flawless execution — so every campaign drives real, measurable
              revenue for your brand.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.18 }}
              className="mt-8 flex flex-wrap items-center justify-center gap-4"
            >
              <button onClick={() => goTo("/contact")} className="btn bg-brand text-white hover:bg-brand-light">
                <CalendarCheck size={16} /> Book Free Consultation
              </button>
              <button
                onClick={() =>
                  document.getElementById("services")?.scrollIntoView({ behavior: "smooth" })
                }
                className="btn border border-white/30 bg-white/10 text-white backdrop-blur-md hover:bg-white/20"
              >
                View Services <ArrowRight size={16} />
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
