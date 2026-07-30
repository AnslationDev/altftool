import { motion } from "framer-motion";
import { Target, Eye, Trophy, Users, ShieldCheck, Sparkles, BadgeCheck } from "lucide-react";

const team = [
  {
    name: "Daniel Park",
    role: "Founder & CEO",
    img: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Sarah Bennett",
    role: "VP of Operations",
    img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Marcus Reyes",
    role: "Head of Installations",
    img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Emily Chen",
    role: "Director of Design",
    img: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=600&q=80",
  },
];

const qualityBars = [
  { label: "Installation Precision", value: "98%" },
  { label: "On-Time Completion", value: "94%" },
  { label: "Warranty Satisfaction", value: "99%" },
];

export default function About() {
  return (
    <section id="about" className="pt-12 pb-12 lg:pt-16 lg:pb-16 bg-surface relative overflow-hidden">
      <div className="absolute top-0 left-0 w-[36rem] h-[36rem] bg-secondary/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/3" />
      <div className="absolute bottom-20 right-0 w-[30rem] h-[30rem] bg-primary/10 rounded-full blur-3xl translate-x-1/3" />

      <div className="relative max-w-7xl mx-auto px-5 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative min-h-[560px]"
          >
            <div className="absolute inset-4 rounded-[2.25rem] bg-gradient-to-br from-primary/10 via-secondary/10 to-surface blur-2xl" />

            <div className="relative h-[430px] rounded-[2rem] overflow-hidden shadow-premium border border-primary-foreground/80">
              <img
                src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=85"
                alt="Premium siding completed home"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark/80 via-primary/15 to-transparent" />
              <div className="absolute left-6 right-6 bottom-6">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface/15 backdrop-blur text-primary-foreground text-xs font-bold tracking-[0.18em] uppercase mb-4">
                  Signature Project
                </div>
                <h3 className="font-display font-extrabold text-3xl text-primary-foreground leading-tight">
                  WeatherGuard Fiber Cement Exterior
                </h3>
                <div className="mt-4 grid grid-cols-3 gap-3 max-w-md">
                  {[
                    { label: "Wind Rated", value: "140mph" },
                    { label: "Finish", value: "FadeGuard" },
                    { label: "Warranty", value: "Lifetime" },
                  ].map((item) => (
                    <div key={item.label} className="rounded-2xl bg-surface/14 backdrop-blur px-3 py-3 text-primary-foreground border border-primary-foreground/15">
                      <div className="text-[10px] uppercase tracking-wider text-primary-foreground/65 font-bold">{item.label}</div>
                      <div className="mt-1 text-sm font-extrabold">{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="absolute -bottom-6 right-6 w-[58%] h-[210px] rounded-[1.75rem] overflow-hidden shadow-premium border-8 border-primary-foreground"
            >
              <img
                src="https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?auto=format&fit=crop&w=900&q=85"
                alt="Freshly renovated exterior siding"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/65 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 flex items-center gap-2 text-primary-foreground">
                <ShieldCheck className="w-5 h-5 text-secondary" />
                <span className="text-sm font-bold">Final walkthrough approved</span>
              </div>
            </motion.div>

            <div className="absolute -top-4 -right-2 sm:right-8 w-36 h-36 rounded-3xl bg-gradient-to-br from-primary to-secondary text-primary-foreground p-5 shadow-glow flex flex-col justify-center border border-primary-foreground/25">
              <div className="text-2xl font-extrabold font-display leading-tight">Built to Last</div>
              <div className="text-xs font-semibold mt-2 leading-tight">Engineered exterior excellence</div>
            </div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.35 }}
              className="absolute left-4 bottom-12 glass rounded-2xl p-4 shadow-premium max-w-[245px]"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <BadgeCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-display font-extrabold text-primary">A+ Rated Crews</div>
                  <div className="text-xs text-foreground/75">Clean installs, daily updates</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-44 -right-2 glass rounded-2xl px-4 py-3 shadow-premium hidden sm:flex items-center gap-3"
            >
              <Sparkles className="w-5 h-5 text-secondary" />
              <span className="text-sm font-bold text-primary">Premium finish details</span>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary/10 text-primary text-xs font-bold tracking-wider uppercase mb-4">
              About EliteShield
            </div>
            <h2 className="font-display font-extrabold text-4xl lg:text-5xl text-primary leading-tight">
              Built on Craftsmanship.<br />Driven by Trust.
            </h2>
            <p className="mt-5 text-lg text-foreground/75 leading-relaxed">
              EliteShield protects and beautifies American homes with siding systems engineered
              to outlast the elements. Family-founded and homeowner-obsessed, we treat every
              project like it&#39;s our own.
            </p>

            <div className="mt-6 space-y-4">
              {qualityBars.map((item, i) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between text-sm font-bold text-primary mb-2">
                    <span>{item.label}</span>
                    <span>{item.value}</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-surface-soft overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: item.value }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: i * 0.12 }}
                      className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 grid sm:grid-cols-2 gap-4">
              <motion.div whileHover={{ y: -4 }} className="p-5 rounded-2xl bg-surface border border-border shadow-premium hover:shadow-premium transition-all">
                <div className="flex items-center gap-3 text-primary">
                  <span className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center"><Target className="w-5 h-5" /></span>
                  <span className="font-bold">Our Mission</span>
                </div>
                <p className="mt-3 text-sm text-foreground/75">Deliver exterior renovations homeowners brag about: on time, on budget, and built to last.</p>
              </motion.div>
              <motion.div whileHover={{ y: -4 }} className="p-5 rounded-2xl bg-surface border border-border shadow-premium hover:shadow-premium transition-all">
                <div className="flex items-center gap-3 text-primary">
                  <span className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center"><Eye className="w-5 h-5" /></span>
                  <span className="font-bold">Our Vision</span>
                </div>
                <p className="mt-3 text-sm text-foreground/75">Become the most trusted name in residential siding, one perfectly installed panel at a time.</p>
              </motion.div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-4">
              {[
                { icon: Trophy, label: "Awards", value: "48+" },
                { icon: Users, label: "Team", value: "50+" },
                { icon: Target, label: "States", value: "12" },
              ].map((s, i) => (
                <motion.div key={i} whileHover={{ y: -4, scale: 1.02 }} className="text-center p-4 rounded-2xl bg-gradient-to-b from-surface to-light border border-border shadow-premium hover:shadow-premium transition-all">
                  <div className="w-9 h-9 mx-auto rounded-xl bg-secondary/10 text-secondary flex items-center justify-center"><s.icon className="w-5 h-5" /></div>
                  <div className="mt-2 text-2xl font-extrabold font-display text-primary">{s.value}</div>
                  <div className="text-xs font-semibold text-foreground/75">{s.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="mt-24">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary/10 text-primary text-xs font-bold tracking-wider uppercase mb-4">
              Leadership
            </div>
            <h3 className="font-display font-extrabold text-3xl lg:text-4xl text-primary">
              Meet the People Behind the Craft
            </h3>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group rounded-2xl overflow-hidden bg-surface border border-border shadow-premium hover:shadow-premium transition-all"
              >
                <div className="relative h-64 overflow-hidden">
                  <img src={t.img} alt={t.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/70 via-transparent to-transparent" />
                </div>
                <div className="p-5">
                  <div className="font-display font-bold text-primary">{t.name}</div>
                  <div className="text-sm text-secondary font-semibold">{t.role}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}