// src/tools/constellation-finder/components.jsx
"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  MapPin, Calendar, Moon, Star, Telescope, Eye, BookOpen,
  Info, Compass, Maximize2, Minimize2, ZoomIn, ZoomOut, Target,
  MousePointer, Share2, Bookmark, Check, Sparkles, Sliders, ChevronDown,
  Globe, Shield, Award, Layers, X, PanelLeft, PanelRight, ChevronLeft, ChevronRight
} from 'lucide-react';
import { CONSTELLATIONS_DATA, STARGAZING_TIPS } from './data';

// Helper icon resolver
const renderLucideIcon = (name, className = "h-5 w-5") => {
  switch (name) {
    case "Compass": return <Compass className={className} />;
    case "Shield": return <Shield className={className} />;
    case "Sparkles": return <Sparkles className={className} />;
    case "Target": return <Target className={className} />;
    case "Globe": return <Globe className={className} />;
    case "Star": return <Star className={className} />;
    case "Telescope": return <Telescope className={className} />;
    case "Award": return <Award className={className} />;
    case "Eye": return <Eye className={className} />;
    default: return <Sparkles className={className} />;
  }
};

// Distance from point (px, py) to line segment (ax, ay)-(bx, by)
function distToSegment(px, py, ax, ay, bx, by) {
  const l2 = (ax - bx) ** 2 + (ay - by) ** 2;
  if (l2 === 0) return Math.hypot(px - ax, py - ay);
  let t = ((px - ax) * (bx - ax) + (py - ay) * (by - ay)) / l2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (ax + t * (bx - ax)), py - (ay + t * (by - ay)));
}

/**
 * 1. HERO SECTION
 */
export const ObservatoryHero = ({ selectedLocation }) => {
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) +
        " · " +
        now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mb-6 space-y-4 px-4 sm:px-0">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-[var(--primary)]/20 bg-[var(--primary-soft)] px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-[var(--primary)] shadow-xs">
          <Sparkles className="h-4 w-4" />
          <span>Sky Observatory</span>
        </div>

        {/* Location & Time Status Badges */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[var(--card)] border border-[var(--border)] rounded-xl text-xs font-semibold text-[var(--foreground)] shadow-2xs">
            <MapPin className="h-3.5 w-3.5 text-[var(--primary)] shrink-0" />
            <span className="truncate max-w-[140px]">{selectedLocation}</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-[var(--card)] border border-[var(--border)] rounded-xl text-xs font-semibold text-[var(--foreground)] shadow-2xs">
            <Calendar className="h-3.5 w-3.5 text-[var(--primary)] shrink-0" />
            <span className="font-mono text-[11px] truncate">{currentTime || "May 20, 2024 · 10:30 PM"}</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-[var(--card)] border border-[var(--border)] rounded-xl text-xs font-semibold text-[var(--foreground)] shadow-2xs">
            <Moon className="h-3.5 w-3.5 text-[var(--primary)] shrink-0" />
            <span>Clear Sky</span>
            <div className="constellation-green-dot shrink-0" title="Ideal Stargazing Conditions" />
          </div>
        </div>
      </div>

      <h1 className="heading text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[var(--foreground)] tracking-tight">
        Constellation Finder
      </h1>

      <p className="description max-w-3xl text-sm sm:text-base text-[var(--muted-foreground)] leading-relaxed">
        Explore 16 major constellations on an interactive night sky map. Pan, zoom, and select constellations to inspect star catalogs, spectral classifications, right ascension coordinates, and ancient mythology.
      </p>
    </div>
  );
};

/**
 * 2. CONTROL BAR (Season Filter Chips & Map Style Toggle)
 */
export const ObservatoryControlBar = ({
  selectedSeason,
  onSeasonChange,
  mapStyle,
  onMapStyleChange
}) => {
  const seasons = ["All", "Spring", "Summer", "Fall", "Winter"];

  return (
    <div className="w-full mb-4 flex flex-wrap items-center justify-between gap-3 p-3 sm:p-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-xs">
      {/* Season Chips */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-xs font-black uppercase text-[var(--muted-foreground)] mr-2 tracking-wider">
          Season:
        </span>
        {seasons.map((s) => (
          <button
            key={s}
            onClick={() => onSeasonChange(s)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${selectedSeason === s
                ? "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-xs"
                : "bg-[var(--surface-soft)] border border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              }`}
            type="button"
          >
            {s}
          </button>
        ))}
      </div>

      {/* Realistic / Stylized Toggle */}
      <div className="flex items-center gap-1 bg-[var(--surface-soft)] p-1 rounded-xl border border-[var(--border)]">
        <button
          onClick={() => onMapStyleChange("realistic")}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${mapStyle === "realistic"
              ? "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-xs"
              : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
          type="button"
        >
          Realistic
        </button>
        <button
          onClick={() => onMapStyleChange("stylized")}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${mapStyle === "stylized"
              ? "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-xs"
              : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
          type="button"
        >
          Stylized
        </button>
      </div>
    </div>
  );
};

/**
 * 3. FULL WIDTH SKY CANVAS (With Accurate Clickability & Fullscreen Overlay Sidebars)
 */
export const ObservatoryCanvasFullWidth = ({
  constellations,
  selectedId,
  onSelectConstellation,
  selectedConstellation,
  bookmarkedIds,
  onToggleBookmark,
  onOpenStarModal,
  mapStyle,
}) => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  const [zoom, setZoom] = useState(1.0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Fullscreen Sidebars Visibility State
  const [showLeftSidebar, setShowLeftSidebar] = useState(true);
  const [showRightSidebar, setShowRightSidebar] = useState(true);

  // Generate a deterministic star field so rendering stays pure and stable
  // across React re-renders, SSR, screenshots, and browser sessions.
  const bgStars = useMemo(() => {
    let seed = 104729;
    const next = () => {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    };

    return Array.from({ length: 1200 }, () => ({
      x: next() * 1400,
      y: next() * 750,
      size: next() * 1.8 + 0.5,
      alpha: next() * 0.7 + 0.3,
      twinkleSpeed: next() * 0.04 + 0.01,
      color: ["#ffffff", "#cbd5e1", "#fde047", "#38bdf8", "#818cf8"][
        Math.floor(next() * 5)
      ],
    }));
  }, []);

  // Draw Sky Canvas
  const renderSky = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Background Gradient
    const bgGrad = ctx.createRadialGradient(
      width * 0.5 + pan.x,
      height * 0.5 + pan.y,
      50,
      width * 0.5 + pan.x,
      height * 0.5 + pan.y,
      width * 0.8 * zoom
    );
    bgGrad.addColorStop(0, "#081225");
    bgGrad.addColorStop(0.5, "#040814");
    bgGrad.addColorStop(1, "#020409");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);

    // Nebula Cloud Glow
    if (mapStyle === "realistic") {
      const nebGrad = ctx.createLinearGradient(100, 100, 900, 600);
      nebGrad.addColorStop(0, "rgba(45, 212, 191, 0.08)");
      nebGrad.addColorStop(0.4, "rgba(56, 189, 248, 0.12)");
      nebGrad.addColorStop(0.8, "rgba(129, 140, 248, 0.06)");
      nebGrad.addColorStop(1, "rgba(34, 197, 94, 0.04)");

      ctx.fillStyle = nebGrad;
      ctx.beginPath();
      ctx.ellipse(600, 350, 550, 250, Math.PI / 6, 0, Math.PI * 2);
      ctx.fill();
    }

    // Stars
    const time = Date.now() * 0.002;
    bgStarsRef.current.forEach((star, idx) => {
      const tw = Math.sin(time * star.twinkleSpeed + idx) * 0.25;
      const currentAlpha = Math.max(0.1, Math.min(1, star.alpha + tw));

      ctx.fillStyle = star.color;
      ctx.globalAlpha = currentAlpha;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1.0;

    // Constellations
    constellations.forEach((constellation) => {
      const isSelected = constellation.id === selectedId;

      ctx.beginPath();
      constellation.lines.forEach(([startIdx, endIdx]) => {
        const p1 = constellation.starNodes[startIdx];
        const p2 = constellation.starNodes[endIdx];
        if (p1 && p2) {
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
        }
      });

      ctx.lineWidth = isSelected ? 2.5 : mapStyle === "realistic" ? 1.0 : 1.5;
      ctx.strokeStyle = isSelected
        ? "#2dd4bf"
        : mapStyle === "realistic"
          ? "rgba(45, 212, 191, 0.4)"
          : "rgba(255, 255, 255, 0.25)";
      ctx.stroke();

      if (isSelected) {
        ctx.lineWidth = 6;
        ctx.strokeStyle = "rgba(45, 212, 191, 0.3)";
        ctx.stroke();
      }

      constellation.starNodes.forEach((node) => {
        const radius = Math.max(2.5, 6.5 - node.mag * 0.8);

        if (isSelected) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, radius * 2.8, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(45, 212, 191, 0.25)";
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = isSelected ? "#FFFFFF" : "#5eead4";
        ctx.fill();

        ctx.strokeStyle = isSelected ? "#2dd4bf" : "rgba(255, 255, 255, 0.8)";
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });

      const centerX = constellation.starNodes.reduce((acc, curr) => acc + curr.x, 0) / constellation.starNodes.length;
      const centerY = constellation.starNodes.reduce((acc, curr) => acc + curr.y, 0) / constellation.starNodes.length;

      ctx.font = isSelected ? "bold 15px Geist, sans-serif" : "500 13px Geist, sans-serif";
      ctx.fillStyle = isSelected ? "#FFFFFF" : "rgba(203, 213, 225, 0.85)";
      ctx.textAlign = "center";
      ctx.shadowColor = isSelected ? "rgba(45, 212, 191, 0.9)" : "transparent";
      ctx.shadowBlur = isSelected ? 12 : 0;
      ctx.fillText(constellation.name, centerX, centerY - 24);
      ctx.shadowBlur = 0;
    });

    ctx.restore();
  }, [bgStars, constellations, selectedId, zoom, pan, mapStyle]);

  useEffect(() => {
    let animId;
    const loop = () => {
      renderSky();
      animId = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(animId);
  }, [renderSky]);

  useEffect(() => {
    const handleFSChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFSChange);
    return () => document.removeEventListener("fullscreenchange", handleFSChange);
  }, []);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // High-accuracy Click Hit Testing (Star Nodes & Connecting Lines)
  const handleCanvasClick = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const clickX = (e.clientX - rect.left - pan.x) / zoom;
    const clickY = (e.clientY - rect.top - pan.y) / zoom;

    let selectedConstellationId = null;

    // 1. First test distance to star nodes (30px radius)
    for (const c of constellations) {
      for (const node of c.starNodes) {
        if (Math.hypot(node.x - clickX, node.y - clickY) <= 32) {
          selectedConstellationId = c.id;
          break;
        }
      }
      if (selectedConstellationId) break;
    }

    // 2. If no star hit directly, test distance to line segments (25px radius)
    if (!selectedConstellationId) {
      let minLineDist = 28;
      for (const c of constellations) {
        for (const [startIdx, endIdx] of c.lines) {
          const p1 = c.starNodes[startIdx];
          const p2 = c.starNodes[endIdx];
          if (p1 && p2) {
            const d = distToSegment(clickX, clickY, p1.x, p1.y, p2.x, p2.y);
            if (d < minLineDist) {
              minLineDist = d;
              selectedConstellationId = c.id;
            }
          }
        }
      }
    }

    if (selectedConstellationId) {
      onSelectConstellation(selectedConstellationId);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => console.error(err));
    } else {
      document.exitFullscreen();
    }
  };

  const resetView = () => {
    setZoom(1.0);
    setPan({ x: 0, y: 0 });
  };

  return (
    <div
      ref={containerRef}
      className={`w-full mb-6 rounded-3xl border border-[var(--border)] bg-[#040814] overflow-hidden relative select-none shadow-md transition-all ${isFullscreen ? "h-screen w-screen rounded-none border-none mb-0" : "min-h-[520px] lg:min-h-[600px]"
        }`}
    >
      <canvas
        ref={canvasRef}
        width={1300}
        height={700}
        onClick={handleCanvasClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={`w-full h-full object-cover ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
      />

      {/* Map Compass Indicators */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 constellation-compass-badge pointer-events-none z-10">N</div>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 constellation-compass-badge pointer-events-none z-10">S</div>
      <div className="absolute top-1/2 left-4 -translate-y-1/2 constellation-compass-badge pointer-events-none z-10">W</div>
      <div className="absolute top-1/2 right-4 -translate-y-1/2 constellation-compass-badge pointer-events-none z-10">E</div>

      {/* Toolbar Controls */}
      <div className={`absolute top-6 z-30 flex flex-col gap-2 p-2 bg-[var(--card)]/90 border border-[var(--border)] backdrop-blur-md rounded-2xl shadow-xl transition-all ${isFullscreen && showLeftSidebar ? "left-[300px]" : "left-6"
        }`}>
        <button
          onClick={resetView}
          className="p-2.5 text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-soft)] rounded-xl transition-all"
          title="Select / Pan"
          type="button"
        >
          <MousePointer className="h-4 w-4" />
        </button>
        <button
          onClick={resetView}
          className="p-2.5 text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-soft)] rounded-xl transition-all"
          title="Center Sky Map"
          type="button"
        >
          <Target className="h-4 w-4" />
        </button>
        <div className="h-px w-full bg-[var(--border)] my-0.5" />
        <button
          onClick={() => setZoom(prev => Math.min(prev + 0.25, 2.5))}
          className="p-2.5 text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-soft)] rounded-xl transition-all"
          title="Zoom In (+)"
          type="button"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
        <button
          onClick={() => setZoom(prev => Math.max(prev - 0.25, 0.5))}
          className="p-2.5 text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-soft)] rounded-xl transition-all"
          title="Zoom Out (-)"
          type="button"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
        <div className="h-px w-full bg-[var(--border)] my-0.5" />
        <button
          onClick={toggleFullscreen}
          className="p-2.5 text-[var(--muted-foreground)] hover:text-[var(--primary)] hover:bg-[var(--surface-soft)] rounded-xl transition-all"
          title="Fullscreen Mode"
          type="button"
        >
          {isFullscreen ? <Minimize2 className="h-4 w-4 text-[var(--primary)]" /> : <Maximize2 className="h-4 w-4" />}
        </button>

        {isFullscreen && (
          <>
            <div className="h-px w-full bg-[var(--border)] my-0.5" />
            <button
              onClick={() => setShowLeftSidebar(prev => !prev)}
              className={`p-2.5 rounded-xl transition-all ${showLeftSidebar ? "text-[var(--primary)] bg-[var(--primary-soft)]" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                }`}
              title="Toggle Left Constellations List"
              type="button"
            >
              <PanelLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setShowRightSidebar(prev => !prev)}
              className={`p-2.5 rounded-xl transition-all ${showRightSidebar ? "text-[var(--primary)] bg-[var(--primary-soft)]" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                }`}
              title="Toggle Right Details Panel"
              type="button"
            >
              <PanelRight className="h-4 w-4" />
            </button>
          </>
        )}
      </div>

      {/* FULLSCREEN OVERLAY PANELS */}
      {isFullscreen && (
        <>
          {/* Left Overlay */}
          {showLeftSidebar && (
            <div className="absolute left-6 top-6 bottom-6 z-20 w-[270px] overflow-y-auto constellation-custom-scrollbar">
              <ObservatoryList
                constellations={constellations}
                selectedId={selectedId}
                onSelectConstellation={onSelectConstellation}
                isCollapsible={true}
                onClose={() => setShowLeftSidebar(false)}
              />
            </div>
          )}

          {/* Right Overlay */}
          {showRightSidebar && (
            <div className="absolute right-6 top-6 bottom-6 z-20 w-[320px] overflow-y-auto constellation-custom-scrollbar">
              <ObservatoryInfoPanel
                constellation={selectedConstellation}
                isBookmarked={bookmarkedIds.includes(selectedId)}
                onToggleBookmark={onToggleBookmark}
                onOpenStarModal={onOpenStarModal}
                isCollapsible={true}
                onClose={() => setShowRightSidebar(false)}
              />
            </div>
          )}
        </>
      )}

      {!isFullscreen && (
        <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-4 py-1.5 text-xs text-white/70 backdrop-blur-sm border border-white/10 font-medium">
          Scroll / Drag to navigate · Click any star cluster or constellation line to select
        </div>
      )}
    </div>
  );
};

/**
 * 4. COLLAPSIBLE CONSTELLATIONS LIST SIDEBAR
 */
export const ObservatoryList = ({
  constellations,
  selectedId,
  onSelectConstellation,
  isCollapsible = false,
  onClose = null,
  isCollapsed = false,
  onToggleCollapse = null,
}) => {
  if (isCollapsed) {
    return (
      <div className="constellation-glass-card p-3 flex flex-col items-center gap-3 bg-[var(--card)]/95 backdrop-blur-md border border-[var(--border)]">
        <button
          onClick={onToggleCollapse}
          className="p-2 rounded-xl bg-[var(--surface-soft)] text-[var(--primary)] border border-[var(--border)] hover:bg-[var(--card)]"
          title="Expand Constellation List"
          type="button"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
        <div className="h-px w-full bg-[var(--border)]" />
        <Star className="h-4 w-4 text-[var(--primary)]" />
      </div>
    );
  }

  return (
    <div className="constellation-glass-card p-4 sm:p-5 flex flex-col h-[580px] bg-[var(--card)]/95 backdrop-blur-md border border-[var(--border)]">
      <div className="flex items-center justify-between pb-3 border-b border-[var(--border)] mb-3">
        <div className="flex items-center gap-2">
          <Star className="h-4 w-4 text-[var(--primary)] fill-[var(--primary)]/30" />
          <h2 className="font-black text-sm text-[var(--foreground)] tracking-wide uppercase">
            {constellations.length} Constellations
          </h2>
        </div>

        {/* Collapsible Action Buttons */}
        <div className="flex items-center gap-1">
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="p-1.5 text-[var(--muted-foreground)] hover:text-[var(--foreground)] rounded-lg hover:bg-[var(--surface-soft)]"
              title="Collapse Panel"
              type="button"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
          {isCollapsible && onClose && (
            <button
              onClick={onClose}
              className="p-1.5 text-[var(--muted-foreground)] hover:text-[var(--foreground)] rounded-lg hover:bg-[var(--surface-soft)]"
              title="Close Sidebar Overlay"
              type="button"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto constellation-custom-scrollbar space-y-1.5 pr-1">
        {constellations.map((item) => {
          const isSelected = item.id === selectedId;
          return (
            <button
              key={item.id}
              onClick={() => onSelectConstellation(item.id)}
              className={`w-full text-left p-3 rounded-xl flex items-center justify-between transition-all duration-200 ${isSelected
                  ? "constellation-item-selected font-black"
                  : "bg-[var(--surface-soft)]/50 border border-transparent hover:bg-[var(--surface-soft)] hover:border-[var(--border)] text-[var(--foreground)]"
                }`}
              type="button"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-lg bg-[var(--card)] text-[var(--primary)] border border-[var(--border)] shrink-0">
                  {renderLucideIcon(item.iconName, "h-4 w-4")}
                </div>
                <div className="min-w-0">
                  <span className="font-bold text-xs sm:text-sm block truncate text-[var(--foreground)]">
                    {item.name}
                  </span>
                  <span className="text-[11px] text-[var(--muted-foreground)] block truncate">
                    {item.subtitle}
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[var(--primary-soft)] text-[var(--primary)] shrink-0 ml-2">
                {item.season}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

/**
 * 5. COLLAPSIBLE CONSTELLATION DETAILS PANEL
 */
export const ObservatoryInfoPanel = ({
  constellation,
  isBookmarked,
  onToggleBookmark,
  onOpenStarModal,
  isCollapsible = false,
  onClose = null,
  isCollapsed = false,
  onToggleCollapse = null,
}) => {
  if (isCollapsed) {
    return (
      <div className="constellation-glass-card p-3 flex flex-col items-center gap-3 bg-[var(--card)]/95 backdrop-blur-md border border-[var(--border)]">
        <button
          onClick={onToggleCollapse}
          className="p-2 rounded-xl bg-[var(--surface-soft)] text-[var(--primary)] border border-[var(--border)] hover:bg-[var(--card)]"
          title="Expand Constellation Details"
          type="button"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="h-px w-full bg-[var(--border)]" />
        <Info className="h-4 w-4 text-[var(--primary)]" />
      </div>
    );
  }

  if (!constellation) return null;

  return (
    <div className="constellation-glass-card p-5 flex flex-col gap-4 h-full bg-[var(--card)]/95 backdrop-blur-md border border-[var(--border)]">
      {/* Header */}
      <div className="flex items-start justify-between min-w-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-10 w-10 rounded-xl bg-[var(--primary-soft)] border border-[var(--primary)]/30 flex items-center justify-center text-[var(--primary)] shrink-0">
            {renderLucideIcon(constellation.iconName, "h-5 w-5")}
          </div>
          <div className="min-w-0">
            <h2 className="text-xl font-black text-[var(--foreground)] truncate">{constellation.name}</h2>
            <span className="text-xs text-[var(--muted-foreground)] font-medium block truncate">
              {constellation.subtitle}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => onToggleBookmark(constellation.id)}
            className={`p-2 rounded-xl border transition-all ${isBookmarked
                ? "bg-[var(--primary-soft)] border-[var(--primary)] text-[var(--primary)]"
                : "bg-[var(--surface-soft)] border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--card)]"
              }`}
            title={isBookmarked ? "Remove Bookmark" : "Bookmark Constellation"}
            type="button"
          >
            <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-[var(--primary)]" : ""}`} />
          </button>

          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="p-2 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              title="Collapse Details Panel"
              type="button"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          )}

          {isCollapsible && onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              title="Close Details Panel"
              type="button"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Graphic Art Card */}
      <div className="relative w-full h-36 rounded-2xl overflow-hidden border border-[var(--border)] bg-[var(--surface-soft)] flex flex-col items-center justify-center p-4">
        <div className="p-3 rounded-2xl bg-[var(--card)] text-[var(--primary)] border border-[var(--border)] mb-2 shadow-xs">
          {renderLucideIcon(constellation.iconName, "h-8 w-8")}
        </div>
        <span className="text-xs font-mono font-bold text-[var(--primary)] uppercase tracking-wider block">
          {constellation.genitive}
        </span>
      </div>

      {/* Description */}
      <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
        {constellation.description}
      </p>

      {/* Stars Catalog */}
      <div className="space-y-2">
        <span className="text-xs font-black uppercase text-[var(--foreground)] tracking-wider block">
          Major Stars Catalog
        </span>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] divide-y divide-[var(--border)] overflow-hidden">
          {constellation.stars.slice(0, 4).map((star, idx) => (
            <div key={idx} className="p-2.5 flex items-center justify-between text-xs min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                <div className="h-2.5 w-2.5 rounded-full shrink-0 shadow-xs" style={{ backgroundColor: star.color }} />
                <div className="min-w-0">
                  <span className="font-bold text-[var(--foreground)] block truncate">{star.name}</span>
                  <span className="text-[10px] text-[var(--muted-foreground)] block truncate">{star.type}</span>
                </div>
              </div>
              <span className="font-mono text-[11px] font-bold text-[var(--primary)] shrink-0 ml-2">
                {star.mag} mag
              </span>
            </div>
          ))}
        </div>

        <button
          onClick={() => onOpenStarModal(constellation)}
          className="w-full mt-1 py-2 rounded-xl border border-[var(--primary)]/40 text-[var(--primary)] hover:bg-[var(--primary-soft)] font-bold text-xs transition-all text-center block"
          type="button"
        >
          View All Stars ({constellation.stars.length})
        </button>
      </div>

      {/* Mini Stats Grid */}
      <div className="grid grid-cols-2 gap-2.5 pt-1">
        <div className="p-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)]">
          <span className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase block">Right Ascension</span>
          <span className="font-mono font-black text-xs text-[var(--foreground)] block mt-0.5">{constellation.ra}</span>
        </div>
        <div className="p-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)]">
          <span className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase block">Declination</span>
          <span className="font-mono font-black text-xs text-[var(--foreground)] block mt-0.5">{constellation.dec}</span>
        </div>
        <div className="p-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)]">
          <span className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase block">Sky Area</span>
          <span className="font-mono font-black text-xs text-[var(--foreground)] block mt-0.5">{constellation.area}</span>
        </div>
        <div className="p-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)]">
          <span className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase block">Best Season</span>
          <span className="font-mono font-black text-xs text-[var(--foreground)] block mt-0.5">{constellation.bestSeason}</span>
        </div>
      </div>
    </div>
  );
};

/**
 * 6. EDUCATIONAL CARDS
 */
export const ObservatoryEducationalCards = ({ selectedConstellation }) => {
  return (
    <section className="w-full mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* 1. Magnitude Guide */}
      <div className="constellation-glass-card p-5 sm:p-6 flex flex-col justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-[var(--primary)] fill-[var(--primary)]/30" />
            <h3 className="font-black text-base text-[var(--foreground)]">Magnitude Scale Guide</h3>
          </div>
          <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
            Stellar magnitude measures apparent brightness. Lower or negative values represent brighter celestial objects.
          </p>

          <div className="p-4 rounded-2xl bg-[var(--surface-soft)] border border-[var(--border)] space-y-3">
            <div className="flex items-center justify-between px-2">
              {[-1, 0, 1, 2, 3, 5, 6].map((m, idx) => {
                const sizes = [12, 10, 8, 6, 5, 4, 3];
                return (
                  <div key={m} className="flex flex-col items-center gap-1">
                    <div
                      className="rounded-full bg-[var(--foreground)] shadow-xs"
                      style={{ width: sizes[idx], height: sizes[idx] }}
                    />
                    <span className="font-mono text-[10px] text-[var(--muted-foreground)] font-bold">{m}</span>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between text-[10px] font-bold text-[var(--primary)] px-1 uppercase tracking-wider">
              <span>Brightest</span>
              <span>Faintest</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. What is Magnitude */}
      <div className="constellation-glass-card p-5 sm:p-6 flex flex-col justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Telescope className="h-5 w-5 text-[var(--primary)]" />
            <h3 className="font-black text-base text-[var(--foreground)]">Stellar Magnitude</h3>
          </div>
          <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
            First devised by Greek astronomer Hipparchus in 129 BC, the magnitude scale divides stars into six visibility classes. A difference of 5 magnitudes equals a 100x brightness ratio.
          </p>

          <div className="p-3.5 rounded-2xl bg-[var(--surface-soft)] border border-[var(--border)] flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[var(--card)] text-[var(--primary)] border border-[var(--border)] shrink-0">
              <Telescope className="h-4 w-4" />
            </div>
            <div className="text-xs text-[var(--foreground)] font-medium">
              Sirius (α CMa) is the brightest star at <span className="font-mono text-[var(--primary)] font-bold">-1.46 mag</span>.
            </div>
          </div>
        </div>
      </div>

      {/* 3. Mythology Lore */}
      <div className="constellation-glass-card p-5 sm:p-6 flex flex-col justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-[var(--primary)]" />
            <h3 className="font-black text-base text-[var(--foreground)]">
              {selectedConstellation ? `${selectedConstellation.name} Lore` : "Constellation Mythology"}
            </h3>
          </div>
          <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
            {selectedConstellation
              ? selectedConstellation.mythology
              : "Constellations served as agricultural calendars, navigation guides, and mythological storytellers across ancient civilizations."}
          </p>

          <div className="p-3.5 rounded-2xl bg-[var(--surface-soft)] border border-[var(--border)] flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[var(--card)] text-[var(--primary)] border border-[var(--border)] shrink-0">
              <BookOpen className="h-4 w-4" />
            </div>
            <div className="text-xs text-[var(--foreground)] font-medium">
              88 official constellations are recognized today by the IAU.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

/**
 * 7. FOOTER TIPS
 */
export const ObservatoryFooter = ({ onShareSkyView }) => {
  return (
    <footer className="w-full mt-6 mb-8">
      <div className="constellation-glass-card p-6 flex flex-col gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {STARGAZING_TIPS.map((tip, idx) => (
            <div key={idx} className="p-3.5 rounded-2xl bg-[var(--surface-soft)] border border-[var(--border)] flex flex-col gap-2">
              <div className="p-2 rounded-xl bg-[var(--card)] text-[var(--primary)] border border-[var(--border)] w-fit">
                {renderLucideIcon(tip.iconName, "h-4 w-4")}
              </div>
              <h4 className="font-bold text-xs text-[var(--foreground)] truncate">{tip.title}</h4>
              <p className="text-[11px] text-[var(--muted-foreground)] leading-normal">{tip.desc}</p>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
            <Award className="h-4 w-4 text-[var(--primary)]" />
            <span>Digital Planetarium Suite · Astronomical Data Standards</span>
          </div>

          <button
            onClick={onShareSkyView}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-[var(--primary)] text-[var(--primary-foreground)] font-black text-xs uppercase tracking-wider shadow-lg shadow-[var(--primary)]/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2.5"
            type="button"
          >
            <Share2 className="h-4 w-4 text-[var(--primary-foreground)]" />
            <span>Share Sky View</span>
          </button>
        </div>
      </div>
    </footer>
  );
};
