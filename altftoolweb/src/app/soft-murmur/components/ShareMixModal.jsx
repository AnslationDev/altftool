"use client";

import React, { useState, useEffect } from "react";
import * as Icons from "lucide-react";

export default function ShareMixModal({
  isOpen,
  onClose,
  soundsState,
  masterVolume,
  flowMode,
  flowIntensity,
}) {
  const [shareUrl, setShareUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Build share parameter string
      const activeParams = Object.entries(soundsState)
        .filter(([_, data]) => data.active)
        .map(([id, data]) => `${id}:${data.volume}`)
        .join(",");

      if (activeParams) {
        const base = window.location.origin + window.location.pathname;
        const url = `${base}?mix=${encodeURIComponent(activeParams)}&mv=${masterVolume}&fm=${flowMode}&fi=${flowIntensity}`;
        setShareUrl(url);
      } else {
        setShareUrl(window.location.origin + window.location.pathname);
      }
    }
  }, [isOpen, soundsState, masterVolume, flowMode, flowIntensity]);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content relative bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 mx-4 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label="Close modal"
        >
          <Icons.X size={18} />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center">
            <Icons.Share2 size={20} />
          </div>
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-slate-50">
            Share Ambient Mix
          </h2>
        </div>

        <div className="flex flex-col gap-4">
          <p className="text-xs text-slate-700 dark:text-slate-300 font-semibold leading-relaxed">
            Copy the link below to share your current selection of ambient nature sounds and volumes with your friends or colleagues.
          </p>

          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              onClick={(e) => e.target.select()}
              className="flex-grow px-3 py-2 border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 rounded-xl text-xs outline-none text-slate-800 dark:text-slate-200 font-mono select-all"
              aria-label="Share URL link"
            />
            <button
              onClick={handleCopy}
              className={`px-4 py-2 rounded-xl text-xs font-bold text-white transition-colors flex items-center gap-1.5 ${
                copied ? "bg-emerald-500 hover:bg-emerald-600" : "bg-sky-500 hover:bg-sky-600"
              }`}
            >
              {copied ? <Icons.Check size={14} /> : <Icons.Copy size={14} />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>

          <div className="flex justify-end gap-2 mt-2">
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
