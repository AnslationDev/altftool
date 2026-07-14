"use client";

import React from "react";
import { Button } from "@altftool/ui";
import { Copy, Download, Heart, RefreshCw, Share2, ChevronLeft, ChevronRight } from "lucide-react";

export default function Toolbar({
  onGenerate,
  onPrevious,
  onNext,
  canGoPrevious,
  canGoNext,
  onCopy,
  onDownload,
  onShare,
  onToggleFavorite,
  isFavorite,
  isDownloading
}) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3 w-full max-w-3xl mx-auto p-4 bg-card border border-border rounded-xl shadow-sm mt-6">
      <div className="flex items-center gap-2">
        <Button 
          variant="secondary" 
          onClick={onPrevious} 
          disabled={!canGoPrevious}
          title="Previous Quote"
        >
          <ChevronLeft size={18} />
        </Button>
        
        <Button 
          variant="primary" 
          onClick={onGenerate}
          className="min-w-[140px] gap-2"
        >
          <RefreshCw size={18} /> Generate
        </Button>
        
        <Button 
          variant="secondary" 
          onClick={onNext} 
          disabled={!canGoNext}
          title="Next Quote"
        >
          <ChevronRight size={18} />
        </Button>
      </div>

      <div className="w-px h-8 bg-border hidden sm:block mx-2" />

      <div className="flex items-center gap-2">
        <Button 
          variant="secondary" 
          onClick={onToggleFavorite}
          className={isFavorite ? "text-rose-500 hover:text-rose-600 hover:bg-rose-50" : ""}
          title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
        >
          <Heart size={18} className={isFavorite ? "fill-current" : ""} />
        </Button>
        
        <Button variant="secondary" onClick={onCopy} title="Copy Quote">
          <Copy size={18} />
        </Button>
        
        <Button variant="secondary" onClick={onShare} title="Share Quote">
          <Share2 size={18} />
        </Button>
        
        <Button variant="secondary" onClick={onDownload} disabled={isDownloading} title="Download as Image">
          {isDownloading ? <RefreshCw size={18} className="animate-spin" /> : <Download size={18} />}
        </Button>
      </div>
    </div>
  );
}
