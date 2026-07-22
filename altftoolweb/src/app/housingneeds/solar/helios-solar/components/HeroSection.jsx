import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { solarMedia } from "../media";

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
        <img src={solarMedia.hero} alt="Home with rooftop solar panels" />
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

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="hero-headline"
        >
          <motion.div variants={itemVariants}>Power Your</motion.div>
          <motion.div variants={itemVariants}>World</motion.div>
          <motion.div variants={itemVariants}>With The Sun</motion.div>
        </motion.div>

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
