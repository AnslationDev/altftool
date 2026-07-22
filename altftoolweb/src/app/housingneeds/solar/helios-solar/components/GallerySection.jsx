import { motion } from "framer-motion";
import { solarMedia } from "../media";

const images = [
  { src: solarMedia.gallery[0], alt: "Modern minimalist home", label: "Solar Roofing" },
  { src: solarMedia.gallery[1], alt: "Craftsman bungalow", label: "Solar Roofing" },
  { src: solarMedia.gallery[2], alt: "Contemporary suburban home", label: "Solar Roofing" },
  { src: solarMedia.gallery[3], alt: "Minimalist home with solar panels", label: "Solar Panels" },
  { src: solarMedia.gallery[4], alt: "Craftsman home with solar panels", label: "Solar Panels" },
  { src: solarMedia.gallery[5], alt: "Home with a clean-energy installation", label: "Solar Panels" },
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
