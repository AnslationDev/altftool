"use client"

import React from "react";

const ResultView = ({ value, error, encodingType = "text" }) => {
  
  
  const handleCopy = async () => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      alert("Result copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy");
    }
  };

 
  const handleShare = () => {
    if (!value?.trim()) return;
    try {
      const baseUrl = window.location.origin + window.location.pathname;
      const params = new URLSearchParams();
      params.set('data', btoa(unescape(encodeURIComponent(value)))); 
      params.set('type', encodingType);
      const shareableUrl = `${baseUrl}?${params.toString()}`;
      navigator.clipboard.writeText(shareableUrl);
      alert("Shareable link for result copied!");
    } catch (err) {
      console.error("Sharing failed");
    }
  };

  
  const handleDownload = () => {
    if (!value?.trim()) return;
    const blob = new Blob([value], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `result-data.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full -ml-[2px]">
      <div className="text-2xl font-semibold text-(--foreground) -ml-[-9px] mb-[-70]">Result</div>

      {/* SVG Down Arrow */}
      <div className="flex justify-center mb-[20]">
        <svg 
          width="60" 
          height="60" 
          viewBox="0 0 30 10" 
          fill="none" 
          className="text-(--primary) drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]"
        >
          <path 
            d="M12 5V19M12 19L19 12M12 19L5 12" 
            stroke="currentColor" 
            strokeWidth="3" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Container matching InputArea style */}
      <div className="w-full relative text-(--foreground) border border-(--border) rounded-2xl p-1.5 -ml-[2px] overflow-hidden bg-(--card)">
        <textarea
          readOnly
          value={value}
          placeholder="Result will appear here..."
          className={`relative z-10 w-full min-h-60 p-4 pb-20 bg-transparent text-2xl text-(--foreground) focus:outline-none resize-none transition-all ${
            error ? "placeholder:text-red-400" : "placeholder:text-gray-500/50"
          }`}
        />

        {/* Buttons Layer - Functional & Styled */}
        <div className="absolute left-3 bottom-3 flex flex-row items-center gap-2 z-20">
          
          {/* Copy Button */}
          <button
            type="button"
            onClick={handleCopy}
            title="Copy Result"
            className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-(--primary) hover:bg-blue-600 hover:text-white transition-all cursor-pointer transform active:scale-90"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
          </button>

          {/* Download Button */}
          <button
            type="button"
            onClick={handleDownload}
            title="Download Result"
            className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-(--primary) hover:bg-blue-600 hover:text-white transition-all cursor-pointer transform active:scale-90"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
          </button>

          {/* Share Button */}
          <button
            type="button"
            onClick={handleShare}
            title="Share Result"
            className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-(--primary) hover:bg-blue-600 hover:text-white transition-all cursor-pointer transform active:scale-90"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
            </svg>
          </button>

        </div>
      </div>

      <div className="mt-2 text-[10px] text-right text-(--foreground) opacity-40 uppercase tracking-widest font-bold">
        {error ? (
          <span className="text-red-400">Invalid Input</span>
        ) : (
          `${value.length} characters`
        )}
      </div>
    </div>
  );
};

export default ResultView;