import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { solarMedia } from "../media";

const blogs = [
  {
    title: "The Future of Solar Roofing: Integrated Glass Tiles",
    excerpt: "Learn how glass-tempered solar tiles protect your home while generating clean energy seamlessly, without altering your home's aesthetics.",
    date: "June 12, 2026",
    readTime: "5 min read",
    image: solarMedia.gallery[0],
    category: "Roofing",
    content: [
      "Traditional solar panels have long been the standard for residential clean energy. However, they present aesthetic and structural limitations. The future of residential solar lies in solar integration — specifically, solar roofing glass tiles that double as premium roofing material and clean energy generators.",
      "Helios Solar Roofing glass tiles are engineered using high-strength tempered glass, making them three times more durable than standard slate or asphalt shingles. They provide complete weatherization protection with a Class A fire rating and wind resistance up to 110 mph.",
      "By replacing your traditional shingles with integrated glass tiles, your roof becomes an active generator. Helios tiles are installed in a seamless grid, with solar active tiles placed in optimized positions and inactive matching tiles filling out the remainder of the roof to maintain a perfect, uniform look. The result is a roof that generates maximum power while remaining completely indistinguishable from premium non-solar modern roofing."
    ]
  },
  {
    title: "Monocrystalline Panels: Maximizing Your Roof Output",
    excerpt: "Why cell efficiency and temperature coefficients matter. Discover why 22.8% efficiency is the industry gold standard for residential setups.",
    date: "June 08, 2026",
    readTime: "4 min read",
    image: solarMedia.gallery[1],
    category: "Panels",
    content: [
      "When choosing a solar panel installation, output efficiency is the key metric that dictates your return on investment. Standard solar panels typically range from 15% to 18% efficiency. Helios high-efficiency monocrystalline solar panels deliver an industry-leading 22.8% conversion efficiency.",
      "This maximum efficiency is made possible through monocrystalline silicon, which uses high-grade single-crystal structures. This allows electrons to flow more freely, generating more power per square foot of roof space. If you have limited roof space, high-efficiency monocrystalline cells are essential to produce the electricity your household requires.",
      "Additionally, Helios panels feature a low temperature coefficient, meaning they continue to operate at near-peak capacity even during intense hot summer days when standard panels experience performance drops. Coupled with a low-profile mounting system and premium all-black design, they provide maximum performance with minimum visual footprint."
    ]
  },
  {
    title: "Resilient Backup: Smart Battery Storage Guide",
    excerpt: "Grid outages are on the rise. We break down how smart backup management saves money and keeps the lights on automatically.",
    date: "May 29, 2026",
    readTime: "6 min read",
    image: solarMedia.gallery[2],
    category: "Storage",
    content: [
      "Power grids around the world are facing increased stress from extreme weather events and aging infrastructure. As blackouts become more frequent, home energy resilience has shifted from a luxury to a necessity. Pairing a solar panel system with a high-capacity smart battery is the ultimate solution.",
      "Helios Battery Storage holds 13.5 kWh of electricity, providing a robust backup reserve that activates instantly when a grid failure is detected. With zero-transition delay, your lights, appliances, and critical devices remain powered without interruption, keeping your family safe and comfortable.",
      "Beyond emergency backup, smart battery storage allows you to practice Time-of-Use load shifting. During peak electricity rate hours when utility companies charge the most, the system automatically discharges your stored solar energy to power your home. It then recharges during off-peak hours, saving you money every day, even when the grid is running perfectly."
    ]
  }
];

export default function BlogSection() {
  const [activeArticle, setActiveArticle] = useState(null);

  useEffect(() => {
    if (activeArticle) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [activeArticle]);

  return (
    <>
      <section id="blog" className="light-section border-t border-gray-200">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <span className="section-overline section-overline--dark text-center block">Insights</span>
            <h2 className="section-heading text-center">Helios Solar Blog</h2>
          </motion.div>

          <div className="blog-layout">
            <div className="blog-left-col">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6 }}
                className="blog-card blog-card--featured"
                onClick={() => setActiveArticle(blogs[0])}
              >
                <div className="blog-card-img-wrapper">
                  <img src={blogs[0].image} alt={blogs[0].title} className="blog-card-img" />
                  <span className="blog-card-tag">{blogs[0].category}</span>
                </div>
                <div className="blog-card-content">
                  <div className="blog-card-meta">
                    <span>{blogs[0].date}</span>
                    <span>•</span>
                    <span>{blogs[0].readTime}</span>
                  </div>
                  <h3 className="blog-card-title">{blogs[0].title}</h3>
                  <p className="blog-card-excerpt">{blogs[0].excerpt}</p>
                  <span className="blog-card-link">
                    Read Article <span className="arrow">→</span>
                  </span>
                </div>
              </motion.div>
            </div>

            <div className="blog-right-col">
              {[blogs[1], blogs[2]].map((blog, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.6, delay: i * 0.15 }}
                  className="blog-card blog-card--horizontal"
                  onClick={() => setActiveArticle(blog)}
                >
                  <div className="blog-card-img-wrapper">
                    <img src={blog.image} alt={blog.title} className="blog-card-img" />
                    <span className="blog-card-tag">{blog.category}</span>
                  </div>
                  <div className="blog-card-content">
                    <div className="blog-card-meta">
                      <span>{blog.date}</span>
                      <span>•</span>
                      <span>{blog.readTime}</span>
                    </div>
                    <h3 className="blog-card-title">{blog.title}</h3>
                    <p className="blog-card-excerpt">{blog.excerpt}</p>
                    <span className="blog-card-link">
                      Read Article <span className="arrow">→</span>
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <AnimatePresence>
        {activeArticle && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="article-modal-overlay"
            onClick={() => setActiveArticle(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="article-modal-card"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="article-modal-close"
                onClick={() => setActiveArticle(null)}
                aria-label="Close article"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="article-modal-header">
                <img
                  src={activeArticle.image}
                  alt={activeArticle.title}
                  className="w-full h-full object-cover"
                />
                <span className="blog-card-tag">{activeArticle.category}</span>
              </div>

              <div className="article-modal-body">
                <div className="blog-card-meta">
                  <span>{activeArticle.date}</span>
                  <span>•</span>
                  <span>{activeArticle.readTime}</span>
                </div>
                <h2 className="article-modal-title">{activeArticle.title}</h2>
                <div className="mt-6 flex flex-col gap-4">
                  {activeArticle.content.map((para, idx) => (
                    <p key={idx} className="article-modal-paragraph">
                      {para}
                    </p>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
