"use client";

import React, { useState } from "react";
import Link from "next/link";

import {
  tabData,
  autoLists,
  newList,
  secondList,
  thirdList,
} from "../data3/content";

const ContentArea = () => {
  const [activeTab, setActiveTab] = useState("featured");

  // ALL FEATURED BLOCKS
  const featuredSections = [
    {
      ...newList,
      image: newList.img,
    },

    {
      ...secondList,
      image: secondList.img,
    },

    {
      ...thirdList,
      image: thirdList.img,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">

      {/* LEFT SIDE */}
      <div className="lg:col-span-8">

        <div className="space-y-8">

          {featuredSections.map((item, index) => (

            <div
              key={index}
              className="top9-card p-5 md:p-6 flex flex-col sm:flex-row gap-6 rounded-[var(--anslation-ds-radius-lg)]"
            >

              {/* IMAGE */}
              <div className="top9-image-frame w-full sm:w-[230px] h-[230px] shrink-0 overflow-hidden rounded-[var(--anslation-ds-radius)]">

                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover hover:scale-105 transition-all duration-500"
                />

              </div>

              {/* CONTENT */}
              <div className="flex-1 flex flex-col justify-center">

                <span className="top9-muted-text text-[13px] uppercase tracking-wide mb-2">
                  New List
                </span>

                <Link href={`/top9/${item.slug}`}>

                  <h2 className="top9-link text-[24px] md:text-[30px] font-bold leading-tight hover:underline mb-5">
                    {item.title}
                  </h2>

                </Link>

                <ol className="space-y-2 text-[15px] top9-muted-text">

                  {item.top.map((name, idx) => (

                    <li
                      key={idx}
                      className="border-b border-(--border) pb-2"
                    >
                      <span className="font-semibold mr-2">
                        {idx + 1}.
                      </span>

                      {name}
                    </li>

                  ))}

                </ol>

              </div>

            </div>

          ))}

        </div>

      </div>

      {/* RIGHT SIDE */}
      <aside className="lg:col-span-4 space-y-8">

        {/* TABS */}
        <div className="top9-panel rounded-[var(--anslation-ds-radius-lg)] overflow-hidden">

          {/* TAB HEADINGS */}
          <div className="grid grid-cols-3 text-center">

            {["featured", "popular", "latest"].map((tab) => (

              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-3 text-[14px] capitalize transition-all border-b border-(--border) ${
                  activeTab === tab
                    ? "bg-(--card) font-semibold text-(--foreground)"
                    : "top9-muted-text hover:bg-(--primary)/5"
                }`}
              >
                {tab}
              </button>

            ))}

          </div>

          {/* TAB CONTENT */}
          <div className="bg-(--card) p-4">

            <div className="space-y-4">

              {tabData[activeTab].map((item, i) => (

                <div
                  key={i}
                  className="border-b border-(--border) pb-3 last:border-b-0"
                >

                  <Link
                    href={`/top9/${item.slug}`}
                    className="top9-link text-[14px] leading-relaxed hover:underline"
                  >
                    {item.title}
                  </Link>

                </div>

              ))}

            </div>

          </div>

        </div>

        {/* AUTO LISTS */}
        <div>

          {/*
            Previously labelled "Auto-Updating Lists" with an "Auto Updated"
            stamp per row. Nothing here updates automatically — these are the
            same four static entries as every other block — so the claim and
            the stamp are gone.
          */}
          <h3 className="top9-muted-text text-[14px] uppercase tracking-wider mb-5">
            More Lists
          </h3>

          <div className="space-y-5">

            {autoLists.map((item, i) => (

              <div
                key={i}
                className="flex items-start gap-3"
              >

                <div className="top9-image-frame w-11 h-11 rounded-full overflow-hidden shrink-0">

                  <img
                    src={item.img}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />

                </div>

                <div>

                  <Link href={`/top9/${item.slug}`}>

                    <p className="top9-link text-[14px] font-semibold hover:underline leading-snug">
                      {item.title}
                    </p>

                  </Link>

                </div>

              </div>

            ))}

          </div>

        </div>

      </aside>

    </div>
  );
};

export default ContentArea;
