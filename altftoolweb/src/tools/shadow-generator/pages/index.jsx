"use-client";
import React, { useState } from "react";
import LandingPage from "../components/LandingPage";
import Generator from "../components/CssGenerator";
import Features from "../components/Features";

export default function ShadowApp() {
  const [view, setView] = useState("landing");

  return (
    <div className="flex flex-col min-h-screen bg-(--background) text-(--foreground)">
      {view === "landing" ? (
        <LandingPage onStart={() => setView("generator")} />
      ) : (
        <Generator onStart={() => setView("landing")} />
      )}
      <Features/>
    </div>
  );
}
