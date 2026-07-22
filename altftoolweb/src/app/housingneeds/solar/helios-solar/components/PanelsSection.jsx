import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { solarMedia } from "../media";

export default function PanelsSection() {
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <section id="panels" className="light-section">
      <div className="container">
        <div className="split-grid">
          <motion.div
            initial={{ opacity: 0, x: -80 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8 }}
            className="order-2 lg:order-1 section-img section-img--tall"
          >
            <img src={solarMedia.panels} alt="Residential rooftop solar panels" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 80 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8 }}
            className="order-1 lg:order-2 flex flex-col items-start"
          >
            <span className="section-overline section-overline--dark">Solar Panels</span>
            <h2 className="section-heading">Maximum Output.<br />Minimal Footprint.</h2>
            <p className="section-body">
              Our high-efficiency monocrystalline solar panels deliver 22.8% conversion efficiency — the highest in their class. With a sleek low-profile design and all-black finish, they look great on any roof while quietly cutting your electricity bill.
            </p>
            <div className="flex flex-col gap-4 mb-10 w-full">
              {["22.8% Efficiency", "25-Year Warranty", "Works with Storage"].map((f, i) => (
                <div key={i} className="check-item">
                  <div className="check-circle">
                    <Check className="w-4 h-4 text-black" strokeWidth={3} />
                  </div>
                  <span className="check-label">{f}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => scrollTo("contact")}
              className="text-link--dark"
            >
              Explore Panels <span className="arrow">→</span>
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
