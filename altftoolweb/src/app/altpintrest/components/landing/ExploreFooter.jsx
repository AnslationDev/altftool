"use client";

import React from 'react';

export default function ExploreFooter({ onExplore }) {
  return (
    <footer className="bg-gray-50 dark:bg-zinc-950 border-t border-gray-200 dark:border-zinc-800 py-12 px-4 sm:px-6 lg:px-8 mt-12">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-gray-500 dark:text-gray-400">

        {/* Brand info */}
        <div className="flex items-center gap-3">
          {/* <div className="w-8 h-8 rounded-full bg-[#E60023] flex items-center justify-center text-white font-black text-lg shadow-sm">
            P
          </div> */}
          <span className="font-bold text-gray-900 dark:text-white text-base">AltPinterest Ideas</span>
          <span className="hidden sm:inline">•</span>
          <span className="text-xs">Visual Discovery & Inspiration Board</span>
        </div>

        {/* Quick Links */}
        <div className="flex flex-wrap justify-center gap-6 text-xs font-semibold text-gray-600 dark:text-gray-300">
          <button onClick={() => onExplore('AI Image')} className="hover:text-[#E60023] transition-colors">AI Art</button>
          <button onClick={() => onExplore('Design')} className="hover:text-[#E60023] transition-colors">UI Design</button>
          <button onClick={() => onExplore('Productivity')} className="hover:text-[#E60023] transition-colors">Productivity</button>
          <button onClick={() => onExplore('Development')} className="hover:text-[#E60023] transition-colors">Development</button>
          <button onClick={() => onExplore()} className="hover:text-[#E60023] transition-colors font-bold text-[#E60023]">Live Feed</button>
        </div>

        {/* Copyright */}
        <div className="text-xs text-center md:text-right">
          © {new Date().getFullYear()} AltFTool. Powered by Next.js & Firebase.
        </div>

      </div>
    </footer>
  );
}
