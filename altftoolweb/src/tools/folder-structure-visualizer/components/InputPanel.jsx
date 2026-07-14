"use client";

import { useRef, useState } from "react";
import { Upload, ClipboardPaste, Sparkles, FileUp } from "lucide-react";
import { SAMPLE_STRUCTURE } from "../utils/sample";

export default function InputPanel({ onUpload, onLoadText, onLoadSample, loading }) {
  const [text, setText] = useState("");
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files || []);
    if (onUpload) onUpload(files);
    event.target.value = "";
  };

  const handlePaste = () => {
    if (onLoadText) onLoadText(text);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-(--muted-foreground)">
          <FileUp className="h-4 w-4" />
          Option 1 — Upload a folder
        </h2>
        <input
          ref={fileInputRef}
          type="file"
          webkitdirectory=""
          directory=""
          multiple=""
          onChange={handleFileChange}
          className="block w-full cursor-pointer rounded-xl border border-(--border) bg-(--card) px-4 py-3 text-sm text-(--foreground) shadow-sm file:mr-3 file:rounded-lg file:border-0 file:bg-(--primary) file:px-3 file:py-2 file:text-(--primary-foreground) file:cursor-pointer focus:outline-none focus:ring-2 focus:ring-(--primary)"
        />
        <p className="mt-2 text-xs text-(--muted-foreground)">
          Pick any folder. Files are read locally in your browser — nothing is uploaded.
        </p>
      </div>

      <div>
        <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-(--muted-foreground)">
          <ClipboardPaste className="h-4 w-4" />
          Option 2 — Paste a structure
        </h2>
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder={"Paste an ASCII tree, an indented list, or JSON…"}
          className="h-44 w-full resize-y rounded-xl border border-(--border) bg-(--card) px-4 py-3 font-mono text-sm text-(--foreground) shadow-sm outline-none focus:border-(--primary) focus:ring-2 focus:ring-(--primary)"
        />
        <div className="mt-2 flex flex-wrap gap-2">
          <button type="button" onClick={handlePaste} disabled={loading} className="btn-primary rounded-xl px-4 py-2 text-sm font-semibold disabled:opacity-60">
            {loading ? "Parsing…" : "Load structure"}
          </button>
          <button
            type="button"
            onClick={() => {
              setText(SAMPLE_STRUCTURE);
              if (onLoadText) onLoadText(SAMPLE_STRUCTURE);
            }}
            className="btn-secondary rounded-xl px-4 py-2 text-sm font-semibold"
          >
            <Sparkles className="mr-1 inline h-4 w-4" />
            Load sample
          </button>
        </div>
        <p className="mt-2 text-xs text-(--muted-foreground)">
          Supported: box-drawing trees (│ ├ └ ─), plain indented lists, or JSON.
        </p>
      </div>
    </div>
  );
}
