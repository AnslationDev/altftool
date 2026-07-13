import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Clock, ArrowUpRight } from "lucide-react";
import Container from "../ui/Container";
import SectionHeading from "../ui/SectionHeading";
import { blog, blogCategories } from "../../data/blog";

export default function Blog() {
  const [cat, setCat] = useState("All");
  const posts = cat === "All" ? blog : blog.filter((b) => b.category === cat);

  return (
    <section id="blog" className="sec bg-soft dark:bg-slate-900/40">
      <Container>
        <SectionHeading
          eyebrow="Blog & Insights"
          title="Growth strategies you can"
          highlight="steal today"
          subtitle="Fresh thinking on SEO, affiliate programs, paid ads and the tactics driving modern marketing wins."
        />

        <div className="mt-10 flex flex-wrap justify-center gap-2">
          {blogCategories.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                cat === c
                  ? "bg-gradient-to-r from-brand to-brand-purple text-white shadow-md shadow-brand/30"
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {posts.map((post) => (
              <motion.article
                layout
                key={post.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
              <Link
                to={`/blog/${post.id}`}
                className="group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-2 hover:shadow-2xl hover:shadow-brand/10 dark:border-white/10 dark:bg-slate-900"
              >
                <div className="relative h-48 overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-80" />
                  <span className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[0.7rem] font-bold text-slate-900 backdrop-blur shadow-sm dark:bg-slate-900/90 dark:text-white">
                    {post.category}
                  </span>
                </div>

                <div className="flex flex-1 flex-col p-6">
                  <div className="mb-3 flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar size={13} /> {post.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={13} /> {post.readTime}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold leading-snug transition group-hover:text-brand">
                    {post.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm text-slate-500 dark:text-slate-400">
                    {post.excerpt}
                  </p>
                  <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-white/5">
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                      {post.author}
                    </span>
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-brand transition group-hover:gap-2">
                      Read <ArrowUpRight size={15} />
                    </span>
                  </div>
                </div>
              </Link>
              </motion.article>
            ))}
          </AnimatePresence>
        </div>
      </Container>
    </section>
  );
}
