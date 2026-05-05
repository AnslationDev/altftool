import { useRef, useState } from "react";
import {
  FileText,
  Eye,
  Code,
  AlertTriangle,
  ChevronRight,
  GitCompare,
  GitBranch,
} from "lucide-react";

export default function TabBar({ activeTab, setActiveTab, swaggerSpec }) {
  const scrollRef = useRef(null);
  const [showArrow, setShowArrow] = useState(true);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
    setShowArrow(!atEnd);
  };

  const tabs = [
    {
      id: "input",
      label: "Input JSON",
      icon: <FileText size={15} />,
      always: true,
    },
    {
      id: "preview",
      label: "Preview Docs",
      icon: <Eye size={15} />,
      always: false,
    },
    {
      id: "snippets",
      label: "Code Snippets",
      icon: <Code size={15} />,
      always: false,
    },
    {
      id: "errors",
      label: "Error Generator",
      icon: <AlertTriangle size={15} />,
      always: true,
    },
    {
      id: "compare",
      label: "Version Compare",
      icon: <GitCompare size={15} />,
      always: true,
    },
    {
      id: "flow",
      label: "Visual Flow",
      icon: <GitBranch size={15} />,
      always: false,
    },
  ];

  return (
    <div className="border-b border-[var(--border)] bg-[var(--muted)] w-full">
      {/* Mobile — 2 tabs visible, scrollable, arrow indicator */}
      <div className="flex sm:hidden relative">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex w-full"
          style={{
            overflowX: "auto",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {tabs.map(({ id, label, icon, always }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              disabled={!always && !swaggerSpec}
              style={{ minWidth: "50%", flexShrink: 0 }}
              className={`py-3 px-3 font-semibold transition-all cursor-pointer whitespace-nowrap text-xs
                ${
                  activeTab === id
                    ? "bg-[var(--background)] text-[var(--primary)] border-b-2 border-[var(--primary)]"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--card)] disabled:opacity-40 disabled:cursor-not-allowed"
                }`}
            >
              <span className="flex items-center justify-center gap-1.5">
                {icon}
                {label}
              </span>
            </button>
          ))}
        </div>

        {/* Arrow  */}
        {showArrow && (
          <div
            className="absolute right-0 top-0 h-full flex items-center pointer-events-none"
            style={{
              width: "36px",
              background:
                "linear-gradient(to right, transparent, var(--muted))",
            }}
          >
            <ChevronRight
              size={16}
              className="text-[var(--muted-foreground)] ml-auto mr-1"
            />
          </div>
        )}
      </div>

      {/* Desktop — sab ek saath, no scroll */}
      <div className="hidden sm:flex w-full">
        {tabs.map(({ id, label, icon, always }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            disabled={!always && !swaggerSpec}
            className={`flex-1 py-4 px-3 font-semibold transition-all cursor-pointer whitespace-nowrap text-sm
              ${
                activeTab === id
                  ? "bg-[var(--background)] text-[var(--primary)] border-b-2 border-[var(--primary)]"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--card)] disabled:opacity-40 disabled:cursor-not-allowed"
              }`}
          >
            <span className="flex items-center justify-center gap-2">
              {icon}
              {label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
