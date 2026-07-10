"use client";

import React from "react";
import AboutTab from "../editor/components/AboutTab";
import AlphobiaModuleLayout from "../../components/AlphobiaModuleLayout";

export default function AboutPage() {
  return (
    <AlphobiaModuleLayout
      title="About Page Configuration"
      subtitle="Edit core mission badges, values grids, timeline milestones, leadership lists, and client validation testimonials."
    >
      <AboutTab />
    </AlphobiaModuleLayout>
  );
}
