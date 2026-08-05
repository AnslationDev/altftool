"use client";

import ShowcaseSplitSection from "./ShowcaseSplitSection";

export default function LatestDesignResourcesSection({ tools }) {
  return (
    <ShowcaseSplitSection
      title="Latest Design Resources"
      subtitle={`${tools.length} tools added in the last 30 days.`}
      tools={tools}
      showShowcase={false}
      footer={
        <div className="mt-8 text-center">
          <a
            href="#all-tools"
            className="inline-block rounded-full bg-[#0A0523] px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#0A0523]/85"
          >
            All Latest Resources →
          </a>
        </div>
      }
    />
  );
}
