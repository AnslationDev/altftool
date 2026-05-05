"use client";
import React from "react";
import { Search, Package, Zap } from "lucide-react";

const steps = [
  {
    step: 1,
    title: "Enter Package Name",
    description:
      "Type the name of any NPM package. Works for normal packages like 'react' and scoped ones like '@angular/core'.",
    icon: Search,
  },
  {
    step: 2,
    title: "We Query NPM Registry",
    description:
      "The tool connects to the official NPM registry and fetches metadata using retry logic for reliability.",
    icon: Zap,
  },
  {
    step: 3,
    title: "Get Instant Results",
    description:
      "View the latest stable version along with metadata in a clean and easy-to-read format.",
    icon: Package,
  },
];

export default function HowItWorksPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-(--foreground)">
      {/* HEADER */}
      <div className="text-center mb-12">
        {/* <div className="inline-block p-4 rounded-2xl bg-(--primary) shadow mb-6">
          <Zap className="w-12 h-12 text-(--primary-foreground)" />
        </div> */}

        <h1 className="text-4xl font-extrabold text-(--foreground) mb-4">
          How It Works
        </h1>

        <p className="text-lg text-(--muted-foreground)">
          Simple, fast, and reliable package version checking
        </p>
      </div>

      {/* STEPS */}
      <div className="space-y-8">
        {steps.map((item) => (
          <div
            key={item.step}
            className="bg-(--card) rounded-xl shadow-lg p-6 sm:p-8 border border-(--border)"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              {/* ICON BUBBLE */}
              <div className="shrink-0 w-16 h-16 flex items-center justify-center rounded-full bg-(--muted)">
                <item.icon className="w-8 h-8 text-(--primary)" />
              </div>

              {/* TEXT */}
              <div className="grow">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-sm font-bold px-3 py-1 rounded-full bg-(--muted) text-(--foreground)">
                    Step {item.step}
                  </span>

                  <h3 className="text-xl font-bold text-(--foreground)">
                    {item.title}
                  </h3>
                </div>

                <p className="text-(--muted-foreground)">{item.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* TECHNICAL DETAILS */}
      <div
        className="mt-12 rounded-xl p-8 bg-(--muted) border border-(--border)
        "
      >
        <h2 className="text-2xl font-bold text-(--foreground) mb-4">
          Technical Details
        </h2>

        <ul className="space-y-3 text-(--foreground)">
          <li className="flex items-start gap-3">
            <span className="font-bold text-(--primary)">•</span>
            <span>
              Connects directly to official NPM registry (registry.npmjs.org)
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="font-bold text-(--primary)">•</span>
            <span>
              Uses <b>dist-tags.latest</b> for the newest stable version
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="font-bold text-(--primary)">•</span>
            <span>Retry logic ensures stable network performance</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="font-bold text-(--primary)">•</span>
            <span>Fully supports scoped packages and all NPM naming rules</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
