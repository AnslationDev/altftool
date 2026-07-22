import { motion } from "framer-motion";
import { BatteryCharging, BellRing, Gauge, Sun, TrendingDown, Zap } from "lucide-react";

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
            <div className="w-full max-w-md rounded-lg border border-border bg-card p-5 text-card-foreground shadow-xl" aria-label="Example solar monitoring dashboard">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div>
                  <p className="text-sm font-semibold">Energy overview</p>
                  <p className="text-xs text-muted-foreground">Illustrative dashboard</p>
                </div>
                <Sun className="text-primary" aria-hidden="true" />
              </div>
              <div className="grid grid-cols-2 gap-3 py-4">
                <div className="rounded-md border border-border bg-muted p-4">
                  <Gauge className="mb-3 text-primary" aria-hidden="true" />
                  <strong className="block text-xl">7.4 kW</strong>
                  <span className="text-xs text-muted-foreground">Generating now</span>
                </div>
                <div className="rounded-md border border-border bg-muted p-4">
                  <BatteryCharging className="mb-3 text-primary" aria-hidden="true" />
                  <strong className="block text-xl">82%</strong>
                  <span className="text-xs text-muted-foreground">Battery reserve</span>
                </div>
              </div>
              <div className="flex h-32 items-end gap-2 rounded-md border border-border bg-muted p-4" aria-hidden="true">
                {[38, 52, 45, 68, 74, 91, 82, 64, 48].map((height, index) => (
                  <span key={index} className="flex-1 rounded-sm bg-primary" style={{ height: `${height}%` }} />
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
