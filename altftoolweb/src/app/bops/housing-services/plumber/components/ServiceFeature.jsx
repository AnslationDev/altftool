import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import '../styles/ServiceFeature.css';

export default function ServiceFeature({
  title, subtitle, description, image,
  details = [],
  ctaText = 'Learn More', ctaHref = '#book-form',
  flip = false, dark = true, id,
}) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const imageY = useTransform(scrollYProgress, [0, 1], ['-4%', '4%']);

  const dirClass = flip ? 'fp-feature--right' : 'fp-feature--left';
  const themeClass = dark ? 'fp-feature--dark' : 'fp-feature--light';

  const handleCta = (e) => {
    if (ctaHref === '#book-form') {
      e.preventDefault();
      const el = document.getElementById('book-form');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section ref={ref} id={id} className={`fp-feature ${themeClass} ${dirClass}`}>
      <div className="fp-feature__content">
        <div className="fp-feature__text">
          {subtitle && (
            <motion.span className="fp-feature__subtitle"
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6, ease: [0.16,1,0.3,1] }}>
              {subtitle}
            </motion.span>
          )}
          <motion.h2 className="fp-feature__title"
            initial={{ opacity: 0, y: 36 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.8, delay: 0.05, ease: [0.16,1,0.3,1] }}>
            {title}
          </motion.h2>
          {description && (
            <motion.p className="fp-feature__desc"
              initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.15, ease: [0.16,1,0.3,1] }}>
              {description}
            </motion.p>
          )}
          {details.length > 0 && (
            <motion.ul className="fp-feature__details"
              initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.65, delay: 0.2, ease: [0.16,1,0.3,1] }}>
              {details.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </motion.ul>
          )}
          <motion.a href={ctaHref} onClick={handleCta} className="fp-feature__cta"
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.25, ease: [0.16,1,0.3,1] }}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            {ctaText} <ArrowRight size={16} />
          </motion.a>
        </div>

        <motion.div className="fp-feature__media"
          initial={{ opacity: 0, scale: 0.96, y: 24 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16,1,0.3,1] }}>
          <motion.img
            src={image.src || image}
            alt={title}
            loading="lazy"
            style={{ y: imageY }}
          />
        </motion.div>
      </div>
    </section>
  );
}
