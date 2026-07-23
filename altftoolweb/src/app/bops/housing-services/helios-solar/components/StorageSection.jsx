import { motion } from "framer-motion";

export default function StorageSection() {
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <section id="battery-storage" className="light-section">
      <div className="container">
        <div className="split-grid">
          <motion.div
            initial={{ opacity: 0, x: -80 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8 }}
            className="section-img section-img--taller"
          >
            <img
              src="https://images.unsplash.com/photo-1660330589257-813305a4a383?auto=format&fit=crop&w=1400&q=82"
              alt="Helios Battery Storage"
              className="opacity-90"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 80 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-start"
          >
            <span className="section-overline section-overline--dark">Battery Storage</span>
            <h2 className="section-heading">Store What You Generate.</h2>
            <p className="section-body">
              Pair your solar system with Helios Battery Storage and keep the power on around the clock — even when the grid goes down.
            </p>
            <div className="storage-stats-grid mb-10 w-full">
              {[
                { title: "13.5 kWh", sub: "Capacity" },
                { title: "24/7", sub: "Backup Ready" },
                { title: "Smart", sub: "App Controlled" }
              ].map((stat, i) => (
                <div key={i} className="storage-stat">
                  <div className="storage-stat-value">{stat.title}</div>
                  <div className="storage-stat-label">{stat.sub}</div>
                </div>
              ))}
            </div>
            <button
              onClick={() => scrollTo("contact")}
              className="section-cta-btn"
            >
              Learn About Storage →
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
