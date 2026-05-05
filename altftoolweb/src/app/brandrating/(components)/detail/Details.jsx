"use client";

import { useState } from "react";

export default function Details({ brand = {}, category = {} }) {
  const [active, setActive] = useState(0);

  const rawDesc = brand.description ?? category.desc ?? "";
  const descParagraphs = Array.isArray(rawDesc)
    ? rawDesc
    : rawDesc.split(/\n+/).map((p) => p.trim()).filter(Boolean);

  const keyFeaturesRaw =
    brand?.keyFeatures ||
    brand?.additionalBenefits ||
    brand?.additionalBenefit ||
    brand?.features ||
    [];

  const keyFeatures = keyFeaturesRaw.map((item) => {
    if (typeof item === "string") return item;
    return item?.text || item?.heading || item?.description || "";
  }).filter(Boolean);
  const rawSpecs = brand.specifications || brand.specification || [];


  const specRows = (Array.isArray(rawSpecs)
    ? rawSpecs.map((item) => {
      if (typeof item === "string") {
        const [label, ...rest] = item.split(":");
        return {
          label: label?.trim(),
          value: rest.join(":").trim(),
        };
      }
      return item;
    })
    : Object.entries(rawSpecs).map(([label, value]) => ({
      label,
      value,
    }))
  ).filter((row) => row?.label && row?.value);

  const tabs = [
    { label: "Description" },
    { label: "Key Features" },
    { label: "Specifications" },
  ];

  return (
    <section className="w-full section animate-slide-up">
      {/* Tabs */}
      <div
        role="tablist"
        className="flex overflow-x-auto no-scrollbar justify-start sm:justify-center gap-4 sm:gap-8 lg:gap-12 border-b border-(--muted-foreground)/20 animate-slide-right"
      >
        {tabs.map((tab, i) => {
          const isActive = active === i;

          return (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`relative pb-3 pt-2 text-sm sm:text-base md:text-lg lg:text-xl font-medium transition-colors
                ${isActive ? "text-(--muted-foreground) font-semibold" : "text-(--muted-foreground)/80 hover:(--muted-foreground)/90"}
              `}
            >
              {tab.label}

              <span
                className={`absolute left-0 bottom-0 h-[3px] w-full rounded-full transition-all
                  ${isActive ? "bg-(--primary)" : "bg-transparent"}
                `}
              />
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto  py-6 sm:py-10 lg:py-12">
        {/* Description */}
        {active === 0 && (
          <div className="space-y-3 text-sm sm:text-base text-(--muted-foreground) leading-6 sm:leading-7">
            {descParagraphs.length > 0 ? (
              descParagraphs.map((p, i) => <p key={i}>{p}</p>)
            ) : (
              <p className="text-center text-(--muted-foreground) ">
                No description available.
              </p>
            )}
          </div>
        )}

        {/* Key Features */}
        {active === 1 && (
          <div>
            {keyFeatures.length > 0 ? (
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-8">
                {keyFeatures.map((feat, i) => (
                  <li key={i} className="flex items-start gap-3 text-(--muted-foreground) ">
                    <span className="mt-2 h-2 w-2 rounded-full bg-(--muted-foreground)" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-(--muted-foreground)">
                No key features listed.
              </p>
            )}
          </div>
        )}

        {/* Specifications */}
        {active === 2 && (
          <div>
            {specRows.length > 0 ? (
              <div className="max-w-3xl mx-auto relative">

                {/*DIVIDER */}
                <div className="hidden sm:block absolute left-1/2 top-0 -translate-x-1/2 h-full w-px bg-(--muted-foreground)/40" />
                <div className="space-y-5">
                  {specRows.map(({ label, value }, i) => (
                    <div
                      key={i}
                      className="grid grid-cols-1 sm:grid-cols-2 items-start gap-y-1"
                    >
                      <div className="font-medium text-(--muted-foreground) sm:pr-6 leading-snug break-words sm:text-right">
                        {label}:
                      </div>
                      <div className="text-(--muted-foreground) sm:pl-6 leading-snug break-words">
                        {value}
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            ) : (
              <p className="text-center text-(--muted-foreground)">
                No specifications available.
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
