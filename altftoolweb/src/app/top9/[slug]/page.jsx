"use client";

import { useParams } from "next/navigation";

import { blogs } from "../data/blogs";
import { trending } from "../data2/trending";

import {
  tabData,
  autoLists,
  newList,
  secondList,
  thirdList,
} from "../data3/content";

export default function Page() {
  const params = useParams();

  const slug = params.slug;

  // ALL DATA
  const allData = [
    ...blogs,
    ...trending,

    ...(tabData?.featured || []),
    ...(tabData?.popular || []),
    ...(tabData?.latest || []),

    ...(autoLists || []),

    // FEATURED BLOCKS
    newList,
    secondList,
    thirdList,
  ];

  // FIND ITEM
  const item = allData.find((el) => el.slug === slug);

  // NOT FOUND
  if (!item) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-20">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Not Found
        </h1>

        <p className="text-gray-500 text-lg">
          The page you are looking for does not exist.
        </p>
      </div>
    );
  }

  // DATA
  const title = item.title || item.text;

  const description =
    item.description ||
    item.desc ||
    "No description available.";

  const image =
    item.img ||
    item.image ||
    "https://via.placeholder.com/1200x600";

  const category =
    item.cat ||
    item.prefix ||
    "Top 9 List";

  return (
    <section className="max-w-5xl mx-auto px-4 md:px-6 py-10">

      {/* IMAGE */}
      <div className="overflow-hidden rounded-3xl border border-gray-200 shadow-sm">

        <img
          src={image}
          alt={title}
          className="w-full h-[260px] sm:h-[380px] md:h-[520px] object-cover"
        />

      </div>

      {/* CONTENT */}
      <div className="mt-8">

        {/* CATEGORY */}
        <span className="inline-flex items-center bg-blue-50 text-blue-600 text-sm font-medium px-4 py-2 rounded-full border border-blue-100">
          {category}
        </span>

        {/* TITLE */}
        <h1 className="text-3xl md:text-5xl font-bold text-gray-900 leading-tight mt-6">
          {title}
        </h1>

        {/* DATE */}
        {item.date && (
          <p className="text-sm text-gray-500 mt-4">
            {item.date}
          </p>
        )}

        {/* DESCRIPTION */}
        <p className="text-[17px] leading-8 text-gray-700 mt-8">
          {description}
        </p>

        {/* TOP PICKS */}
        {item.top && (
          <div className="mt-12">

            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
              Top Picks
            </h2>

            <div className="space-y-4">

              {item.top.map((el, index) => (

                <div
                  key={index}
                  className="flex items-center gap-4 border border-gray-100 rounded-2xl px-5 py-4 bg-gray-50"
                >

                  <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shrink-0">
                    {index + 1}
                  </div>

                  <p className="text-lg font-medium text-gray-800">
                    {el}
                  </p>

                </div>

              ))}

            </div>

          </div>
        )}

      </div>

    </section>
  );
}