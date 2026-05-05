"use client";

import { useState } from "react";
import { Copy, Check, ChevronDown, ChevronUp } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function SectionRenderer({ content }) {
  const [collapsed, setCollapsed] = useState({});
  const [copiedIndex, setCopiedIndex] = useState(null);

  
  const sections = content
    .split(/(?=\n## |\n# )/)
    .filter((sec) => sec.trim() !== "");

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text.trim());
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  return (
    <div className="space-y-4">
      {sections.map((sec, index) => {
        const isCollapsed = collapsed[index];

        const lines = sec.trim().split("\n");
        const title = lines[0];
        const body = lines.slice(1).join("\n");

        return (
          <div
            key={index}
            className="border border-(--border) rounded-xl bg-(--card)"
          >
            {/* HEADER */}
            <div className="flex items-center justify-between px-4 py-3">
              <h3 className="font-semibold text-(--foreground) text-base">
                {title.replace(/^##?\s/, "")}
              </h3>

              <div className="flex items-center gap-2">
                {/* COPY */}
                <button
                  onClick={() => handleCopy(sec, index)}
                  className="p-1.5 rounded-md hover:bg-(--muted)"
                >
                  {copiedIndex === index ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4 text-(--primary)" />
                  )}
                </button>

                {/* TOGGLE */}
                <button
                  onClick={() =>
                    setCollapsed((prev) => ({
                      ...prev,
                      [index]: !prev[index],
                    }))
                  }
                  className="p-1.5 rounded-md hover:bg-(--muted)"
                >
                  {isCollapsed ? (
                    <ChevronDown className="w-4 h-4 text-(--primary)" />
                  ) : (
                    <ChevronUp className="w-4 h-4 text-(--primary)" />
                  )}
                </button>
              </div>
            </div>

            {/* CONTENT */}
            {!isCollapsed && (
              <div className="px-4 pb-4 text-sm text-(--foreground)">
                <div
                  className="prose prose-sm max-w-none 
    prose-headings:text-(--foreground)
    prose-p:text-(--foreground)
    prose-li:text-(--foreground)
    prose-strong:text-(--foreground)
    prose-code:text-(--primary)
    prose-pre:bg-(--muted)
  "
                >
                  <ReactMarkdown>{body}</ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
