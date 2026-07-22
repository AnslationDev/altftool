import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, ArrowRight } from 'lucide-react';
import '../styles/FAQSection.css';

const faqs = [
  {
    q: 'How fast can you arrive for an emergency?',
    a: 'We dispatch a licensed plumber within minutes of your call. Average arrival time is under 60 minutes across our service area — guaranteed. Emergency calls are prioritised 24/7, 365 days a year.',
  },
  {
    q: 'Is the free estimate really free?',
    a: 'Absolutely. Our estimates are 100% free with no obligation. A licensed technician will assess the issue, explain what needs to be done, and give you a full upfront price — all before any work begins. You decide whether to proceed.',
  },
  {
    q: 'Are your plumbers licensed and insured?',
    a: 'Every FlowPro technician is fully licensed by New York State, background-checked, and carries $2 million in liability insurance. You can ask to see credentials on arrival.',
  },
  {
    q: 'How much does plumbing work cost?',
    a: "Pricing depends on the job. We always give you a full upfront quote before starting. Typical ranges: drain cleaning $150–$350, faucet replacement $120–$280, water heater installation $800–$2,200. We'll quote your exact job for free.",
  },
  {
    q: 'Do you offer a warranty?',
    a: 'Yes — every job comes with our 10-year workmanship warranty. If anything fails due to our work within that period, we fix it at no charge. Parts also carry manufacturer warranties which we honour on your behalf.',
  },
  {
    q: 'What should I do before the plumber arrives?',
    a: "If you have a leak or burst pipe, shut off the main water supply valve immediately. Clear the work area if possible. Have your building's access information ready. Beyond that — just wait; we handle everything else.",
  },
];

export default function FAQSection() {
  const [open, setOpen] = useState(null);

  const toggle = (i) => setOpen(prev => prev === i ? null : i);

  return (
    <section className="fp-faq" id="faq">
      <div className="fp-faq__inner">

        <div className="fp-faq__header">
          <motion.span
            className="fp-faq__label"
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6, ease: [0.16,1,0.3,1] }}
          >
            Frequently Asked Questions
          </motion.span>
          <motion.h2
            className="fp-faq__h2"
            initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.07, ease: [0.16,1,0.3,1] }}
          >
            Got Questions?
          </motion.h2>
        </div>

        <motion.div
          className="fp-faq__list"
          initial="hidden" whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}
        >
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              className={`fp-faq__item${open === i ? ' fp-faq__item--open' : ''}`}
              variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16,1,0.3,1] } } }}
            >
              <button className="fp-faq__trigger" onClick={() => toggle(i)} aria-expanded={open === i}>
                <span className="fp-faq__question">{faq.q}</span>
                <span className="fp-faq__icon"><Plus size={14} /></span>
              </button>
              <div className="fp-faq__answer-wrap">
                <p className="fp-faq__answer">{faq.a}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <div className="fp-faq__cta">
          <p>Still have a question? We&apos;re happy to help.</p>
          <button
            className="fp-faq__cta-btn"
            onClick={() => { const el = document.getElementById('book-form'); if (el) el.scrollIntoView({ behavior: 'smooth' }); }}
          >
            Talk to a Plumber <ArrowRight size={16} />
          </button>
        </div>

      </div>
    </section>
  );
}
