import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import '../styles/HowItWorks.css';

const steps = [
  { num: '01', title: 'Book',     desc: 'Tell us your issue online or call. Choose the service, preferred time, address, and urgency level in under 60 seconds.' },
  { num: '02', title: 'Dispatch', desc: 'We confirm your details, assign a licensed plumber, share the arrival window, and send updates before they reach your door.' },
  { num: '03', title: 'Fix',      desc: 'Your technician inspects the problem, explains repair options, gives an upfront price, and starts only after you approve.' },
  { num: '04', title: 'Done',     desc: 'We test the repair, clean the work area, review what was completed, and back the job with our 10-year workmanship warranty.' },
];

function scrollToForm() {
  const el = document.getElementById('book-form');
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}

export default function HowItWorks() {
  return (
    <section className="fp-hiw" id="how-it-works">
      <div className="fp-hiw__header">
        <motion.span className="fp-hiw__label"
          initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6, ease: [0.16,1,0.3,1] }}>
          Simple & transparent
        </motion.span>
        <motion.h2 className="fp-hiw__h2"
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.07, ease: [0.16,1,0.3,1] }}>
          How It Works
        </motion.h2>
      </div>

      <div className="fp-hiw__steps">
        <div className="fp-hiw__connector">
          <span className="fp-hiw__connector-fill" />
          <span className="fp-hiw__connector-dot" />
        </div>
        {steps.map((s, i) => (
          <motion.div key={i} className="fp-hiw__step"
            style={{ '--fp-step-index': i }}
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16,1,0.3,1] }}>
            <div className="fp-hiw__step-num">{s.num}</div>
            <h3 className="fp-hiw__step-title">{s.title}</h3>
            <p className="fp-hiw__step-desc">{s.desc}</p>
          </motion.div>
        ))}
      </div>

      <div className="fp-hiw__cta">
        <motion.button className="fp-hiw__btn" onClick={scrollToForm}
          initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6, ease: [0.16,1,0.3,1] }}>
          Get Started <ArrowRight size={16} />
        </motion.button>
      </div>
    </section>
  );
}
