import { motion } from "framer-motion";
import { MapPin } from "lucide-react";

const regions = [
  { region: "Southeast",   cities: ["Atlanta, GA", "Charlotte, NC", "Nashville, TN", "Jacksonville, FL", "Naples, FL", "Charleston, SC"] },
  { region: "Mid-Atlantic",cities: ["Washington, DC", "Richmond, VA", "Philadelphia, PA", "Baltimore, MD", "Pittsburgh, PA", "Newark, NJ"] },
  { region: "Southwest",   cities: ["Austin, TX", "Dallas, TX", "Houston, TX", "Phoenix, AZ", "Tucson, AZ", "Las Vegas, NV"] },
  { region: "Midwest",     cities: ["Chicago, IL", "Indianapolis, IN", "Columbus, OH", "Detroit, MI", "Minneapolis, MN", "St. Louis, MO"] },
];

export default function ServiceAreas() {
  return (
    <section id="service-areas" className="pt-12 pb-4 lg:pt-16 lg:pb-6 bg-gradient-soft">
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-14"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary/10 text-primary text-xs font-bold tracking-wider uppercase mb-4">
            Service Areas
          </div>
          <h2 className="font-display font-extrabold text-4xl lg:text-5xl text-primary leading-tight">
            Proudly Serving Homeowners Nationwide
          </h2>
          <p className="mt-5 text-lg text-foreground/75">
            Local crews, national standards. Find your region below.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {regions.map((r, i) => (
            <motion.div
              key={r.region}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -5 }}
              className="group relative rounded-2xl bg-surface border border-border p-7 shadow-premium hover:shadow-premium transition-all overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-secondary/20 transition-colors" />
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary-hover text-primary-foreground flex items-center justify-center mb-4 shadow-glow">
                  <MapPin className="w-5 h-5" />
                </div>
                <h3 className="font-display font-bold text-xl text-primary">{r.region}</h3>
                <ul className="mt-4 space-y-2">
                  {r.cities.map((c) => (
                    <li key={c} className="flex items-center gap-2 text-sm text-foreground/75">
                      <span className="w-1 h-1 rounded-full bg-secondary" />
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-10 text-center text-sm text-foreground/75">
          Don't see your city? <a href="#contact" className="text-secondary font-semibold hover:underline">Contact us</a> — we're expanding every quarter.
        </div>
      </div>
    </section>
  );
}
