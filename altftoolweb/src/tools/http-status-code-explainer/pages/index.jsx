"use client";

import React, { useMemo, useState } from "react";
import SearchBar from "../components/SearchBar";
import CodeGrid from "../components/CodeGrid";
import ExplanationPanel from "../components/ExplanationPanel";
import codes from "../data/statusCode.json";
import Header from "../components/Header";


import Description from "../components/Description";

export default function HttpStatus() {
  const [selectedCode, setSelectedCode] = useState(200);
  const info = useMemo(() => {
    const num = Number(selectedCode);
    const data = codes[num];

    if (data) {
      return { ...data, code: num };
    }

    return {
      code: num,
      short: "Unknown Status Code",
      detail: "No detailed explanation available.",
      category: "Unknown",
    };
  }, [selectedCode]);

  function getCategory(code) {
    if (code >= 100 && code < 200) return "1xx Informational";
    if (code >= 200 && code < 300) return "2xx Success";
    if (code >= 300 && code < 400) return "3xx Redirection";
    if (code >= 400 && code < 500) return "4xx Client Error";
    if (code >= 500 && code < 600) return "5xx Server Error";
    return "Unknown";
  }

  return (
    <div className="max-w-8xl mx-auto px-4 py-4 bg-(--background) text-(--foreground)">
      <Header />
      <div className="grid md:grid-cols-2 gap-6 mt-6">
        <div>
          <SearchBar onSelect={(c) => setSelectedCode(c)} />
          <CodeGrid onPick={(c) => setSelectedCode(c)} />
        </div>

        <ExplanationPanel info={info} />
      </div>

      {/* ✅ Render Description component (6 cards) */}
      <div className="max-w-8xl mx-auto px-4 py-6">
        <Description />
      </div>

      
    </div>
  );
}
