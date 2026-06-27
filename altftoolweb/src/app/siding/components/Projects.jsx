import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { X, MapPin, Maximize2 } from "lucide-react";

const baseImgs = [
  "photo-1600585154340-be6161a56a0c",
  "photo-1568605114967-8130f3a36994",
  "photo-1605276373954-0c4a0dac5b12",
  "photo-1564013799919-ab600027ffc6",
  "photo-1572120360610-d971b9d7767c",
  "photo-1600585154526-990dced4db0d",
  "photo-1505691938895-1758d7feb511",
  "photo-1518780664697-55e3ad937233",
  "photo-1600607687939-ce8a6c25118c",
  "photo-1600566753190-17f0baa2a6c3",
  "photo-1599809275671-b5942cabc7a2",
  "photo-1502672260266-1c1ef2d93688",
];

const projects = [
  { id: 1,  title: "Coastal Modern Estate",   location: "Naples, FL",        category: "Luxury Homes",  img: baseImgs[0] },
  { id: 2,  title: "Suburban Family Home",    location: "Plano, TX",         category: "Residential",   img: baseImgs[1] },
  { id: 3,  title: "Heritage Restoration",    location: "Boston, MA",        category: "Renovations",   img: baseImgs[2] },
  { id: 4,  title: "Lakefront Retreat",       location: "Lake Tahoe, CA",    category: "Luxury Homes",  img: baseImgs[3] },
  { id: 5,  title: "Mid-Century Refresh",     location: "Phoenix, AZ",       category: "Renovations",   img: baseImgs[4] },
  { id: 6,  title: "Townhouse Complex",       location: "Denver, CO",        category: "Commercial",    img: baseImgs[5] },
  { id: 7,  title: "Mountain Modern",         location: "Park City, UT",     category: "Luxury Homes",  img: baseImgs[6] },
  { id: 8,  title: "Craftsman Bungalow",      location: "Portland, OR",      category: "Residential",   img: baseImgs[7] },
  { id: 9,  title: "Office Park Façade",      location: "Atlanta, GA",       category: "Commercial",    img: baseImgs[8] },
  { id: 10, title: "Victorian Restore",       location: "San Francisco, CA", category: "Renovations",   img: baseImgs[9] },
  { id: 11, title: "Modern Farmhouse",        location: "Nashville, TN",     category: "Residential",   img: baseImgs[10] },
  { id: 12, title: "Retail Plaza Wrap",       location: "Charlotte, NC",     category: "Commercial",    img: baseImgs[11] },
];

const filters = ["All", "Residential", "Commercial", "Luxury Homes", "Renovations"];

export default function Projects() {
  const [filter, setFilter] = useState("All");
  const [lightbox, setLightbox] = useState(null);

  const filtered = useMemo(
    () => (filter === "All" ? projects : projects.filter((p) => p.category === filter)),
    [filter]
  );

  return (
    <section id="projects" className="pb-6 pt-4 lg:pb-8 lg:pt-6 bg-surface">
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary/10 text-primary text-xs font-bold tracking-wider uppercase mb-4">
            Recent Projects
          </div>
          <h2 className="font-display font-extrabold text-4xl lg:text-5xl text-primary leading-tight">
            Curated Work, Coast to Coast
          </h2>
          <p className="mt-5 text-lg text-foreground/75">
            Browse a small selection of homes and commercial properties transformed by our crews.
          </p>
        </motion.div>

        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-2 lg:gap-3 mb-10">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
                filter === f
                  ? "bg-gradient-to-r from-primary to-primary-hover text-primary-foreground shadow-premium"
                  : "bg-light text-foreground/75 hover:bg-surface-soft"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Grid */}
        <motion.div layout className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
          <AnimatePresence>
            {filtered.map((p) => (
              <motion.article
                key={p.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4 }}
                onClick={() => setLightbox(p)}
                className="group relative rounded-2xl overflow-hidden cursor-pointer aspect-[4/3] shadow-premium hover:shadow-premium"
              >
                <img
                  src={`https://images.unsplash.com/${p.img}?auto=format&fit=crop&w=900&q=80`}
                  alt={p.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/95 via-primary/30 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 rounded-full bg-surface/90 text-[10px] font-bold tracking-wider uppercase text-primary">
                    {p.category}
                  </span>
                </div>
                <div className="absolute top-4 right-4 w-9 h-9 rounded-full glass flex items-center justify-center text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  <Maximize2 className="w-4 h-4" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-5 text-primary-foreground">
                  <h3 className="font-display font-bold text-lg">{p.title}</h3>
                  <div className="mt-1 flex items-center gap-1.5 text-sm text-primary-foreground/85">
                    <MapPin className="w-3.5 h-3.5" />
                    {p.location}
                  </div>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox(null)}
            className="fixed inset-0 z-[100] bg-primary/90 backdrop-blur-md flex items-center justify-center p-5"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-5xl w-full rounded-3xl overflow-hidden bg-surface"
            >
              <button
                onClick={() => setLightbox(null)}
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-surface/90 flex items-center justify-center text-primary hover:bg-surface"
              >
                <X className="w-5 h-5" />
              </button>
              <img
                src={`https://images.unsplash.com/${lightbox.img}?auto=format&fit=crop&w=1600&q=85`}
                alt={lightbox.title}
                className="w-full h-[60vh] object-cover"
              />
              <div className="p-6 lg:p-8">
                <div className="text-xs font-bold tracking-wider uppercase text-secondary">{lightbox.category}</div>
                <h3 className="mt-1 font-display font-extrabold text-2xl text-primary">{lightbox.title}</h3>
                <div className="mt-1 flex items-center gap-1.5 text-foreground/75">
                  <MapPin className="w-4 h-4" /> {lightbox.location}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
