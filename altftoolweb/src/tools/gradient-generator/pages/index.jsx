"use client";

import React, { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import Description from "../component/Description";
import Header from "../component/Header";
import GradientControls from "../component/GradientControls";
import GradientPreview from "../component/GradientPreview";
import GradientAnimation from "../component/GradientAnimation";
import GradientMultiColor from "../component/GradientMultiColor";
import GradientAIPresets from "../component/GradientAIPresets";
import GradientUIPreview from "../component/GradientUIPreview";
import GradientTextGenerator from "../component/GradientTextGenerator";
import GradientRandomizer from "../component/GradientRandomizer";

export default function ToolHome() {
  const getParams = () => {
    const params = new URLSearchParams(window.location.search);
    return {
      c1: params.get("c1") ? `#${params.get("c1")}` : "#6366f1",
      c2: params.get("c2") ? `#${params.get("c2")}` : "#0ea5e9",
      angle: params.get("angle") ? parseInt(params.get("angle")) : 120,
    };
  };

  const p = getParams();
  const [color1, setColor1] = useState(p.c1);
  const [color2, setColor2] = useState(p.c2);
  const [angle, setAngle] = useState(p.angle);


  const [gradient, setGradient] = useState(
    `linear-gradient(120deg, #6366f1, #0ea5e9)`,
  );

  const copyCSS = () => {
    navigator.clipboard.writeText(`${gradient};`);
    toast.success("CSS Copied!", {
      description: "Gradient CSS has been copied to your clipboard.",
    });
  };


  return (
    <div className="space-y-8 bg-(--background) text-(--foreground)">
      <Toaster />
      <Header />

      {/* Main Generator */}
      <div className="sm:m-8 grid lg:grid-cols-2 gap-8">
        <GradientControls
          color1={color1}
          setColor1={setColor1}
          color2={color2}
          setColor2={setColor2}
          angle={angle}
          setAngle={setAngle}
          gradient={gradient}
          onCopy={copyCSS}
          onGradientChange={setGradient}
        />
        <GradientPreview
          gradient={gradient}
          color1={color1}
          color2={color2}
          setColor1={setColor1}
          setColor2={setColor2}
        />
      </div>

      {/* ✨ Animated Gradient */}
      <GradientAnimation color1={color1} color2={color2} />

      <GradientMultiColor angle={angle} />
      <GradientAIPresets
        onApply={(colors) => {
          setColor1(colors[0]);
          setColor2(colors[colors.length - 1]);
        }}
      />

      <GradientUIPreview color1={color1} color2={color2} angle={angle} />

      <GradientTextGenerator color1={color1} color2={color2} angle={angle} />

      <GradientRandomizer
        color1={color1}
        color2={color2}
        angle={angle}
        setColor1={setColor1}
        setColor2={setColor2}
        setAngle={setAngle}
      />

      <Description />
    </div>
  );
}
