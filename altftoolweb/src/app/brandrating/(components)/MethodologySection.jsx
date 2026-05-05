"use client";

import React from "react";
import { Search, Users, ClipboardCheck, ThumbsUp } from "lucide-react";

function MethodologySection() {
  const items = [
    {
      icon: Search,
      title: "Research",
      desc: "Our team of trusted experts rigorously reviews data and research related to every product and service we recommend.",
    },
    {
      icon: Users,
      title: "Reviews",
      desc: "We evaluate thousands of verified customer reviews to understand real-world performance.",
    },
    {
      icon: ClipboardCheck,
      title: "Testings",
      desc: "Products are independently tested to ensure accuracy, quality, and reliability.",
    },
    {
      icon: ThumbsUp,
      title: "Recommendations",
      desc: "We deliver unbiased, evidence-based recommendations you can trust.",
    },
  ];

  return (
    <section className="w-full section animate-slide-up">
      <div className=" max-w-[1248px] mx-auto text-center flex flex-col gap-2 pb-8 sm:pb-10 animate-slide-right">
        
        <h2 className="section-title">
          Consumer Rating Difference
        </h2>

        <p className="section-subtitle ">
          Make smarter buying decisions with ConsumerRating.org. We analyze reviews, compare prices and features, and test top products to deliver expert recommendations—all in one place.
        </p>
      </div>
      <div className="max-w-full mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-14">



        {/* Right Grid */}

        {items.map((item, index) => {
          const Icon = item.icon;

          return (
            <div key={index} style={{ animationDelay: `${index * 90}ms` }} className={`
              flex flex-col items-center text-center sm:items-start sm:text-left gap-3 sm:gap-4 md:gap-6 p-4 sm:p-5 md:p-6 hover:bg-[var(--muted)]/5 transition outline-none
              md:border-r md:border-(--border)
              animate-slide-up
             ${index === items.length - 1 ? "md:border-none" : ""}
              `}
            >
              <Icon
                className="text-[var(--primary)] shrink-0 w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11"
   strokeWidth={1.5}
              />

              <h3 className="font-primary font-bold text-[18px] sm:text-[19px] md:text-xl leading-[1.25] text-[var(--foreground)]">
                {item.title}
              </h3>

              <p className="font-secondary text-[14px] sm:text-[15px] md:text-base leading-[1.6] text-[var(--muted-foreground)]">
                {item.desc}
              </p>
            </div>
          );
        })}


      </div>
    </section>
  );
}

export default MethodologySection;
