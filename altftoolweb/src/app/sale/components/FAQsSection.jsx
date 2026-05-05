"use client";

import { useState } from "react";


const FAQsSection = ({faq}) => {
  const { title, subtitle, items } = faq;
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section className="section animate-slide-up">
      {/* Heading */}
      <div className="mb-8">
        <h2 className="section-title">
          {title}
        </h2>
        <p className="section-subtitle mx-0! text-left">
          {subtitle}
        </p>
      </div>

      {/* FAQ List */}
      <div className="section-content animate-slide-left">
        {items.map((item, index) => (
  <div
  key={item.id}
  className={`border rounded-2xl mt-2 transition-all duration-300
    ${
      activeIndex === index
        ? "border-[1.5px] border-(--primary)"   
        : "border-(--border) hover:border-gray-300"
    }`}
>
            {/* Question */}
            <button
              onClick={() => toggleFAQ(index)}
              className="w-full flex justify-between items-center 
                         px-4 sm:px-5 md:px-6 
                        py-3 sm:py-4 md:py-5 
                         text-left gap-3 sm:gap-4 cursor-pointer"
            >
              <span className="text-sm sm:text-base md:text-lg 
                             font-semibold text-(--foreground) 
                             leading-snug pr-2">
                {item.question}
              </span>

<span
  className={`flex-shrink-0 
             text-base sm:text-lg md:text-xl 
             font-bold transition-all duration-300
             ${
               activeIndex === index
                 ? "text-[#2563eb]"   // blue when open (−)
                 : "text-(--muted-foreground)" // default when +
             }`}
>
  {activeIndex === index ? "−" : "+"}
</span>
            </button>

            {/* Answer */}
            <div
              className={`overflow-hidden transition-all duration-300 ${
                activeIndex === index 
                  ? "max-h-60 sm:max-h-48 md:max-h-40 opacity-100" 
                  : "max-h-0 opacity-0"
              }`}
            >
              <div className="px-4 sm:px-5 md:px-6
                            pb-3 sm:pb-4 md:pb-5 
                            text-xs sm:text-sm md:text-base 
                            text-(--muted-foreground) leading-relaxed">
                {item.answer}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FAQsSection;