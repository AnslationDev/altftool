"use client";

import React, { useState } from "react";
import Link from "next/link";

function cleanSVG(svg) {
  return svg
    .replace(/<\?xml.*?\?>/g, "")
    .replace(/<!DOCTYPE.*?>/g, "")
    .replace(/<!--.*?-->/g, "")
    .replace(/\s(width|height)=".*?"/g, "")
    .replace(/\s(class|data-name)=".*?"/g, "")
    .replace(/\s(fill|stroke)="(?!none).*?"/g, "")
    .replace("<svg", '<svg stroke="currentColor" fill="none"')
    .replace(/\n/g, "")
    .trim();
}

function SvgIconField({ label, value, onChange }) {
  const [input, setInput] = useState("");

  const handleApply = () => {
    if (!input.includes("<svg")) {
      return alert("Please paste valid SVG");
    }

    const cleaned = cleanSVG(input);
    onChange(cleaned);
    setInput("");
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between" >
        <div> <label className="font-medium">{label}</label></div>
        <div>
          <Link href={"https://lucide.dev/icons/"} className="text-blue-500" >Icon Picker</Link>
        </div>
      </div>
     

      <textarea
        value={input}
        required
        onChange={(e) => setInput(e.target.value)}
        placeholder="Paste SVG code here..."
        className="w-full border p-2 rounded h-28"
      />

      <button
        type="button"
        onClick={handleApply}
        className="bg-black text-white px-4 py-2 rounded"
      >
        Apply Icon
      </button>

      {/*  PREVIEW */}
      {value && (
        <div
          className="mt-3 w-10 h-10"
          dangerouslySetInnerHTML={{ __html: value }}
        />
      )}
    </div>
  );
}

export default SvgIconField;