"use client";

import DiffChecker from "../components/DiffChecker";
import Description from "../components/Description";
import DiffHeader from "../components/DiffHeader";
import FileComparison from "../components/FileComparison";
import { useState } from "react";

export default function ToolHome() {
  const [fileOpener, setFileOpener] = useState(false); 

  return (
    <div className="min-h-screen">
      <DiffHeader />

      {/* <div className="p-4 flex items-center justify-center">
        <button
          onClick={() => setFileOpener((prev) => !prev)}
          className="px-4 py-2 bg-(--primary) text-white rounded-lg text-sm cursor-pointer"
        >
          {fileOpener ? "Switch to Text Difference mode" : "Switch to Two Files Comparison"}
        </button>
      </div> */}

      <DiffChecker />

      {/* {fileOpener ? (
        <div className="px-4">
          <FileComparison />
        </div>
      ) : (
        <div className="px-4">
          <DiffChecker />
        </div>
      )} */}

      <Description />
    </div>
  );
}