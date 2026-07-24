// src/tools/constellation-finder/pages/index.jsx
"use client";

import React, { useState, useMemo, useCallback } from 'react';
import {
  ObservatoryHero,
  ObservatoryControlBar,
  ObservatoryCanvasFullWidth,
  ObservatoryList,
  ObservatoryInfoPanel,
  ObservatoryEducationalCards,
  ObservatoryFooter
} from '../components';
import { CONSTELLATIONS_DATA } from '../data';
import '../styles.css';
import { Check, X } from 'lucide-react';

export default function ConstellationFinderHome() {
  const [selectedId, setSelectedId] = useState("orion");
  const [selectedSeason, setSelectedSeason] = useState("All");
  const [mapStyle, setMapStyle] = useState("realistic");
  const [bookmarkedIds, setBookmarkedIds] = useState(["orion", "ursa-major"]);
  const [starModalConstellation, setStarModalConstellation] = useState(null);
  const [shareToastMessage, setShareToastMessage] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState("New Delhi, India");

  // Collapsible Sidebars State (for normal mode)
  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);
  const [isRightCollapsed, setIsRightCollapsed] = useState(false);

  // Filtered Constellations List by Season
  const filteredConstellations = useMemo(() => {
    return CONSTELLATIONS_DATA.filter((c) => {
      return selectedSeason === "All" || c.season === selectedSeason;
    });
  }, [selectedSeason]);

  // Selected Constellation Object
  const selectedConstellation = useMemo(() => {
    return CONSTELLATIONS_DATA.find((c) => c.id === selectedId) || CONSTELLATIONS_DATA[0];
  }, [selectedId]);

  // Bookmark Toggle Handler
  const handleToggleBookmark = useCallback((id) => {
    setBookmarkedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }, []);

  // Share Sky View Handler
  const handleShareSkyView = useCallback(() => {
    const shareUrl = `${window.location.origin}${window.location.pathname}?constellation=${selectedId}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setShareToastMessage("Sky view link copied to clipboard!");
      setTimeout(() => setShareToastMessage(null), 3000);
    }).catch(() => {
      setShareToastMessage("Shared: " + selectedConstellation.name);
      setTimeout(() => setShareToastMessage(null), 3000);
    });
  }, [selectedId, selectedConstellation]);

  return (
    <div className="constellation-app-root min-h-screen p-4 sm:p-6 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-7xl flex flex-col min-w-0">
        {/* 1. HERO SECTION */}
        <ObservatoryHero
          selectedLocation={selectedLocation}
        />

        {/* 2. CONTROL BAR (Season Filter Chips & Map Style Toggle) */}
        <ObservatoryControlBar
          selectedSeason={selectedSeason}
          onSeasonChange={setSelectedSeason}
          mapStyle={mapStyle}
          onMapStyleChange={setMapStyle}
        />

        {/* 3. FULL WIDTH INTERACTIVE SKY CANVAS */}
        <ObservatoryCanvasFullWidth
          constellations={filteredConstellations}
          selectedId={selectedId}
          onSelectConstellation={setSelectedId}
          selectedConstellation={selectedConstellation}
          bookmarkedIds={bookmarkedIds}
          onToggleBookmark={handleToggleBookmark}
          onOpenStarModal={setStarModalConstellation}
          mapStyle={mapStyle}
        />

        {/* 4. TWO-COLUMN DETAILS & LIST (Normal View with Collapsible Panels) */}
        <div className={`grid gap-6 w-full min-w-0 transition-all ${
          isLeftCollapsed && isRightCollapsed
            ? "grid-cols-1"
            : isLeftCollapsed
            ? "grid-cols-1 xl:grid-cols-[60px_1fr]"
            : isRightCollapsed
            ? "grid-cols-1 xl:grid-cols-[320px_60px]"
            : "grid-cols-1 xl:grid-cols-[320px_1fr]"
        }`}>
          {/* Left Column: Constellation List */}
          <ObservatoryList
            constellations={filteredConstellations}
            selectedId={selectedId}
            onSelectConstellation={setSelectedId}
            isCollapsed={isLeftCollapsed}
            onToggleCollapse={() => setIsLeftCollapsed(prev => !prev)}
          />

          {/* Right Column: Selected Constellation Details & Star Catalog */}
          <ObservatoryInfoPanel
            constellation={selectedConstellation}
            isBookmarked={bookmarkedIds.includes(selectedId)}
            onToggleBookmark={handleToggleBookmark}
            onOpenStarModal={setStarModalConstellation}
            isCollapsed={isRightCollapsed}
            onToggleCollapse={() => setIsRightCollapsed(prev => !prev)}
          />
        </div>

        {/* 5. BOTTOM EDUCATIONAL CARDS */}
        <ObservatoryEducationalCards selectedConstellation={selectedConstellation} />

        {/* 6. FOOTER */}
        <ObservatoryFooter onShareSkyView={handleShareSkyView} />
      </div>

      {/* VIEW ALL STARS CATALOG MODAL */}
      {starModalConstellation && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="constellation-glass-card w-full max-w-2xl p-6 border border-[var(--border)] shadow-2xl relative max-h-[85vh] flex flex-col bg-[var(--card)] text-[var(--foreground)]">
            <div className="flex items-center justify-between pb-4 border-b border-[var(--border)] mb-4">
              <div>
                <h3 className="text-xl font-black text-[var(--foreground)]">{starModalConstellation.name} Star Catalog</h3>
                <span className="text-xs text-[var(--muted-foreground)]">Full stellar data, spectral types &amp; coordinates</span>
              </div>
              <button
                onClick={() => setStarModalConstellation(null)}
                className="p-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] rounded-xl hover:bg-[var(--surface-soft)]"
                type="button"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto constellation-custom-scrollbar pr-1">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[var(--border)] text-[var(--muted-foreground)] uppercase font-mono text-[10px]">
                    <th className="py-2.5 px-3">Star Name</th>
                    <th className="py-2.5 px-3">Stellar Type</th>
                    <th className="py-2.5 px-3">Spectral</th>
                    <th className="py-2.5 px-3">Brightness</th>
                    <th className="py-2.5 px-3">R.A.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)] font-medium text-[var(--foreground)]">
                  {starModalConstellation.stars.map((star, idx) => (
                    <tr key={idx} className="hover:bg-[var(--surface-soft)] transition-all">
                      <td className="py-3 px-3 flex items-center gap-2 font-bold">
                        <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: star.color }} />
                        <span>{star.name}</span>
                      </td>
                      <td className="py-3 px-3 text-[var(--muted-foreground)]">{star.type}</td>
                      <td className="py-3 px-3 font-mono text-[var(--primary)]">{star.temp}</td>
                      <td className="py-3 px-3 font-mono text-[var(--primary)] font-bold">{star.mag} mag</td>
                      <td className="py-3 px-3 font-mono text-[var(--muted-foreground)]">{star.ra}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pt-4 border-t border-[var(--border)] mt-4 flex justify-end">
              <button
                onClick={() => setStarModalConstellation(null)}
                className="px-5 py-2 rounded-xl bg-[var(--primary)] text-[var(--primary-foreground)] font-bold text-xs hover:opacity-90 transition-all"
                type="button"
              >
                Close Catalog
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SHARE TOAST NOTIFICATION */}
      {shareToastMessage && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl bg-[var(--primary)] text-[var(--primary-foreground)] font-bold text-xs shadow-2xl flex items-center gap-2 animate-bounce">
          <Check className="h-4 w-4 text-[var(--primary-foreground)]" />
          <span>{shareToastMessage}</span>
        </div>
      )}
    </div>
  );
}
