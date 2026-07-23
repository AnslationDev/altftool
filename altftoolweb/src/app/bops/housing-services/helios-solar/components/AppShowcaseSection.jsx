import { motion } from "framer-motion";
import { Zap, TrendingDown, BellRing } from "lucide-react";

const features = [
  { icon: <Zap className="w-6 h-6 text-white" strokeWidth={1.5} />, title: "Live solar production data" },
  { icon: <TrendingDown className="w-6 h-6 text-white" strokeWidth={1.5} />, title: "Automated bill optimization" },
  { icon: <BellRing className="w-6 h-6 text-white" strokeWidth={1.5} />, title: "Outage protection alerts" }
];

export default function AppShowcaseSection() {
  return (
    <section className="dark-section">
      <div className="container">
        <div className="split-grid">
          <motion.div
            initial={{ opacity: 0, x: -80 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-start"
          >
            <span className="section-overline section-overline--light">Helios App</span>
            <h2 className="section-heading">Real-Time Energy Intelligence.</h2>
            <div className="flex flex-col gap-8 w-full">
              {features.map((feature, i) => (
                <div key={i} className="app-feature-row">
                  <div className="app-feature-icon">{feature.icon}</div>
                  <span className="app-feature-label">{feature.title}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 80 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8 }}
            className="relative flex justify-center lg:justify-end"
          >
            <img src="/assets/home-mobile-apps-premium-transparent.png" alt="Helios Solar App" className="max-h-[600px] object-contain" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
