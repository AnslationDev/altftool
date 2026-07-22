import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import '../styles/Testimonials.css';

const reviews = [
  {
    quote: 'They were at my door in 45 minutes. Burst pipe at midnight, fully fixed before 2am. Worth every cent.',
    name: 'Marcus Taylor',
    role: 'Homeowner, Brooklyn',
    image: 'https://i.pravatar.cc/160?img=12',
  },
  {
    quote: 'Quoted me upfront before touching anything. No surprises on the invoice. That is rare, and I am a customer for life.',
    name: 'Sandra Lee',
    role: 'Homeowner, Queens',
    image: 'https://i.pravatar.cc/160?img=47',
  },
  {
    quote: 'Third plumber I tried. First one to actually fix the problem. Cleared a root blockage that had been there for years.',
    name: 'David Rivera',
    role: 'Property Manager, Manhattan',
    image: 'https://i.pravatar.cc/160?img=15',
  },
  {
    quote: 'New water heater installed same day. The technician explained every step and left the basement cleaner than it started.',
    name: 'Jennifer Morris',
    role: 'Homeowner, Staten Island',
    image: 'https://i.pravatar.cc/160?img=32',
  },
  {
    quote: 'Called at 7am on a holiday weekend. On-site by 8am. Fixed a gas leak quickly and safely. These plumbers are pros.',
    name: 'Robert Kim',
    role: 'Homeowner, The Bronx',
    image: 'https://i.pravatar.cc/160?img=53',
  },
  {
    quote: 'Our restaurant drain line backed up before dinner service. FlowPro had us open on time with no drama.',
    name: 'Nina Patel',
    role: 'Restaurant Owner, Long Island City',
    image: 'https://i.pravatar.cc/160?img=44',
  },
  {
    quote: 'The booking form was simple, dispatch called in minutes, and the plumber arrived exactly inside the window.',
    name: 'Owen Carter',
    role: 'Condo Owner, Jersey City',
    image: 'https://i.pravatar.cc/160?img=8',
  },
  {
    quote: 'They replaced old galvanized lines in one day and showed photos of every connection before closing the wall.',
    name: 'Amelia Brooks',
    role: 'Homeowner, Park Slope',
    image: 'https://i.pravatar.cc/160?img=25',
  },
  {
    quote: 'Clean uniforms, clear pricing, and no pressure. The ten-year warranty made the decision easy.',
    name: 'Ethan Wilson',
    role: 'Homeowner, Astoria',
    image: 'https://i.pravatar.cc/160?img=60',
  },
  {
    quote: 'They found a slab leak another company missed and gave me repair options before starting any work.',
    name: 'Priya Shah',
    role: 'Homeowner, Hoboken',
    image: 'https://i.pravatar.cc/160?img=5',
  },
];

export default function Testimonials() {
  const scrollingReviews = [...reviews, ...reviews];

  return (
    <section className="fp-testimonials" id="reviews">
      <div className="fp-testimonials__header">
        <motion.span className="fp-testimonials__label"
          initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6 }}>
          What Customers Say
        </motion.span>
        <motion.h2 className="fp-testimonials__h2"
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}>
          Trusted By Homes And Businesses Across The City
        </motion.h2>
      </div>

      <div className="fp-testimonials__marquee" aria-label="Customer reviews">
        <div className="fp-testimonials__track">
          {scrollingReviews.map((review, i) => (
            <article
              key={`${review.name}-${i}`}
              className="fp-testimonials__card"
              aria-hidden={i >= reviews.length}
            >
              <div className="fp-testimonials__card-stars">
                {[...Array(5)].map((_, starIndex) => (
                  <Star key={starIndex} className="fp-testimonials__star" />
                ))}
              </div>
              <p className="fp-testimonials__quote">{review.quote}</p>
              <div className="fp-testimonials__person">
                <img className="fp-testimonials__avatar" src={review.image} alt={review.name} loading="lazy" />
                <div>
                  <p className="fp-testimonials__author">{review.name}</p>
                  <p className="fp-testimonials__role">{review.role}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
