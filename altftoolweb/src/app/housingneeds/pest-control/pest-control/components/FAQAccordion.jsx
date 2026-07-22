import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FAQAccordion = ({ faqs }) => {
  const [openId, setOpenId] = useState(null);

  const toggle = (id) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <div className="space-y-3">
      {faqs.map((faq, idx) => {
        const isOpen = openId === faq.id;
        return (
          <div key={idx} className="rounded-3xl overflow-hidden border border-[#E5E7EB]">
            <button
              onClick={() => toggle(faq.id)}
              className={`faq-question w-full ${isOpen ? 'open' : ''}`}
              aria-expanded={isOpen}
            >
              <span className="pr-6 text-left text-[15px]">{faq.question}</span>
              <ChevronDown
                size={20}
                className={`flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
              />
            </button>
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="faq-answer text-[14.5px]"
                >
                  {faq.answer}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
};

export default FAQAccordion;
