import { useState } from "react";
import { Check, Copy } from "lucide-react";
import React from "react";

const JSONOutput = ({ jsonData }) => {
  const [copied, setCopied] = useState(false);

  if (!jsonData) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(jsonData);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  return (
    <div className="mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold text-(--primary)">JSON Output</h3>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md border border-(--border) transition text-(--secondary) hover:bg-(--secondary) hover:text-(--background) cursor-pointer"
        >
          {copied ? (
            <>
              <Check size={15} className="text-green-600" />
              <span className="text-green-600 font-medium">Copied!</span>
            </>
          ) : (
            <>
              <Copy size={15} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* JSON display — responsive, wraps on small screens */}
      <div className="relative border border-(--border) rounded-lg overflow-hidden">
        <pre
          className="
            bg-(--background)
            p-3 sm:p-4
            text-xs sm:text-sm
            text-(--secondary)
            rounded-lg
            max-h-64 sm:max-h-80
            overflow-y-auto
            overflow-x-auto
            whitespace-pre-wrap
            break-all
            word-break-all
            leading-relaxed
          "
          style={{ wordBreak: "break-all", overflowWrap: "anywhere" }}
        >
          {jsonData}
        </pre>
      </div>
    </div>
  );
};

export default JSONOutput;