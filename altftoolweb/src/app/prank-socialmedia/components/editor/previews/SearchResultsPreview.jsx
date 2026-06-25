"use client";
import { Search, Mic, Camera, Settings, Grid, ArrowRight } from "lucide-react";
import { useEditor } from "../../../lib/editor-store";

function SearchResultsPreview() {
  const { searchQuery, searchResults, theme } = useEditor();
  const dark = theme !== "light";
  const bg = theme === "amoled" ? "#000" : dark ? "#202124" : "#fff";
  const fg = dark ? "#e8eaed" : "#202124";
  const border = dark ? "#3c4043" : "#ebebeb";
  const titleColor = dark ? "#8ab4f8" : "#1a0dab";
  const urlColor = dark ? "#bdc1c6" : "#202124";
  const snippetColor = dark ? "#bdc1c6" : "#4d5156";
  const inputBg = dark ? "#303134" : "#fff";
  const inputBorder = dark ? "transparent" : "#dfe1e5";

  return (
    <div
      className="rounded-xl overflow-hidden shadow-soft text-left p-6 font-sans"
      style={{ background: bg, color: fg, width: 640, border: `1px solid ${border}` }}
    >
      {/* Google Header */}
      <div className="flex flex-wrap items-center gap-4 pb-4 border-b" style={{ borderColor: border }}>
        <span className="text-xl font-bold tracking-tight">
          <span className="text-[#4285F4]">G</span>
          <span className="text-[#EA4335]">o</span>
          <span className="text-[#FBBC05]">o</span>
          <span className="text-[#4285F4]">g</span>
          <span className="text-[#34A853]">l</span>
          <span className="text-[#EA4335]">e</span>
        </span>

        {/* Fake Search Input */}
        <div
          className="flex flex-1 items-center gap-3 rounded-full border px-4 py-2 text-sm shadow-sm"
          style={{ background: inputBg, borderColor: inputBorder }}
        >
          <Search className="h-4 w-4 text-neutral-400 shrink-0" />
          <span className="truncate flex-1 font-medium">{searchQuery || "Search something..."}</span>
          <Mic className="h-4 w-4 text-[#4285f4] shrink-0" />
          <Camera className="h-4 w-4 text-[#4285f4] shrink-0" />
        </div>

        {/* Icons */}
        <div className="flex items-center gap-3 text-neutral-400">
          <Settings className="h-4 w-4 cursor-pointer hover:text-neutral-500" />
          <Grid className="h-4 w-4 cursor-pointer hover:text-neutral-500" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 py-3 text-xs font-medium border-b" style={{ borderColor: border, color: snippetColor }}>
        <span className="text-[#4285F4] border-b-2 pb-3 border-[#4285F4] font-semibold cursor-pointer">All</span>
        <span className="cursor-pointer hover:opacity-80">Images</span>
        <span className="cursor-pointer hover:opacity-80">Videos</span>
        <span className="cursor-pointer hover:opacity-80">News</span>
        <span className="cursor-pointer hover:opacity-80">Maps</span>
      </div>

      {/* Results Container */}
      <div className="mt-5 space-y-6">
        <p className="text-[13px]" style={{ color: snippetColor }}>About 1,820,000 results (0.42 seconds)</p>

        {/* Ad Mock (optional, looks very cool) */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="font-bold text-neutral-800 dark:text-neutral-200">Sponsored</span>
            <span style={{ color: snippetColor }}>·</span>
            <span style={{ color: urlColor }} className="hover:underline cursor-pointer">https://www.mockly-generator.com</span>
          </div>
          <h3 className="text-lg font-medium hover:underline cursor-pointer" style={{ color: titleColor }}>
            Mockly — Unlimited Fake Mockups & Screen Generators
          </h3>
          <p className="text-[13px] leading-relaxed" style={{ color: snippetColor }}>
            Create ultra-realistic fake search results, chats, DMs, posts, and popups. High resolution PNG exports are free and instant.
          </p>
        </div>

        {/* Real Results from Store */}
        {searchResults.map((result) => (
          <div key={result.id} className="space-y-1">
            <div className="text-xs truncate" style={{ color: urlColor }}>
              {result.url}
            </div>
            <h3 className="text-lg font-medium hover:underline cursor-pointer leading-tight" style={{ color: titleColor }}>
              {result.title}
            </h3>
            <p className="text-[13px] leading-relaxed" style={{ color: snippetColor }}>
              {result.snippet}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export { SearchResultsPreview };
