"use client";

import ShowcaseSplitSection from "./ShowcaseSplitSection";

export default function FeaturedDesignToolsSection({ tools }) {
  return (
    <ShowcaseSplitSection
      title="Featured Design Tools"
      subtitle="Hand-picked platforms design teams reach for first."
      tools={tools}
      showShowcase={false}
    />
  );
}
