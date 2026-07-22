"use client";
import Link from "next/link";
import { blogArticles } from "../data/blogData";
import { useReveal } from "../hooks/useReveal";

export default function BlogSection() {
  const headerRef = useReveal();
  const gridRef = useReveal();

  return (
    <section id="blog" className="relative py-8 lg:py-10 bg-[#F7F3EB] border-t border-[#D4C9B5]/30">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section header */}
        <div ref={headerRef} className="reveal text-center max-w-3xl mx-auto mb-16 lg:mb-20">
          <span className="inline-block text-xs font-semibold text-[#5a6f8a] uppercase tracking-widest mb-4">
            Insights & Guides
          </span>
          <h2 className="font-serif-display text-4xl md:text-5xl lg:text-6xl font-medium text-[#1a1a1a] mb-6">
            Latest from Our Blog
          </h2>
          <p className="text-lg text-[#555] leading-relaxed">
            Expert advice, maintenance tips, and smart home solutions directly from our certified HVAC technicians.
          </p>
        </div>

        {/* Blog grid */}
        <div ref={gridRef} className="reveal">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
            {blogArticles.map((article) => (
              <article
                key={article.slug}
                className="group flex flex-col bg-[#EFE6D6] border border-[#D4C9B5]/40 rounded-2xl overflow-hidden hover:border-[#A8BCD6] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-500"
              >
                {/* Image container */}
                <div className="relative aspect-[16/10] overflow-hidden bg-[#1a1a1a]/5">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-105"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 text-[11px] font-semibold tracking-wider text-[#1a1a1a] uppercase bg-white/90 backdrop-blur-sm rounded-full border border-[#D4C9B5]/30">
                      {article.category}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="flex flex-col flex-grow p-6 lg:p-8">
                  {/* Meta stats */}
                  <div className="flex items-center gap-4 text-xs text-[#555]/85 mb-4">
                    <div className="flex items-center gap-1.5">
                      <svg
                        className="w-3.5 h-3.5 text-[#5a6f8a]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span>{article.publishDate}</span>
                    </div>
                    <span className="w-1 h-1 rounded-full bg-[#5a6f8a]/40" />
                    <div className="flex items-center gap-1.5">
                      <svg
                        className="w-3.5 h-3.5 text-[#5a6f8a]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                        />
                      </svg>
                      <span>{article.readTime}</span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="font-serif-display text-xl font-medium text-[#1a1a1a] mb-3 group-hover:text-[#5a6f8a] transition-colors duration-300 leading-snug">
                    <Link href={`/housingneeds/hvac/climatech/blog/${article.slug}`}>
                      {article.title}
                    </Link>
                  </h3>

                  {/* Short description */}
                  <p className="text-sm text-[#555] leading-relaxed mb-6 line-clamp-3">
                    {article.introduction}
                  </p>

                  {/* Read More button */}
                  <div className="mt-auto pt-4 border-t border-[#D4C9B5]/20">
                    <Link
                      href={`/housingneeds/hvac/climatech/blog/${article.slug}`}
                      className="inline-flex items-center gap-2 text-xs font-semibold text-[#1a1a1a] hover:text-[#5a6f8a] uppercase tracking-wider transition-colors duration-300 group/btn"
                    >
                      Read Article
                      <svg
                        className="w-3.5 h-3.5 transition-transform duration-300 group-hover/btn:translate-x-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M14 5l7 7m0 0l-7 7m7-7H3"
                        />
                      </svg>
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
