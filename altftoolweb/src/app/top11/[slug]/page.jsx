import React from "react";
import { notFound } from "next/navigation";
import categoryData from "@/app/top11/data/categoryData";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createItemListJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import ManagedImage from "@/components/ui/ManagedImage";

export function generateStaticParams() {
  return Object.keys(categoryData).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const data = categoryData[slug];

  if (!data) {
    return {
      title: "Top11 Category Not Found",
      robots: { index: false, follow: true },
    };
  }

  return createPageMetadata({
    title: data.title,
    description: data.description,
    path: `/top11/${slug}`,
    image: data.banner,
  });
}

export default async function CategoryPage({ params }) {
  const { slug } = await params;
  const data = categoryData[slug];

  if (!data) notFound();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] to-[#eef2ff]">
      <JsonLd
        id={`top11-schema-${slug}`}
        data={[
          createItemListJsonLd({
            path: `/top11/${slug}`,
            name: data.title,
            items: data.tools.map((tool, index) => ({
              name: `${index + 1}. ${tool.name}`,
              path: `/top11/${slug}`,
            })),
          }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Top11", path: "/top11" },
            { name: data.title, path: `/top11/${slug}` },
          ]),
        ]}
      />

      {/* HERO BANNER */}
      <div className="relative w-full h-[260px] md:h-[360px] overflow-hidden">

        <ManagedImage
          src={data.banner || "/dealImg/deal1.png"}
          alt={data.title}
          className="absolute inset-0 w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-black/60" />

        <div className="relative z-10 max-w-6xl mx-auto px-6 h-full flex flex-col justify-center text-white">
          <p className="text-sm opacity-80 mb-2">
            Last Updated: May 2026
          </p>

          <h1 className="text-3xl md:text-5xl font-bold leading-tight">
            {data.title}
          </h1>

          <p className="mt-4 text-lg opacity-90 max-w-2xl">
            {data.description}
          </p>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-6xl mx-auto px-6 mt-10 grid md:grid-cols-3 gap-6">

        {/* LEFT SIDE */}
        <div className="md:col-span-2 space-y-6">

          {data.tools.map((tool, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-2xl shadow hover:shadow-md transition border border-gray-300"
            >

              {/* TOP */}
              <div className="flex justify-between items-center">

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {index === 0 && (
                      <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded">
                        #1 Best Choice
                      </span>
                    )}
                  </div>

                  <h2 className="text-xl font-bold">{tool.name}</h2>
                  <p className="text-sm text-gray-500">{tool.reviews}</p>
                </div>

                {/* SCORE */}
                <div className="text-right">
                  <p className="text-3xl font-bold text-green-600">
                    {tool.rating}
                  </p>
                  <p className="text-sm text-gray-500">Excellent</p>
                </div>
              </div>

              {/* FEATURES */}
              <ul className="mt-5 space-y-2">
                {tool.features.map((f, i) => (
                  <li key={i} className="text-gray-700 flex items-center gap-2">
                    <span className="text-green-500">✔</span> {f}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <button className="mt-6 w-full btn-primary  text-white py-3 rounded-lg font-semibold">
                Visit Site
              </button>

            </div>
          ))}

        </div>

        {/* RIGHT SIDEBAR */}
        <div className="space-y-5">

          {/* STATS */}
          <div className="bg-white p-5 rounded-2xl shadow border border-gray-300">
            <h3 className="font-bold text-lg mb-2">
              Top10 Score
            </h3>
            <p className="text-sm text-gray-600">
              Our rankings are based on:
            </p>

            <ul className="mt-3 space-y-2 text-sm text-gray-700">
              <li>✔ Popularity</li>
              <li>✔ Brand Reputation</li>
              <li>✔ Features & Benefits</li>
            </ul>
          </div>

          {/* TRUST */}
          <div className="bg-white p-5 rounded-2xl shadow border border-gray-300">
            <h3 className="font-bold text-lg mb-2">
              Secure Connection
            </h3>
            <p className="text-sm text-gray-600">
              All providers use SSL encryption to keep your data safe.
            </p>
          </div>

          {/* CTA */}
          <div className="bg-blue-600 text-white p-5 rounded-2xl shadow">
            <h3 className="font-bold text-lg">
              Start Comparing Now
            </h3>
            <p className="text-sm mt-2 opacity-90">
              Find the best tool for your needs instantly.
            </p>
            <button className="mt-4 bg-white text-blue-600 px-4 py-2 rounded font-semibold">
              Get Started
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
