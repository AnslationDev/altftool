"use client";

import ShowcaseSplitSection from "./ShowcaseSplitSection";
import { SHOWCASE_THEMES } from "./AnimatedShowcase";

export default function EssentialDesignToolsSection({ tools }) {
  return (
    <ShowcaseSplitSection
      title="Essential Design Platforms"
      subtitle="The core toolkit behind most professional design workflows."
      tools={tools}
      showcaseSide="left"
      theme={SHOWCASE_THEMES.violet}
      layout="a"
      showcaseLabel="untitled-project.design"
    />
  );
}
