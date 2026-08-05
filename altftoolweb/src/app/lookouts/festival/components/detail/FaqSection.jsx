"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { formatDateLabel } from "../../lib/dateMath";
import { getCountryName } from "../../data/countryNames";

function buildFaqs(festival, dateIso, dateSource) {
  const countryNames = festival.countryCodes.map(getCountryName).join(", ");
  const faqs = [];

  const dateLabel = formatDateLabel(dateIso);
  if (dateLabel) {
    faqs.push({
      question: `When is ${festival.name} celebrated?`,
      answer: `${festival.name} falls on ${dateLabel}${dateSource === "live" ? ", based on the official public holiday calendar" : " (estimated date — exact timing can vary by region or calendar reckoning)"}.`,
    });
  }

  faqs.push({
    question: `Which countries celebrate ${festival.name}?`,
    answer: `${festival.name} is primarily celebrated in ${countryNames}, and among diaspora communities worldwide.`,
  });

  faqs.push({
    question: `Is ${festival.name} a public holiday?`,
    answer:
      dateSource === "live"
        ? `Yes — it's listed as an official public holiday in at least one of the countries where it's celebrated.`
        : `It isn't listed as a nationwide public holiday in the countries we track, but it remains a widely observed cultural or religious occasion.`,
  });

  if (festival.traditions.length) {
    faqs.push({
      question: `What are the main traditions of ${festival.name}?`,
      answer: `Common traditions include ${festival.traditions.slice(0, 4).join(", ")}.`,
    });
  }

  if (festival.foods.length) {
    faqs.push({
      question: `What foods are associated with ${festival.name}?`,
      answer: `Popular dishes include ${festival.foods.slice(0, 4).join(", ")}.`,
    });
  }

  faqs.push({
    question: `How long does ${festival.name} last?`,
    answer: `${festival.name} is typically observed over ${festival.durationDays} day${festival.durationDays > 1 ? "s" : ""}.`,
  });

  return faqs;
}

export default function FaqSection({ festival, dateIso, dateSource }) {
  const faqs = buildFaqs(festival, dateIso, dateSource);
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="festival-section" id="faq">
      <div className="festival-section-inner festival-detail-narrow">
        <div className="section-header">
          <div>
            <p className="section-label">Good to Know</p>
            <h2>Frequently Asked Questions</h2>
          </div>
        </div>

        <div className="festival-faq-list">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div key={faq.question} className={`festival-faq-item${isOpen ? " is-open" : ""}`}>
                <button
                  type="button"
                  className="festival-faq-question"
                  onClick={() => setOpenIndex(isOpen ? -1 : index)}
                  aria-expanded={isOpen}
                >
                  {faq.question}
                  <ChevronDown size={16} className="festival-faq-chevron" />
                </button>
                {isOpen ? <p className="festival-faq-answer">{faq.answer}</p> : null}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
