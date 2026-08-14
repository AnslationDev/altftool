import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowDown } from "lucide-react";

export default function HeroSection() {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 1000], [0, 400]);
  const opacity = useTransform(scrollY, [0, 500], [1, 0]);

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  const containerVariants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.15 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  return (
    <section className="hero">
      <motion.div className="hero-bg" style={{ y, opacity }}>
        <div className="hero-bg-overlay" />
        <img
          src="https://images.unsplash.com/photo-1509389928833-fe62aef36deb?auto=format&fit=crop&w=1800&q=82"
          alt="Helios Solar Home"
        />
      </motion.div>

      <div className="hero-content">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="hero-tagline"
        >
          — Helios Solar —
        </motion.p>

        {/* h1, not div: this is the page's primary heading, but the whole
            Helios Solar lander shipped with no <h1> in any component, so the
            document had no top-level heading at all. The three lines become
            spans (h1 takes phrasing content) and .hero-headline > span is
            display:block in helios.css, so the stacked layout is unchanged. */}
        <motion.h1
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="hero-headline"
        >
          <motion.span variants={itemVariants}>Power Your</motion.span>
          <motion.span variants={itemVariants}>World</motion.span>
          <motion.span variants={itemVariants}>With The Sun</motion.span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="hero-subtext"
        >
          Expert solar roofing and panel installation for homes and businesses. 25-year warranty. Nationwide.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="hero-btn-group"
        >
          <button
            onClick={() => scrollTo("contact")}
            className="hero-btn"
          >
            Get Free Quote
          </button>
          <button
            onClick={() => scrollTo("roofing")}
            className="hero-btn"
          >
            See Our Work ↓
          </button>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="hero-scroll-indicator"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        >
          <ArrowDown />
        </motion.div>
      </motion.div>
    </section>
  );
}
