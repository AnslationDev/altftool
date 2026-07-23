import { motion } from "framer-motion";

const images = [
  { src: "https://images.unsplash.com/photo-1559302504-64aae6ca6b6d?auto=format&fit=crop&w=1200&q=82", alt: "Modern minimalist home", label: "Solar Roofing" },
  { src: "https://images.unsplash.com/photo-1624397640148-949b1732bb0a?auto=format&fit=crop&w=1200&q=82", alt: "Craftsman bungalow", label: "Solar Roofing" },
  { src: "https://images.unsplash.com/photo-1635335874521-7987db781153?auto=format&fit=crop&w=1200&q=82", alt: "Contemporary suburban home", label: "Solar Roofing" },
  { src: "https://images.unsplash.com/photo-1530951226911-640987bd484c?auto=format&fit=crop&w=1200&q=82", alt: "Minimalist home with solar panels", label: "Solar Panels" },
  { src: "https://images.unsplash.com/photo-1660330589257-813305a4a383?auto=format&fit=crop&w=1200&q=82", alt: "Craftsman home with solar panels", label: "Solar Panels" },
  { src: "https://images.unsplash.com/photo-1509389928833-fe62aef36deb?auto=format&fit=crop&w=1200&q=82", alt: "Spanish colonial home with solar panels", label: "Solar Panels" },
];

export default function GallerySection() {
  return (
    <section id="gallery" className="gallery-section">
      <div className="container--wide mb-12">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="gallery-heading"
        >
          Solar for Every Home
        </motion.h2>
      </div>
      <div className="container--wide gallery-grid">
        {images.map((img, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: i * 0.1 }}
            className="gallery-item"
          >
            <img src={img.src} alt={img.alt} />
            <div className="gallery-overlay">
              <span className="gallery-label">
                {img.label}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
