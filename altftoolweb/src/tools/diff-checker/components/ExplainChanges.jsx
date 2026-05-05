"use client";

import React, {useState, useMemo } from "react";
import {BrainCircuit } from "lucide-react";

const ExplainChanges = ({ diff }) => {
    const [isOpen, setIsOpen] = useState(false);

    const explanations = useMemo(() => {
  if (!diff || diff.length === 0) return [];

  const result = [];

  diff.forEach((item, index) => {
    // ADDED
    if (item.type === "added") {
      result.push({
        intent: "Addition",
        message: `Added line: "${item.modified}"`,
      });
    }

    // DELETED
    else if (item.type === "deleted") {
      result.push({
        intent: "Deletion",
        message: `Removed line: "${item.original}"`,
      });
    }

    // EQUAL → subtle changes
    else if (item.type === "equal") {
      const original = item.original;
      const modified = item.modified;

      if (!original || !modified) return;

      // Case change
      if (
        original.toLowerCase() === modified.toLowerCase() &&
        original !== modified
      ) {
        result.push({
          intent: "Case Change",
          message: `"${original}" → "${modified}"`,
        });
      }

      // Formatting (whitespace-like)
      else if (original.trim() === modified.trim() && original !== modified) {
        result.push({
          intent: "Formatting",
          message: `Whitespace/formatting change in "${original}"`,
        });
      }

      // Length change
      else if (original.length !== modified.length) {
        result.push({
          intent: "Minor Edit",
          message: `Modified length by ${Math.abs(
            original.length - modified.length
          )} chars in "${original}"`,
        });
      }
    }

    // LOOKAHEAD: deleted + added → typo or rewrite
    if (
      item.type === "deleted" &&
      diff[index + 1] &&
      diff[index + 1].type === "added"
    ) {
      const oldText = item.original;
      const newText = diff[index + 1].modified;

      if (oldText && newText) {
        const similarity = getSimpleSimilarity(oldText, newText);

        if (similarity > 0.85) {
          result.push({
            intent: "Typo",
            message: `"${oldText}" → "${newText}"`,
          });
        } else {
          result.push({
            intent: "Rewrite",
            message: `"${oldText}" → "${newText}"`,
          });
        }
      }
    }
  });

  return result;
}, [diff]);

//   if (explanations.length === 0) {
//     return (
//       <div className="text-sm text-gray-500 mt-4">
//         No changes to explain.
//       </div>
//     );
//   }

  return (
    <div className="rounded-xl bg-gray-50">
      <button className="px-4 py-2 bg-(--primary) text-white rounded-lg flex items-center gap-2 text-sm cursor-pointer" onClick={() => setIsOpen(true)}>
        <BrainCircuit size={15}/>Explain Changes
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
        >
          {/* Background Overlay */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal Content */}
          <div
            className="relative z-10 w-[90%] max-w-lg bg-(--background)/90 rounded-xl shadow-lg p-5"
            onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
          >
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <BrainCircuit /> Explain Changes
            </h3>

            {explanations.length === 0 ? (
              <p className="text-md text-(--muted-foreground)">
                No changes to explain.
              </p>
            ) : (
              <ul className="space-y-2 text-md text-(--muted-foreground) max-h-[300%] overflow-y-auto">
                {explanations.map((exp, idx) => (
                  <li key={idx} className="flex items-start gap-2"><span className={`px-2 py-0.5 text-xs rounded-md font-medium ${getIntentColor(exp.intent)}`}>
        {exp.intent}
      </span>

      {/* Message */}
      <span>{exp.message}</span></li>
                ))}
              </ul>
            )}
            </div>
        </div>
      )}
    </div>
  );
};

export default ExplainChanges;

/**
 * Simple similarity function (no heavy algo)
 */
function getSimpleSimilarity(a, b) {
  let matches = 0;
  const minLen = Math.min(a.length, b.length);

  for (let i = 0; i < minLen; i++) {
    if (a[i] === b[i]) matches++;
  }

  return matches / Math.max(a.length, b.length);
}

function getIntentColor(intent) {
  switch (intent) {
    case "Typo":
      return "bg-yellow-100 text-yellow-700";
    case "Case Change":
      return "bg-blue-100 text-blue-700";
    case "Formatting":
      return "bg-purple-100 text-purple-700";
    case "Addition":
      return "bg-green-100 text-green-700";
    case "Deletion":
      return "bg-red-100 text-red-700";
    case "Rewrite":
      return "bg-orange-100 text-orange-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}