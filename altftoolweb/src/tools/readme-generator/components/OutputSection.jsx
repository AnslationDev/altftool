import {
  Copy,
  Check,
  Download,
  Eye,
  EyeOff,
  Palette,
  ChevronDown,
  ChevronUp,
  GripVertical,
  LayoutGrid,
  Upload,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useState } from "react";
import DragSections from "./DragSections";
import BadgeGenerator from "./BadgeGenerator";
import SectionRenderer from "./SectionRenderer";
import ReadStats from "./ReadStats";
import ManagedImage from "@/components/ui/ManagedImage";

export default function OutputSection({
  generatedReadme,
  setGeneratedReadme,
  copyToClipboard,
  downloadReadme,
  copied,
  isPreviewMode,
  setIsPreviewMode,
  userInput,
  selectedTheme,
  setSelectedTheme,
  sectionsOrder,
  setSectionsOrder,
  reorderedReadme,
  setReorderedReadme,
  isSectionMode,
  setIsSectionMode,
}) {
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [showReorder, setShowReorder] = useState(false);
  const finalContent = reorderedReadme || generatedReadme;
  const [showExportMenu, setShowExportMenu] = useState(false);

  const themeStyles = {
    github: {
      backgroundColor: "#0d1117",
      color: "#c9d1d9",
    },
    minimal: {
      backgroundColor: "#ffffff",
      color: "#111827",
    },
    gradient: {
      background: "linear-gradient(135deg, #1e3a8a, #9333ea)",
      color: "#ffffff",
    },
    hacker: {
      backgroundColor: "#000000",
      color: "#00ff9f",
      fontFamily: "monospace",
    },
  };

  //   badges handler

  const handleAddBadges = (badges) => {
    if (!generatedReadme) return;

    const parts = generatedReadme.split("\n\n");
    const title = parts[0];
    const rest = parts.slice(1).join("\n\n");

    const updated = `${title}\n\n${badges}\n\n${rest}`;
    setGeneratedReadme(updated);
    setReorderedReadme(updated);

    setSectionsOrder([]);
  };

  return (
    <div className="bg-(--card) border border-(--border) rounded-2xl shadow-xl p-6 sm:p-8">
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold">Generated README</h2>
        <div className="text-xs text-(--muted-foreground) mt-1 flex items-center gap-2">
          {/* shortcut 2 */}
          <span>📋</span>
          <span> Select text + Ctrl C to copy (Preview mode)</span>
        </div>

        <div className="flex  items-center gap-2 relative  flex-nowrap overflow-x-auto sm:overflow-visible sm:justify-end sm:mr-3">
          
          <button
            onClick={() => setShowThemeMenu(!showThemeMenu)}
            className="p-2 sm:p-2.5 rounded-lg hover:bg-(--muted) cursor-pointer flex items-center justify-center text-(--primary)"
          >
            <Palette />
          </button>

          {/* DROPDOWN */}
          {showThemeMenu && (
            <div className="absolute right-0 top-12 bg-(--card) border border-(--border) rounded-lg shadow-lg w-44 z-50">
              {[
                { label: "GitHub Dark", value: "github" },
                { label: "Minimal Clean", value: "minimal" },
                { label: "Gradient Dev", value: "gradient" },
                { label: "Hacker", value: "hacker" },
              ].map((theme) => (
                <button
                  key={theme.value}
                  onClick={() => {
                    setSelectedTheme(theme.value);
                    setShowThemeMenu(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-(--muted) ${
                    selectedTheme === theme.value ? "text-(--primary)" : ""
                  }`}
                >
                  {theme.label}
                </button>
              ))}
            </div>
          )}
          {/*  TOGGLE preview */}
          <button
            onClick={() => setIsPreviewMode(!isPreviewMode)}
            className={`p-2 sm:p-2.5 rounded-lg cursor-pointer hover:bg-(--muted) flex items-center justify-center ${
              isPreviewMode ? "text-(--primary)" : ""
            }`}
          >
            {isPreviewMode ? <EyeOff /> : <Eye />}
          </button>

          {/* section mode toggle  */}
          <button
            onClick={() => {
              setIsSectionMode(!isSectionMode);
              setIsPreviewMode(false);
            }}
            className={`p-2 sm:p-2.5 rounded-lg cursor-pointer hover:bg-(--muted) flex items-center justify-center ${
              isSectionMode ? "text-(--primary)" : ""
            }`}
          >
            <LayoutGrid className="w-5 h-5 text-purple-500" />
          </button>

          {/*  EXPORT DROPDOWN */}
          <div className="relative group">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="p-2 sm:p-2.5 rounded-lg hover:bg-(--muted) cursor-pointer flex items-center justify-center"
            >
              <Upload className="w-5 h-5 text-green-500" />
            </button>

            {/* Tooltip */}
            <span
              className="
      absolute left-1/2 -translate-x-1/2
      top-full mt-2
      bg-black text-white
      text-xs px-2 py-1 rounded-md
      opacity-0 group-hover:opacity-100
      transition-all duration-200
      whitespace-nowrap
      pointer-events-none
      z-[999]
    "
            >
              Export
            </span>

            {/* Dropdown */}
            {showExportMenu && generatedReadme && (
              <div className="absolute right-0 top-12 bg-(--card) border border-(--border) rounded-lg shadow-lg w-48 z-50 overflow-hidden">
                {/* Copy */}
                <button
                  onClick={() => {
                    copyToClipboard();
                    setTimeout(() => {
                      setShowExportMenu(false);
                    }, 1200);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-(--muted)"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4 text-blue-500" />
                  )}

                  <span>{copied ? "Copied!" : "Copy"}</span>
                </button>

                {/* Download */}
                <button
                  onClick={() => {
                    downloadReadme();
                    setShowExportMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-(--muted)"
                >
                  <Download className="w-4 h-4 text-green-500" />
                  Download .md
                </button>
              </div>
            )}
          </div>

          {/* button ReorderSections */}
          <div className="relative group">
            <button
              onClick={() => setShowReorder(!showReorder)}
              className={`p-2 sm:p-2.5 rounded-lg hover:bg-(--muted) cursor-pointer  ${
                showReorder ? "text-(--primary)" : ""
              }`}
            >
              <GripVertical className="w-5 h-5 text-purple-500" />
            </button>

            {/* Tooltip */}
            <span
              className="
      absolute left-1/2 -translate-x-1/2
      top-full mt-2
      bg-black text-white
      text-xs px-2 py-1 rounded-md
      opacity-0 group-hover:opacity-100
      transition-all duration-200
      whitespace-nowrap
      pointer-events-none
      z-[999]
      shadow-lg
    "
            >
              {" "}
              Reorder Sections
            </span>
          </div>
          {/*  REORDER DROPDOWN */}
          {showReorder && sectionsOrder.length > 0 && (
            <div className="absolute right-4 top-16 bg-(--card) border border-(--border) rounded-lg shadow-lg w-56 z-50 p-3 flex items-center justify-center ">
              <DragSections
                sectionsOrder={sectionsOrder}
                setSectionsOrder={setSectionsOrder}
              />
            </div>
          )}
        </div>
      </div>
<ReadStats content={finalContent} />
      <BadgeGenerator onAddBadges={handleAddBadges} />
      
       <div
        className="border border-(--border) rounded-lg p-4 h-96 overflow-y-auto no-scrollbar transition-all mt-4"
        style={themeStyles[selectedTheme]}
      >
        {isSectionMode ? (
          // Section Mode
          finalContent ? (
            <SectionRenderer content={finalContent} />
          ) : (
            <p className="text-(--muted-foreground) text-center mt-24">
              Nothing to show
            </p>
          )
        ) : isPreviewMode ? (
          //  Preview Mode
          finalContent ? (
            <div className="prose prose-invert max-w-none text-(--foreground)">
              <ReactMarkdown
  components={{
    img: ({ node, ...props }) => {
      if (!props.src || props.src.trim() === "") return null;

      return (
        <ManagedImage
          {...props}
          style={{
            maxWidth: "100%",
            borderRadius: "8px",
            marginTop: "8px",
          }}
        />
      );
    },
  }}
>
  {finalContent}
</ReactMarkdown>
            </div>
          ) : (
            <p className="text-(--muted-foreground) text-center mt-24">
              Nothing to preview
            </p>
          )
        ) : //  Raw Mode
        finalContent ? (
          <pre className="whitespace-pre-wrap text-sm font-mono">
            {finalContent}
          </pre>
        ) : (
          <p className="text-(--muted-foreground) text-center mt-24">
            No README generated yet
          </p>
        )}
      </div>
    </div>
  );
}
