"use client";

import ShowcaseSplitSection from "./ShowcaseSplitSection";

export default function PartnerPicksSection({ tools }) {
  return (
    <ShowcaseSplitSection
      title={
        <>
          Partner Design Picks<span className="text-[#0A0523]/30">*</span>
        </>
      }
      subtitle="Sponsored tools our editorial team also recommends."
      tools={tools}
      showShowcase={false}
    />
  );
}
