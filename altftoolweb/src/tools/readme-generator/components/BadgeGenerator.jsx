import { Tag, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

export default function BadgeGenerator({ onAddBadges }) {
  const [license, setLicense] = useState("MIT");
  const [version, setVersion] = useState("v1.0");
  const [status, setStatus] = useState("Active");
  const [open, setOpen] = useState(false); // ✅ NEW (collapse control)

  const badges = [
    { label: "License", value: license, color: "blue" },
    { label: "Version", value: version, color: "green" },
    { label: "Status", value: status, color: "brightgreen" },
  ];

  const badgeMarkdown = badges
    .map(
      (b) =>
        `![${b.label}](https://img.shields.io/badge/${b.label.toLowerCase()}-${b.value}-${b.color})`
    )
    .join("\n");

  return (
    <div className="border border-(--border) rounded-xl bg-(--card) mt-4">
      
      {/* HEADER (Always visible) */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-(--muted) rounded-xl cursor-pointer"
      >
        <div className="flex items-center gap-2 text-(--primary)">
          <Tag className="w-5 h-5 text-pink-500" />
          <span className="font-semibold text-sm sm:text-base">
            Badge Generator
          </span>
        </div>

        {open ? (
          <ChevronUp className="w-4 h-4 text-(--primary)" />
        ) : (
          <ChevronDown className="w-4 h-4 text-(--primary)" />
        )}
      </button>

      {/*  COLLAPSIBLE CONTENT */}
      {open && (
        <div className="px-4 pb-4 border-t border-(--border)">
          
          {/* Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
            <select
              value={license}
              onChange={(e) => setLicense(e.target.value)}
              className="p-2 rounded-lg bg-(--background) border border-(--border) text-sm"
            >
              <option>MIT</option>
              <option>Apache</option>
              <option>GPL</option>
            </select>

            <select
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              className="p-2 rounded-lg bg-(--background) border border-(--border) text-sm"
            >
              <option>v1.0</option>
              <option>v2.0</option>
              <option>v3.0</option>
            </select>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="p-2 rounded-lg bg-(--background) border border-(--border) text-sm"
            >
              <option>Active</option>
              <option>Beta</option>
              <option>Deprecated</option>
            </select>
          </div>

          {/* Preview */}
          <div className="text-xs font-mono bg-(--muted) p-3 rounded-lg mt-3 whitespace-pre-wrap break-words">
            {badgeMarkdown}
          </div>

        
          <button
            onClick={() => onAddBadges(badgeMarkdown)}
            className="w-full bg-(--primary) text-(--primary-foreground) py-2 rounded-lg hover:opacity-90 cursor-pointer mt-3 text-sm sm:text-base"
          >
            Add to README
          </button>
        </div>
      )}
    </div>
  );
}