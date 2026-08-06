import { useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Calendar, CheckCircle2, Clock, Home, Phone, Share2, User } from "lucide-react";
import { blogPosts, categoryColor } from "../data/blogPosts";

export default function BlogArticle({ slug }) {
  const post = blogPosts.find((item) => item.slug === slug) || blogPosts[0];
  const related = blogPosts.filter((item) => item.slug !== post.slug && item.category === post.category).slice(0, 2);
  const fallbackRelated = blogPosts.filter((item) => item.slug !== post.slug).slice(0, 2);
  const relatedPosts = related.length ? related : fallbackRelated;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    document.title = `${post.title} | EliteShield Blog`;
  }, [post.title]);

  return (
    <main data-siding-blog className="bg-white text-[#111827] pt-24">
      <section className="relative overflow-hidden bg-gradient-soft pt-16 pb-12 lg:pt-20 lg:pb-20">
        <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-[#00AEEF]/10 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-[30rem] h-[30rem] bg-[#0D3B66]/10 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3" />

        <div className="relative max-w-6xl mx-auto px-5 lg:px-8">
          <a href="#blog" className="inline-flex items-center gap-2 text-sm font-bold text-[#0D3B66] hover:text-[#00AEEF] transition mb-8">
            <ArrowLeft className="w-4 h-4" /> Back to Blog
          </a>

          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className={`inline-flex px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase ${categoryColor(post.category)}`}>
              {post.category}
            </span>
            <h1 className="mt-5 font-display font-extrabold text-4xl lg:text-6xl leading-tight text-[#0D3B66] max-w-5xl">
              {post.title}
            </h1>
            <p className="mt-6 text-lg lg:text-xl text-slate-600 leading-relaxed max-w-3xl">
              {post.excerpt}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4 text-sm font-semibold text-slate-500">
              <span className="flex items-center gap-2"><User className="w-4 h-4 text-[#00AEEF]" /> {post.author}</span>
              <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-[#00AEEF]" /> {post.date}</span>
              <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-[#00AEEF]" /> {post.readTime}</span>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="pb-24 lg:pb-32">
        <div className="max-w-6xl mx-auto px-5 lg:px-8">
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.1 }} className="relative -mt-10 lg:-mt-16 rounded-[2rem] overflow-hidden shadow-premium border border-white">
            <img src={post.img} alt={post.title} className="w-full h-[320px] lg:h-[540px] object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0D3B66]/45 via-transparent to-transparent" />
          </motion.div>

          <div className="mt-14 grid lg:grid-cols-12 gap-10 items-start">
            <aside className="lg:col-span-4 lg:sticky lg:top-28 space-y-5">
              <div className="rounded-3xl bg-[#F8FAFC] border border-slate-100 p-6 shadow-[0_10px_30px_rgba(13,59,102,0.06)]">
                <div className="text-xs font-bold tracking-[0.2em] uppercase text-[#00AEEF] mb-4">In This Article</div>
                <nav className="space-y-3">
                  {post.content.sections.map((section, i) => (
                    <a key={section.heading} href={`#article-section-${i}`} className="block text-sm font-semibold text-[#0D3B66] hover:text-[#00AEEF] transition">
                      {String(i + 1).padStart(2, "0")}. {section.heading}
                    </a>
                  ))}
                </nav>
              </div>

              <div className="rounded-3xl bg-gradient-to-br from-[#0D3B66] to-[#1E5AA8] text-white p-6 shadow-premium overflow-hidden relative">
                <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full bg-[#00AEEF]/30 blur-3xl" />
                <div className="relative">
                  <Home className="w-8 h-8 text-[#7be4ff]" />
                  <h3 className="mt-4 font-display font-extrabold text-xl">Need advice for your home?</h3>
                  <p className="mt-2 text-sm text-white/80">Talk to a siding specialist and compare materials, colors, and project pricing.</p>
                  <a href="#contact" className="mt-5 inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white text-[#0D3B66] text-sm font-bold hover:scale-[1.03] transition">
                    Get Free Estimate <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </aside>

            <article className="lg:col-span-8">
              <div className="prose prose-lg max-w-none">
                <p className="text-xl leading-relaxed text-slate-700 font-medium border-l-4 border-[#00AEEF] pl-5">
                  {post.content.intro}
                </p>

                {post.content.sections.map((section, i) => (
                  <motion.section
                    key={section.heading}
                    id={`article-section-${i}`}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="mt-12 scroll-mt-32"
                  >
                    <h2 className="font-display font-extrabold text-3xl text-[#0D3B66] leading-tight">{section.heading}</h2>
                    <div className="mt-5 space-y-5">
                      {section.body.map((paragraph) => (
                        <p key={paragraph} className="text-slate-600 leading-relaxed">{paragraph}</p>
                      ))}
                    </div>
                  </motion.section>
                ))}

                <div className="mt-12 rounded-3xl bg-[#F8FAFC] border border-slate-100 p-6 lg:p-8">
                  <h2 className="font-display font-extrabold text-2xl text-[#0D3B66]">Homeowner Checklist</h2>
                  <div className="mt-5 grid sm:grid-cols-2 gap-4">
                    {post.content.checklist.map((item) => (
                      <div key={item} className="flex gap-3 rounded-2xl bg-white border border-slate-100 p-4">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm font-medium text-slate-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-10 flex flex-wrap items-center gap-3 border-y border-slate-100 py-6">
                  <span className="text-sm font-bold text-[#0D3B66]">Share this article:</span>
                  <button className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-50 text-slate-600 text-sm font-semibold hover:bg-[#0D3B66] hover:text-white transition">
                    <Share2 className="w-4 h-4" /> Copy Link
                  </button>
                  <a href="#demo-only" className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#00AEEF]/10 text-[#0D3B66] text-sm font-semibold hover:bg-[#00AEEF] hover:text-white transition">
                    <Phone className="w-4 h-4" /> Call an Expert
                  </a>
                </div>
              </div>
            </article>
          </div>

          <section className="mt-20">
            <div className="flex items-end justify-between gap-4 mb-8">
              <div>
                <div className="text-xs font-bold tracking-[0.2em] uppercase text-[#00AEEF]">Keep Reading</div>
                <h2 className="mt-2 font-display font-extrabold text-3xl text-[#0D3B66]">Related Articles</h2>
              </div>
              <a href="#blog" className="hidden sm:inline-flex items-center gap-2 text-sm font-bold text-[#0D3B66] hover:text-[#00AEEF]">
                All Articles <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {relatedPosts.map((item) => (
                <a key={item.slug} href={`#blog/${item.slug}`} className="group rounded-3xl overflow-hidden bg-white border border-slate-100 shadow-[0_4px_20px_rgba(13,59,102,0.06)] hover:shadow-premium transition-all grid sm:grid-cols-5">
                  <div className="sm:col-span-2 h-56 sm:h-auto overflow-hidden">
                    <img src={item.img} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  </div>
                  <div className="sm:col-span-3 p-6">
                    <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ${categoryColor(item.category)}`}>{item.category}</span>
                    <h3 className="mt-3 font-display font-bold text-xl text-[#0D3B66] group-hover:text-[#1E5AA8] transition">{item.title}</h3>
                    <p className="mt-2 text-sm text-slate-600 line-clamp-3">{item.excerpt}</p>
                  </div>
                </a>
              ))}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
