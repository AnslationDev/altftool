import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import '../styles/StatsSection.css';

const stats = [
  { label: 'Avg. Dispatch Time', value: 60,    suffix: ' min', prefix: '< ' },
  { label: 'Customer Rating',    value: 4.9,   suffix: ' / 5', decimal: true  },
  { label: 'Customers Served',   value: 10000, suffix: '+',    comma: true    },
  { label: 'Satisfaction Rate',  value: 100,   suffix: '%'                    },
];

function Counter({ value, prefix = '', suffix = '', decimal = false, comma = false, started }) {
  const [cur, setCur] = useState(0);
  useEffect(() => {
    if (!started) return;
    const dur = 1800, steps = 70;
    let s = 0;
    const t = setInterval(() => {
      s++;
      const ease = 1 - Math.pow(1 - s / steps, 3);
      setCur(value * ease);
      if (s >= steps) clearInterval(t);
    }, dur / steps);
    return () => clearInterval(t);
  }, [started, value]);
  const fmt = decimal ? cur.toFixed(1) : comma ? Math.round(cur).toLocaleString() : Math.round(cur).toString();
  return <>{prefix}{started ? fmt : '0'}{suffix}</>;
}

export default function StatsSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <section ref={ref} className="fp-stats" id="about-stats">
      <div className="fp-stats__grid">
        {stats.map((s, i) => (
          <motion.div key={i} className="fp-stats__item"
            initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: i * 0.1, ease: [0.16,1,0.3,1] }}>
            <div className="fp-stats__value">
              <Counter {...s} started={inView} />
            </div>
            <p className="fp-stats__label">{s.label}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
