import { motion } from "framer-motion";
import { Star } from "lucide-react";

const reviews = [
  { quote: "Best home investment we've ever made. Our bill dropped from $320/month to $14. The crew was professional and finished in a single day.", name: "Sarah M.", location: "Austin TX", product: "Solar Panels" },
  { quote: "The roofing tiles look incredible. Our neighbors couldn't even tell it was solar until we told them. Helios did a flawless job from design to install.", name: "James K.", location: "San Diego CA", product: "Solar Roofing" },
  { quote: "Paired with the battery storage — zero power outages during storm season. Worth every penny and then some.", name: "Rachel L.", location: "Phoenix AZ", product: "Solar Panels + Storage" },
  { quote: "They handled everything — permits, HOA approval, installation. Completely hands-off for us. Couldn't recommend more.", name: "David H.", location: "Denver CO", product: "Solar Roofing" }
];

export default function ReviewsSection() {
  return (
    <section id="reviews" className="reviews-section">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="reviews-heading">What Homeowners Say</h2>
        </motion.div>

        <motion.div
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.12 } } }}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="reviews-grid"
        >
          {reviews.map((review, i) => (
            <motion.div
              key={i}
              variants={{ hidden: { opacity: 0, scale: 0.95 }, show: { opacity: 1, scale: 1, transition: { duration: 0.6 } } }}
              className={`review-card ${i === 4 ? "review-card--wide" : ""}`}
            >
              <div>
                <div className="review-stars">
                  {[...Array(5)].map((_, j) => <Star key={j} className="w-5 h-5 fill-current" />)}
                </div>
                <p className="review-quote">&ldquo;{review.quote}&rdquo;</p>
              </div>
              <div className="mt-auto">
                <p className="review-name">{review.name}</p>
                <div className="flex items-center justify-between text-sm mt-1">
                  <span className="review-location">{review.location}</span>
                  <span className="review-badge">{review.product}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
