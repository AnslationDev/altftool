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
    <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 bg-white">

      {/* LEFT SIDE */}
      <div className="lg:col-span-8">

        <div className="space-y-8">

          {featuredSections.map((item, index) => (

            <div
              key={index}
              className="bg-[#f6f6f6] border border-gray-200 p-5 md:p-6 flex flex-col sm:flex-row gap-6 shadow-sm"
            >

              {/* IMAGE */}
              <div className="w-full sm:w-[230px] h-[230px] shrink-0 overflow-hidden rounded-md border border-gray-300 bg-white">

                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover hover:scale-105 transition-all duration-500"
                />

              </div>

              {/* CONTENT */}
              <div className="flex-1 flex flex-col justify-center">

                <span className="text-[13px] uppercase tracking-wide text-gray-400 mb-2">
                  New List
                </span>

                <Link href={`/top9/${item.slug}`}>

                  <h2 className="text-[24px] md:text-[30px] font-medium text-[#0086b3] leading-tight hover:underline mb-5">
                    {item.title}
                  </h2>

                </Link>

                <ol className="space-y-2 text-[15px] text-gray-700">

                  {item.top.map((name, idx) => (

                    <li
                      key={idx}
                      className="border-b border-gray-200 pb-2"
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
        <div className="border border-gray-200 bg-[#f2f2f2]">

          {/* TAB HEADINGS */}
          <div className="grid grid-cols-3 text-center">

            {["featured", "popular", "latest"].map((tab) => (

              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-3 text-[14px] capitalize transition-all border-b border-gray-200 ${
                  activeTab === tab
                    ? "bg-white font-semibold text-gray-900"
                    : "text-gray-500 hover:bg-gray-100"
                }`}
              >
                {tab}
              </button>

            ))}

          </div>

          {/* TAB CONTENT */}
          <div className="bg-white p-4">

            <div className="space-y-4">

              {tabData[activeTab].map((item, i) => (

                <div
                  key={i}
                  className="border-b border-gray-100 pb-3 last:border-b-0"
                >

                  <Link
                    href={`/top9/${item.slug}`}
                    className="text-[14px] text-[#0086b3] leading-relaxed hover:underline"
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

          <h3 className="text-[14px] uppercase tracking-wider text-gray-400 mb-5">
            Auto-Updating Lists
          </h3>

          <div className="space-y-5">

            {autoLists.map((item, i) => (

              <div
                key={i}
                className="flex items-start gap-3"
              >

                <div className="w-11 h-11 rounded-full overflow-hidden border border-gray-200 shrink-0">

                  <img
                    src={item.img}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />

                </div>

                <div>

                  <Link href={`/top9/${item.slug}`}>

                    <p className="text-[14px] font-semibold text-[#0086b3] hover:underline leading-snug">
                      {item.title}
                    </p>

                  </Link>

                  <p className="text-[12px] text-gray-400 mt-1">
                    Auto Updated
                  </p>

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