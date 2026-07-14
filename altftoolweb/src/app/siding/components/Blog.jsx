import { motion } from "framer-motion";
import { ArrowRight, Calendar, Clock, User, TrendingUp } from "lucide-react";
import { categoryColor, featuredPost, regularPosts } from "../data/blogPosts";

export default function Blog() {
  return (
    <section id="blog" data-siding-blog className="pt-4 pb-12 lg:pt-6 lg:pb-16 bg-surface relative overflow-hidden">
      <div className="absolute top-20 right-0 w-[36rem] h-[36rem] bg-secondary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-0 w-[30rem] h-[30rem] bg-primary/5 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-5 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-14"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary/10 text-primary text-xs font-bold tracking-wider uppercase mb-4">
            From Our Blog
          </div>
          <h2 className="font-display font-extrabold text-4xl lg:text-5xl text-primary leading-tight">
            Expert Insights for Smarter Home Decisions
          </h2>
          <p className="mt-5 text-lg text-foreground/75">
            Practical siding advice, design inspiration, and industry know-how written by
            EliteShield&#39;s senior craftsmen and design specialists.
          </p>
        </motion.div>

        <motion.article
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="group grid lg:grid-cols-2 gap-0 rounded-3xl overflow-hidden bg-surface border border-border shadow-premium mb-14 lg:mb-16"
        >
          <a href={`#blog/${featuredPost.slug}`} className="relative h-72 lg:h-auto overflow-hidden block">
            <img src={featuredPost.img} alt={featuredPost.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-transparent to-transparent lg:bg-gradient-to-r" />
            <div className="absolute top-5 left-5 flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-primary to-secondary text-primary-foreground text-[10px] font-bold tracking-wider uppercase shadow-lg">
                <TrendingUp className="w-3 h-3" /> Featured
              </span>
              <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wider uppercase ${categoryColor(featuredPost.category)}`}>
                {featuredPost.category}
              </span>
            </div>
          </a>
          <div className="p-8 lg:p-12 flex flex-col justify-center">
            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-foreground/75 mb-4">
              <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {featuredPost.date}</span>
              <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {featuredPost.readTime}</span>
              <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> {featuredPost.author}</span>
            </div>
            <a href={`#blog/${featuredPost.slug}`} className="block">
              <h3 className="font-display font-extrabold text-2xl lg:text-3xl text-primary leading-tight group-hover:text-primary-hover transition-colors">
                {featuredPost.title}
              </h3>
            </a>
            <p className="mt-4 text-foreground/75 leading-relaxed">{featuredPost.excerpt}</p>
            <a href={`#blog/${featuredPost.slug}`} className="mt-7 inline-flex items-center gap-2 self-start px-6 py-3 rounded-full bg-gradient-to-r from-primary to-primary-hover text-primary-foreground font-semibold shadow-premium hover:shadow-glow hover:scale-[1.03] transition-all">
              Read Full Article
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </motion.article>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {regularPosts.map((p, i) => (
            <motion.article
              key={p.slug}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              whileHover={{ y: -6 }}
              className="group rounded-2xl overflow-hidden bg-surface border border-border shadow-premium hover:shadow-premium transition-all flex flex-col"
            >
              <a href={`#blog/${p.slug}`} className="relative h-52 overflow-hidden block">
                <img src={p.img} alt={p.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/40 via-transparent to-transparent" />
                <span className={`absolute top-4 left-4 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ${categoryColor(p.category)} backdrop-blur`}>
                  {p.category}
                </span>
              </a>
              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center gap-3 text-xs font-semibold text-foreground/75 mb-3">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {p.date}</span>
                  <span className="w-1 h-1 rounded-full bg-border" />
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {p.readTime}</span>
                </div>
                <a href={`#blog/${p.slug}`} className="block">
                  <h3 className="font-display font-bold text-lg text-primary leading-snug group-hover:text-primary-hover transition-colors">
                    {p.title}
                  </h3>
                </a>
                <p className="mt-3 text-sm text-foreground/75 leading-relaxed flex-1">{p.excerpt}</p>
                <div className="mt-5 pt-5 border-t border-border flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground/75 flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> {p.author}</span>
                  <a href={`#blog/${p.slug}`} className="inline-flex items-center gap-1 text-sm font-bold text-secondary group/btn">
                    Read
                    <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                  </a>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
