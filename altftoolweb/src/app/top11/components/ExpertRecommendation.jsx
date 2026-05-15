"use client";

import Image from "next/image";
import Link from "next/link";
import {
  CheckCircle2,
  ArrowUpRight,
  ChevronDown,
  Star,
} from "lucide-react";
import { useState } from "react";

import expertRecommendations from "../data/expertRecommendations";

const badgeColors = {
  blue: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
  purple:
    "bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300",
  sky: "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300",
  orange:
    "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300",
  green:
    "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300",
  indigo:
    "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300",
  pink: "bg-pink-100 text-pink-700 dark:bg-pink-500/15 dark:text-pink-300",
  amber:
    "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
};

export default function ExpertRecommendation() {
const [showAll, setShowAll] = useState(false);

  return (
    <section className="section bg-(--background)">
      
        {/* HEADER */}
        <div className="section-header mb-10">
          <h2 className="section-title">
            Top Picks This Month
          </h2>

          <p className="section-subtitle">
            Expert-reviewed products across the most searched categories.
          </p>
        </div>

        {/* MAIN CARD */}
        <div
          className="
            overflow-hidden
            rounded-4xl
            border
            border-(--border)
            bg-(--background)
            shadow-[0px_8px_30px_rgba(0,0,0,0.04)]
          "
        >
          {(showAll ? expertRecommendations : expertRecommendations.slice(0, 3)).map((item, index) => (
            <div
              key={item.id}
              className={`
                flex flex-col xl:flex-row
                xl:items-center
                justify-between
                gap-8
                px-6 lg:px-8
                py-8 
                ${
                  index !== ( showAll ? expertRecommendations.length-1 : 2)

                    ? "border-b border-(--border)"
                    : ""
                }
              `}
            >
              {/* LEFT */}
              <div className="flex items-center gap-5 min-w-0 xl:min-w-[320px]">
                {/* LOGO */}
                <div
                  className="
                    relative
                    w-20
                    h-20
                    rounded-3xl
                    overflow-hidden
                    shrink-0
                    border
                    border-(--border)
                    bg-(--card)
                  "
                >
                  <Image
                    src={item.logo}
                    alt={item.brand}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* INFO */}
                <div className="min-w-0">
                  {/* BADGE */}
                  <div
                    className={`
                      inline-flex
                      items-center
                      gap-1
                      rounded-full
                      px-3
                      py-1
                      text-xs
                      font-bold
                      mb-3
                      ${badgeColors[item.badge.color]}
                    `}
                  >
                    <Star className="w-3 h-3 fill-current" />

                    {item.badge.text}
                  </div>

                  {/* TITLE */}
                  <h3 className="text-2xl font-bold text-(--foreground)">
                    {item.brand}
                  </h3>

                  {/* TAGLINE */}
                  <p className="mt-2 text-sm md:text-sm font-medium text-(--muted-foreground) xl:max-w-50 ">
                    {item.tagline}
                  </p>
                </div>
              </div>

              {/* FEATURES */}
              <div className="flex-1 xl:max-w-82.5">
                <ul className="space-y-3">
                  {item.features.map((feature, i) => (
                    <li
                      key={i}
                      className="
                        flex items-center gap-3
                        text-sm md:text-[15px]
                        text-(--foreground)
                      "
                    >
                      <CheckCircle2
                        className="
                          w-4 h-4
                          shrink-0
                          text-(--primary)
                        "
                      />

                      <span className="font-semibold text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* RATING */}
              <div className="xl:w-30">
                {/* STARS */}
                <div className="flex items-center gap-0.5 mb-2">
                  {[1, 2, 3, 4, 5 ].map((star) => (
                    <Star
                      key={star}
                      className="
                        w-4 h-4
                        fill-yellow-400
                        text-yellow-400
                      "
                    />
                  ))}
                </div>

                {/* SCORE */}
                <div className="flex items-center gap-2">
                  <span className="text-[28px] font-bold text-(--foreground)">
                    {item.rating}
                  </span>
                </div>

                {/* REVIEWS */}
                <p className="mt-2 text-sm font-semibold text-(--muted-foreground)">
                  {item.reviews}
                </p>
              </div>

              {/* BUTTON */}
              <div className="min-w-50 flex flex-col items-center">
                <Link
                  href={item.cta.link}
                  className={`
                    w-full
                    h-13.5
                    rounded-full
                    flex items-center justify-center gap-2
                    text-[15px]
                    font-semibold
                    transition-all duration-300
                    border border-(--primary) text-(--primary) hover:bg-(--primary) bg-(--section-highlight) hover:text-white                
                  `}
                >
                  {item.cta.text}

                  <ArrowUpRight className="w-4 h-4" />
                </Link>

                <p className="mt-4 text-xs text-center font-semibold text-(--muted-foreground)">
                  {item.note}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* BOTTOM BUTTON */}
        <div className="flex justify-center mt-10">
          <button
          onClick={() => setShowAll(!showAll)}
            className="
              h-13 cursor-pointer
              px-8
              rounded-full
              bg-(--primary)
              hover:bg-(--primary-hover)
              text-(--primary-foreground)
              font-medium
              flex items-center gap-2
              transition-all duration-300
            "
          >
           {showAll ? "Show Less" : "View All Top Picks"}
            <ChevronDown className={`w-4 h-4 transition-transform duration-300 
                ${showAll? "rotate-180" : " " }`}/>
          </button>
        </div>
       
    </section>
  );
}