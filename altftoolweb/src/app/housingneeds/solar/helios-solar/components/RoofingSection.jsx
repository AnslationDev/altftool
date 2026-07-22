import { motion } from "framer-motion";
import { solarMedia } from "../media";

export default function RoofingSection() {
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <section id="roofing" className="dark-section">
      <div className="container">
        <div className="split-grid">
          <motion.div
            initial={{ opacity: 0, x: -80 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-start"
          >
            <span className="section-overline section-overline--light">Solar Roofing</span>
            <h2 className="section-heading">Your Roof, Reimagined.</h2>
            <p className="section-body">
              Helios Solar Roofing replaces your existing roof with beautiful, durable glass tiles that generate clean electricity. Unlike traditional panels, our roofing tiles are fully integrated — protecting your home and powering it at the same time.
            </p>
            <div className="flex flex-wrap gap-3 mb-10">
              {["Glass-Tempered Tiles", "3× More Durable", "Class A Fire Rating"].map((f, i) => (
                <span key={i} className="feature-pill">{f}</span>
              ))}
            </div>
            <button
              onClick={() => scrollTo("contact")}
              className="text-link--light"
            >
              Explore Roofing <span className="arrow">→</span>
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 80 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8 }}
            className="section-img section-img--tall"
          >
            <img src={solarMedia.roofing} alt="Modern home with integrated solar roof" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
