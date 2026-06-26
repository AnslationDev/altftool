import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const services = [
  {
    title: "Vinyl Siding",
    desc: "Cost-effective, low-maintenance siding available in 40+ colors and authentic wood-grain textures.",
    img: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1200&q=80",
    tag: "Best Value",
  },
  {
    title: "Fiber Cement Siding",
    desc: "Hardie-grade composite that resists fire, rot, and pests — engineered for a 50-year lifespan.",
    img: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80",
    tag: "Most Popular",
  },
  {
    title: "Wood Siding",
    desc: "Authentic cedar and redwood profiles for timeless, natural beauty with premium hand-finishing.",
    img: "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?auto=format&fit=crop&w=1200&q=80",
    tag: "Luxury",
  },
  {
    title: "Composite Siding",
    desc: "Engineered wood composites with class-leading durability, color retention, and warranty.",
    img: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80",
    tag: "Premium",
  },
  {
    title: "Insulated Siding",
    desc: "Continuous foam-backed siding that boosts R-value, lowers energy costs, and dampens sound.",
    img: "https://images.unsplash.com/photo-1572120360610-d971b9d7767c?auto=format&fit=crop&w=1200&q=80",
    tag: "Energy Saver",
  },
  {
    title: "Commercial Siding",
    desc: "Large-scale solutions for multi-family, retail, and office properties with minimal disruption.",
    img: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
    tag: "Commercial",
  },
];

export default function Services() {
  return (
    <section id="services" className="relative pb-6 pt-4 lg:pb-8 lg:pt-6 bg-surface">
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <div className="mx-auto mb-14 max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary/10 text-primary text-xs font-bold tracking-wider uppercase mb-4">
              Our Services
            </div>
            <h2 className="font-display font-extrabold text-4xl lg:text-5xl text-primary leading-tight">
              Premium Siding for Every Home & Budget
            </h2>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mx-auto mt-5 max-w-2xl text-lg text-foreground/75"
          >
            Six siding systems, one promise: precision installation, premium materials,
            and craftsmanship guaranteed for life.
          </motion.p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {services.map((s, i) => (
            <motion.article
              key={s.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
              className="group relative rounded-2xl overflow-hidden bg-surface border border-border shadow-premium hover:shadow-premium transition-all"
            >
              <div className="relative h-56 overflow-hidden">
                <img
                  src={s.img}
                  alt={s.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/70 via-transparent to-transparent" />
                <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-surface/90 backdrop-blur text-[10px] font-bold tracking-wider uppercase text-primary">
                  {s.tag}
                </span>
              </div>
              <div className="p-6 lg:p-7">
                <h3 className="font-display font-bold text-xl text-primary">{s.title}</h3>
                <p className="mt-2 text-foreground/75 leading-relaxed">{s.desc}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
