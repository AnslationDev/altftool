"use client";

import DiffChecker from "../components/DiffChecker";
import Description from "../components/Description";
import DiffHeader from "../components/DiffHeader";

export default function ToolHome() {
  return (
    <div className="min-h-screen">
      <DiffHeader />

      <DiffChecker />

      <Description />
    </div>
  );
}