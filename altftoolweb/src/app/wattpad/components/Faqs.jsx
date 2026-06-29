"use client";

import { useState } from "react";

const FAQs = ({faq}) => {
  const { title, subtitle, items } = faq;
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  if (!items?.length) return null;

  return (
    <section className="wp-section wp-anim-fade-up">
      <div className="wp-section-header">
        <h2 className="wp-section-title">{title}</h2>
        <p className="wp-section-subtitle">{subtitle}</p>
      </div>

      <div>
        {items.map((item, index) => (
          <div
            key={item.id}
            className={`wp-faq-item ${activeIndex === index ? "wp-faq-item-active" : ""}`}
          >
            <button
              onClick={() => toggleFAQ(index)}
              className="wp-faq-trigger"
              aria-expanded={activeIndex === index}
            >
              <span className="wp-faq-question">{item.question}</span>
              <span className="wp-faq-icon">{activeIndex === index ? "−" : "+"}</span>
            </button>

            <div
              className={`wp-faq-answer ${activeIndex === index ? "max-h-40 opacity-100" : "max-h-0 opacity-0"}`}
            >
              <div className="wp-faq-answer-content">{item.answer}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FAQs;
