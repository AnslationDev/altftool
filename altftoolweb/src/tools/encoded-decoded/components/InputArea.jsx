"use client"

import React from "react";

const InputArea = ({ value, onChange, onClear, encodingType = "text" }) => {
  
 
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        
        onChange({ target: { value: text } });
      }
    } catch (err) {
      alert("Clipboard access denied! Please paste manually.");
    }
  };

 
  const handleCopy = async () => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      alert("Copied to clipboard!"); 
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
      alert("Shareable link copied to clipboard!");
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
    a.download = `input-data.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <label className="block text-(--foreground) text-2xl font-semibold mt-[-40]">Input Text</label>

      {/* Container matching your DropdownSelector logic */}
      <div className="relative w-full text-(--foreground) border border-(--border) rounded-2xl p-1.5  overflow-hidden bg-(--card) backdrop-blur-sm">
        
        <textarea
          className="relative z-10 w-full min-h-60 p-4 pb-20 bg-transparent text-2xl  font-light text-(--foreground) focus:outline-none resize-none transition-all placeholder:text-gray-500/50"
          placeholder="Enter or paste text here..."
          value={value}
          onChange={onChange}
        />

        {/* Buttons Layer - Z-index added to ensure clicks work */}
        <div className="absolute left-3 bottom-3 flex flex-row items-center gap-2 z-20">
          
          {/* Paste */}
          <button
            type="button"
            onClick={handlePaste}
            className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-(--primary) hover:bg-blue-600 hover:text-white transition-all cursor-pointer transform active:scale-90"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
              <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
            </svg>
          </button>

          {/* Copy */}
          <button
            type="button"
            onClick={handleCopy}
            className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-(--primary) hover:bg-blue-600 hover:text-white transition-all cursor-pointer transform active:scale-90"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
          </button>

          {/* Download */}
          <button
            type="button"
            onClick={handleDownload}
            className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-(--primary) hover:bg-blue-600 hover:text-white transition-all cursor-pointer transform active:scale-90"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
          </button>

          {/* Share */}
          <button
            type="button"
            onClick={handleShare}
            className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-(--primary) hover:bg-blue-600 hover:text-white transition-all cursor-pointer transform active:scale-90"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
            </svg>
          </button>

          {/* Clear */}
          <button
            type="button"
            onClick={onClear}
            className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-(--primary) hover:bg-blue-600 hover:text-white transition-all cursor-pointer transform active:scale-90"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

        </div>
      </div>

      <div className="text-xs text-(--muted-foreground) text-right opacity-70">
        {value.length} characters
      </div>
    </div>
  );
};

export default InputArea;