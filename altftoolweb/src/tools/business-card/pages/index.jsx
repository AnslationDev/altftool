"use client";

import { useState } from "react";
import Generator from "../components/Generator";
import Landing from "../components/Landing";
import Description from "../components/Description"; 

export default function ToolHome() {
  const [showGenerator, setShowGenerator] = useState(false);

  return (
    <div
      style={{ minHeight: "100vh" }}
      className="bg-(--background) text-(--foreground)"
    >
      <main style={{ width: "100%" }}>
        {!showGenerator ? (
          <>
            <Landing setShowGenerator={setShowGenerator} />
            
            {/* 👇 Create Now page ke niche cards */}
            <Description />

          </>
        ) : (
          <Generator />
        )}
      </main>
    </div>
  );
}
