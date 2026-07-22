import { motion } from "framer-motion";
import { Wrench, CloudRain, ShieldCheck, Zap, Sparkles, Clock } from "lucide-react";

const features = [
  {
    icon: Wrench,
    title: "Expert Installation",
    desc: "Factory-trained installers with an average of 12+ years of field experience deliver flawless results every project.",
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80"
  },
  {
    icon: CloudRain,
    title: "Weather Resistant Materials",
    desc: "Engineered to withstand hurricane-force winds, hail, freeze-thaw cycles, and extreme UV exposure.",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80"
  },
  {
    icon: ShieldCheck,
    title: "Lifetime Warranty",
    desc: "Industry-leading lifetime craftsmanship + transferable manufacturer warranty for total peace of mind.",
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=600&q=80"
  },
  {
    icon: Zap,
    title: "Energy Efficiency",
    desc: "Insulated siding systems reduce energy bills by up to 22% and qualify for federal energy tax credits.",
    image: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=600&q=80"
  },
  {
    icon: Sparkles,
    title: "Premium Craftsmanship",
    desc: "Obsessive attention to detail from trim work to flashing — every seam, cut, and corner inspected.",
    image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80"
  },
  {
    icon: Clock,
    title: "Fast Project Delivery",
    desc: "Most homes completed in 5–10 days with our streamlined logistics and dedicated project crews.",
    image: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=600&q=80"
  },
];

export default function WhyChooseUs() {
  return (
    <section className="relative pb-4 pt-12 lg:pb-6 lg:pt-16 bg-gradient-soft overflow-hidden">
      <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-[#00AEEF]/5 rounded-full blur-3xl" />
      <div className="relative max-w-7xl mx-auto px-5 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#00AEEF]/10 text-[#0D3B66] text-xs font-bold tracking-wider uppercase mb-4">
            Why EliteShield
          </div>
          <h2 className="font-display font-extrabold text-4xl lg:text-5xl text-[#0D3B66] leading-tight">
            A Smarter Way to Protect and Elevate Your Home
          </h2>
          <p className="mt-5 text-lg text-slate-600 leading-relaxed">
            We combine premium materials, skilled craftsmanship, and a detail-first
            process to deliver siding that looks beautiful, performs reliably, and lasts for years.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              whileHover={{ y: -6 }}
              className="group relative bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-[0_4px_20px_rgba(13,59,102,0.06)] hover:shadow-premium transition-all flex flex-col justify-between h-full"
            >
              <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[#0D3B66] to-[#00AEEF] z-20 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />

              <div className="relative h-48 overflow-hidden">
                <img src={f.image} alt={f.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>

              <div className="p-6 lg:p-8 flex-1">
                <h3 className="font-display font-bold text-xl text-[#0D3B66] mb-3 group-hover:text-[#1E5AA8] transition-colors duration-300">{f.title}</h3>
                <p className="text-slate-600 leading-relaxed text-sm">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
