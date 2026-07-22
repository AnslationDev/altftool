"use client";

import React from "react";

import {
  LayoutTemplate,
  Layers3,
  MonitorSmartphone,
  Palette,
  Check,
} from "lucide-react";

import { templates } from "../../utils/templates";

const iconMap = {
  modern: LayoutTemplate,
  minimal: Layers3,
  tech: MonitorSmartphone,
  creative: Palette,
};

const TemplatesPanel = ({
  selectedTemplate,
  setSelectedTemplate,
}) => {
  return (
    <div className="px-4 pt-4 pb-2">


      <div className="flex items-center gap-2 mb-4">
        <LayoutTemplate className="w-5 h-5 text-blue-500" />

        <h3 className="text-lg font-semibold text-(--foreground)">
          Choose Template
        </h3>
      </div>


      <div
        className="
          flex gap-4 overflow-x-auto pb-4
          snap-x snap-mandatory
          scroll-smooth

          [&::-webkit-scrollbar]:hidden
          [-ms-overflow-style:none]
          [scrollbar-width:none]
        "
      >


        <button
          onClick={() => setSelectedTemplate("")}
          className={`
            relative flex-shrink-0
            w-[220px]
            h-[240px]

            rounded-3xl
            overflow-hidden

            border

            transition-all duration-300

            hover:scale-[1.02]
            hover:shadow-xl

            ${
              !selectedTemplate
                ? "border-blue-500 shadow-lg"
                : "border-(--border) bg-(--card)"
            }
          `}
        >

          {!selectedTemplate && (
            <div
              className="
                absolute top-3 right-3
                bg-green-500 text-white
                rounded-full p-1 z-10
              "
            >
              <Check className="w-3 h-3" />
            </div>
          )}


          <div className="p-3 border-b border-(--border)">
            <h4 className="text-sm font-semibold text-(--foreground)">
              No Template
            </h4>

            <p className="text-[10px] text-(--muted-foreground)">
              Original ATS Resume
            </p>
          </div>


          <div className="bg-(--background) p-4 h-full">
            <div className="space-y-3">

              <div className="text-center border-b border-(--border) pb-3">
                <div className="h-4 w-28 bg-(--foreground) mx-auto rounded" />

                <div className="h-2 w-16 bg-blue-500 mx-auto mt-2 rounded" />
              </div>

              <div className="space-y-2">
                <div className="h-2 w-16 bg-(--foreground) rounded" />

                <div className="space-y-2">
                  <div className="h-2 bg-(--border) rounded" />

                  <div className="h-2 bg-(--border) rounded w-5/6" />

                  <div className="h-2 bg-(--border) rounded w-4/6" />
                </div>
              </div>


              <div className="space-y-2">
                <div className="h-2 w-20 bg-(--foreground) rounded" />

                <div className="space-y-2">
                  <div className="h-2 bg-(--border) rounded" />

                  <div className="h-2 bg-(--border) rounded w-3/4" />
                </div>
              </div>


              <div className="flex gap-2 pt-1 flex-wrap">
                <div className="h-5 w-14 rounded-full bg-(--border)" />

                <div className="h-5 w-16 rounded-full bg-(--border)" />

                <div className="h-5 w-12 rounded-full bg-(--border)" />
              </div>
            </div>
          </div>
        </button>


        {templates.map((template) => {
          const Icon = iconMap[template.id];

          const isActive =
            selectedTemplate === template.id;

          return (
            <button
              key={template.id}
              onClick={() =>
                setSelectedTemplate(template.id)
              }

              className={`
                relative flex-shrink-0

                w-[220px]
                h-[240px]

                rounded-3xl
                overflow-hidden

                border

                transition-all duration-300

                hover:scale-[1.02]
                hover:shadow-xl

                ${
                  isActive
                    ? `${template.border} shadow-xl`
                    : "border-(--border) bg-(--card)"
                }
              `}
            >

              {isActive && (
                <div
                  className="
                    absolute top-3 right-3
                    bg-green-500 text-white
                    rounded-full p-1 z-10
                  "
                >
                  <Check className="w-3 h-3" />
                </div>
              )}


              <div className="p-3 border-b border-(--border)">
                <h4 className="text-sm font-semibold text-(--foreground)">
                  {template.name}
                </h4>

                <p className="text-[10px] text-(--muted-foreground)">
                  {template.name} Resume Style
                </p>
              </div>


              <div className="bg-(--background) h-full p-4">


                {template.id === "modern" && (
                  <div className="space-y-3">

                    <div className="space-y-2">
                      <div className="h-3 w-24 bg-blue-500 rounded" />

                      <div className="h-2 bg-(--border) rounded" />

                      <div className="h-2 bg-(--border) rounded w-5/6" />

                      <div className="h-2 bg-(--border) rounded w-4/6" />
                    </div>

                    <div className="space-y-2">
                      <div className="h-2 w-20 bg-(--foreground) rounded" />

                      <div className="space-y-2">
                        <div className="h-2 bg-(--border) rounded" />

                        <div className="h-2 bg-(--border) rounded w-5/6" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="h-2 w-24 bg-(--foreground) rounded" />

                      <div className="flex gap-2 flex-wrap">
                        <div className="h-5 w-14 rounded-full bg-blue-200 dark:bg-blue-500/30" />

                        <div className="h-5 w-16 rounded-full bg-blue-200 dark:bg-blue-500/30" />

                        <div className="h-5 w-12 rounded-full bg-blue-200 dark:bg-blue-500/30" />
                      </div>
                    </div>
                  </div>
                )}


                {template.id === "minimal" && (
                  <div className="space-y-4">

                    <div className="border-b border-(--border) pb-2">
                      <div className="h-3 w-28 bg-(--foreground) rounded" />

                      <div className="h-2 w-16 bg-(--muted-foreground) rounded mt-2" />
                    </div>

                    <div className="space-y-2">
                      <div className="h-2 bg-(--border) rounded" />

                      <div className="h-2 bg-(--border) rounded w-5/6" />

                      <div className="h-2 bg-(--border) rounded w-4/6" />
                    </div>

                    <div className="space-y-2">
                      <div className="h-2 bg-(--border) rounded" />

                      <div className="h-2 bg-(--border) rounded w-3/4" />
                    </div>
                  </div>
                )}


                {template.id === "tech" && (
                  <div className="space-y-3">

                    <div className="space-y-2">
                      <div className="h-3 w-24 bg-emerald-500 rounded" />

                      <div className="h-2 w-16 bg-emerald-300 dark:bg-emerald-500/40 rounded" />
                    </div>

                    <div className="space-y-2">
                      <div className="h-2 bg-(--border) rounded" />

                      <div className="h-2 bg-(--border) rounded w-5/6" />

                      <div className="h-2 bg-(--border) rounded w-4/6" />
                    </div>

                    <div className="space-y-2">
                      <div className="h-2 bg-(--border) rounded" />

                      <div className="h-2 bg-(--border) rounded w-3/4" />
                    </div>

                    <div className="flex gap-2 pt-1">
                      <div className="h-5 w-12 rounded-md bg-emerald-200 dark:bg-emerald-500/30" />

                      <div className="h-5 w-12 rounded-md bg-cyan-200 dark:bg-cyan-500/30" />

                      <div className="h-5 w-12 rounded-md bg-teal-200 dark:bg-teal-500/30" />
                    </div>
                  </div>
                )}


                {template.id === "creative" && (
                  <div className="space-y-3">

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-400" />

                      <div className="space-y-2">
                        <div className="h-3 w-20 bg-purple-500 rounded" />

                        <div className="h-2 w-14 bg-pink-300 rounded" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="h-14 rounded-xl bg-purple-200 dark:bg-purple-500/30" />

                      <div className="h-14 rounded-xl bg-pink-200 dark:bg-pink-500/30" />

                      <div className="h-14 rounded-xl bg-indigo-200 dark:bg-indigo-500/30" />

                      <div className="h-14 rounded-xl bg-fuchsia-200 dark:bg-fuchsia-500/30" />
                    </div>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TemplatesPanel;
