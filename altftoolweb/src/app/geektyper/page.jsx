// src/app/geek2/page.jsx - COMPLETE UPDATED FILE
"use client";

import React, { useState, useEffect, useRef } from "react";
import { Cpu, Terminal, Wifi, Shield, Zap, Key, Skull, Lock, Bomb, Network, Keyboard, Ghost, Fish, DoorOpen, Activity, ShieldCheck, Binary, Eye as EyeIcon, Radio, Radar } from "lucide-react";
import {
  INDUSTRIAL_MATRIX,
  GEEK_COMPONENTS_REGISTRY,
  RAW_CODE_STREAM,
} from "./data/INDUSTRIAL_MATRIX";
import BackgroundEngine from "./components/BackgroundEngine";
import ModuleLoader from "./components/ModuleLoader";
import { ThemeProvider, useTheme } from "./hooks/useTheme";
import { PopupProvider, usePopupManager } from "./hooks/usePopupManager";

// Radar Animation Component for Landing Page Only
function RadarAnimation() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationId;
    let radarAngle = 0;
    let blips = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      for (let i = 0; i < 12; i++) {
        blips.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: 2 + Math.random() * 3,
          alpha: 0.3 + Math.random() * 0.5,
          pulse: 0
        });
      }
    };

    const drawRadarEffect = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const maxRadius = Math.min(canvas.width, canvas.height) * 0.45;

      ctx.shadowBlur = 20;
      ctx.shadowColor = "#00ff88";

      for (let i = 1; i <= 4; i++) {
        const radius = maxRadius * (i / 4);
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0, 255, 136, ${0.15 + i * 0.05})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.moveTo(centerX - maxRadius, centerY);
      ctx.lineTo(centerX + maxRadius, centerY);
      ctx.moveTo(centerX, centerY - maxRadius);
      ctx.lineTo(centerX, centerY + maxRadius);
      ctx.strokeStyle = "rgba(0, 255, 136, 0.25)";
      ctx.stroke();

      const diagonal = maxRadius * 0.7;
      ctx.beginPath();
      ctx.moveTo(centerX - diagonal, centerY - diagonal);
      ctx.lineTo(centerX + diagonal, centerY + diagonal);
      ctx.moveTo(centerX + diagonal, centerY - diagonal);
      ctx.lineTo(centerX - diagonal, centerY + diagonal);
      ctx.stroke();

      const rad = (radarAngle * Math.PI) / 180;
      const endX = centerX + Math.cos(rad) * maxRadius;
      const endY = centerY + Math.sin(rad) * maxRadius;

      const sweepGradient = ctx.createLinearGradient(centerX, centerY, endX, endY);
      sweepGradient.addColorStop(0, "rgba(0, 255, 136, 0.35)");
      sweepGradient.addColorStop(1, "rgba(0, 255, 136, 0)");

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(endX, endY);
      ctx.lineTo(centerX + Math.cos(rad + Math.PI/6) * maxRadius * 0.25, centerY + Math.sin(rad + Math.PI/6) * maxRadius * 0.25);
      ctx.fillStyle = sweepGradient;
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(endX, endY);
      ctx.strokeStyle = "rgba(0, 255, 136, 0.6)";
      ctx.lineWidth = 2;
      ctx.stroke();

      blips.forEach(blip => {
        const dx = blip.x - centerX;
        const dy = blip.y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < maxRadius) {
          blip.pulse = (blip.pulse + 0.05) % (Math.PI * 2);
          const pulseRadius = 3 + Math.sin(blip.pulse) * 2;

          ctx.beginPath();
          ctx.arc(blip.x, blip.y, pulseRadius, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(239, 68, 68, 0.7)";
          ctx.fill();

          ctx.beginPath();
          ctx.arc(blip.x, blip.y, 2, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(239, 68, 68, 1)";
          ctx.fill();
        }
      });

      if (Math.random() > 0.98) {
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * maxRadius;
        blips.push({
          x: centerX + Math.cos(angle) * distance,
          y: centerY + Math.sin(angle) * distance,
          radius: 2,
          alpha: 0.8,
          pulse: 0
        });
        if (blips.length > 15) blips.shift();
      }

      radarAngle = (radarAngle + 1.5) % 360;

      ctx.shadowBlur = 0;
      animationId = requestAnimationFrame(drawRadarEffect);
    };

    resize();
    drawRadarEffect();
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0, opacity: 0.4 }} />;
}

// Main Content Component
function Geek2Content() {
  const { currentTheme, setCurrentTheme, themeConfig, themes } = useTheme();
  const { activePopups, showPopup, closePopup } = usePopupManager();

  const [showTerminal, setShowTerminal] = useState(false);
  const [displayedText, setDisplayedText] = useState(
    "SYS_INITIALIZE // ARCHIVE_REGISTRY_MOUNTED\n$> ",
  );
  const [codeIndex, setCodeIndex] = useState(0);
  const [collapsed, setCollapsed] = useState(false);

  const activeConfig = INDUSTRIAL_MATRIX[currentTheme] || INDUSTRIAL_MATRIX.militech;

  useEffect(() => {
    if (!showTerminal) return;
    const streamTimer = setInterval(() => {
      const stride = 6;
      const nextChunk = RAW_CODE_STREAM.slice(codeIndex, codeIndex + stride);
      setDisplayedText((prev) => prev + nextChunk);
      setCodeIndex((prev) =>
        prev + stride >= RAW_CODE_STREAM.length ? 0 : prev + stride,
      );
    }, 20);
    return () => clearInterval(streamTimer);
  }, [codeIndex, showTerminal]);

  const themeCards = [
    { id: "militech", name: "MILITECH", color: "#00ff88", bgColor: "#0a0f0a", icon: <Shield className="w-6 h-6" />, desc: "Military-grade encryption & tactical interface", features: ["AES-256", "Quantum Safe", "Zero Trust"] },
    { id: "tegnio", name: "TEGNIO", color: "#ef4444", bgColor: "#0a0000", icon: <Radio className="w-6 h-6" />, desc: "Crimson matrix & threat detection network", features: ["Real-time Alerts", "Threat Intel", "Red Team"] },
    { id: "shield", name: "SHIELD", color: "#38bdf8", bgColor: "#010b14", icon: <ShieldCheck className="w-6 h-6" />, desc: "Proxy protection & firewall core", features: ["DPI Bypass", "Anonymity", "Geo-spoofing"] },
    { id: "aperture", name: "APERTURE", color: "#22d3ee", bgColor: "#051418", icon: <Binary className="w-6 h-6" />, desc: "Laboratory science & data analysis grid", features: ["Data Mining", "Pattern Scan", "Analytics"] },
    { id: "mrrobot", name: "F_SOCIETY", color: "#f43f5e", bgColor: "#0a0507", icon: <EyeIcon className="w-6 h-6" />, desc: "Anonymous collective & social engineering", features: ["Stealth Mode", "Encryption", "Dark Web"] }
  ];

  const triggerManualModule = (moduleId) => {
    if (activePopups.some((p) => p.moduleId === moduleId)) return;
    const offset = activePopups.length * 25;
    showPopup(moduleId, 120 + offset, 80 + offset);
  };

  // LANDING PAGE VIEW WITH RADAR ANIMATION
  if (!showTerminal) {
    return (
      <div className="relative min-h-screen bg-black overflow-x-auto">
        <RadarAnimation />

        <div className="relative z-10 max-w-6xl mx-auto px-4 py-12">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 border border-green-500/50 rounded-full bg-black/60 mb-6">
              <Radar className="w-4 h-4 text-green-500 animate-pulse" />
              <span className="font-mono text-[10px] font-bold tracking-wider text-green-500">ALTF CODE THEATER v3.0</span>
            </div>
            <h1 className="text-6xl md:text-7xl font-black font-mono mb-4">
              <span className="text-green-500 drop-shadow-[0_0_10px_#00ff88]">CODE</span>
              <span className="text-white"> THEATER</span>
            </h1>
            <p className="text-gray-400 text-sm max-w-2xl mx-auto">
              An immersive hacker simulator with multiple themes and powerful features.
              Select a theme below to enter the digital underworld.
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-6 border-b border-green-500/30 pb-2">
              <Shield className="w-4 h-4 text-green-500" />
              <h2 className="text-sm font-mono font-bold text-green-500 uppercase tracking-wider">SELECT YOUR THEME</h2>
              <span className="text-[10px] text-gray-600 ml-auto">{themeCards.length} themes</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
              {themeCards.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => {
                    setCurrentTheme(theme.id);
                    setShowTerminal(true);
                  }}
                  className="group relative overflow-hidden rounded-xl transition-all duration-300 hover:scale-105 cursor-pointer text-left bg-black/40"
                >
                  <div className="absolute inset-0 rounded-xl opacity-80 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: theme.bgColor }} />
                  <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ boxShadow: `0 0 0 1px ${theme.color}, 0 0 20px ${theme.color}` }} />

                  <div className="relative p-5 rounded-xl z-10">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110" style={{ backgroundColor: `${theme.color}20`, border: `1px solid ${theme.color}50` }}>
                        <div style={{ color: theme.color }} className="group-hover:animate-pulse">{theme.icon}</div>
                      </div>
                      <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: theme.color, boxShadow: `0 0 6px ${theme.color}` }} />
                    </div>

                    <h3 className="text-lg font-mono font-bold mb-2 tracking-wider text-white">{theme.name}</h3>
                    <p className="text-[11px] text-gray-400 mb-3">{theme.desc}</p>

                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {theme.features.map((feature, idx) => (
                        <span key={idx} className="text-[8px] px-2 py-0.5 rounded-full font-mono font-medium" style={{ backgroundColor: `${theme.color}20`, color: theme.color }}>{feature}</span>
                      ))}
                    </div>

                    <div className="relative">
                      <div className="w-full h-1 rounded-full overflow-hidden" style={{ backgroundColor: `${theme.color}30` }}>
                        <div className="h-full rounded-full transition-all duration-500 group-hover:w-full" style={{ width: '40%', backgroundColor: theme.color }} />
                      </div>
                      <div className="flex justify-between mt-1.5">
                        <span className="text-[7px] text-gray-600 font-mono uppercase">Ready</span>
                        <span className="text-[7px] font-mono uppercase group-hover:opacity-100 opacity-50 transition-opacity" style={{ color: theme.color }}>Click →</span>
                      </div>
                    </div>
                  </div>

                  <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 rounded-tl-lg opacity-0 group-hover:opacity-100 transition-opacity" style={{ borderColor: theme.color }} />
                  <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 rounded-tr-lg opacity-0 group-hover:opacity-100 transition-opacity" style={{ borderColor: theme.color }} />
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 rounded-bl-lg opacity-0 group-hover:opacity-100 transition-opacity" style={{ borderColor: theme.color }} />
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 rounded-br-lg opacity-0 group-hover:opacity-100 transition-opacity" style={{ borderColor: theme.color }} />
                </button>
              ))}
            </div>
          </div>

          {/* FOOTER - DEFAULT BACKGROUND (NOT TRANSPARENT) */}
          <div className="text-center pt-12 mt-8 border-t border-green-500/20 bg-black/40 rounded-b-lg">
            <p className="text-[8px] text-gray-500 font-mono py-2">
              <span className="text-green-500 animate-pulse inline-block mr-1">$</span>
              Click any theme to enter the workspace • For entertainment purposes only
            </p>
          </div>
        </div>
      </div>
    );
  }

  // WORKSPACE VIEW
  return (
    <div
      className="absolute inset-0 w-full h-full flex flex-col font-mono select-none overflow-hidden text-xs"
      style={{
        backgroundColor: activeConfig.secondary,
        color: activeConfig.primary,
        "--primary": activeConfig.primary,
      }}
    >
      <BackgroundEngine currentTheme={currentTheme} themes={INDUSTRIAL_MATRIX} />

      <div className="relative z-20 px-5 py-2 flex items-center justify-between border-b bg-black/80 border-white/15">
        <div className="flex items-center gap-4">
          <Terminal className="w-3.5 h-3.5 text-current" />
          <span className="font-black text-[11px] tracking-widest text-white uppercase">{activeConfig.name}</span>
        </div>
        <button onClick={() => { setShowTerminal(false); }} className="px-3 py-1 border border-rose-500/40 bg-rose-500/10 text-rose-400 text-[10px] font-bold cursor-pointer hover:bg-rose-500/20 transition rounded">
          ← BACK TO THEMES
        </button>
      </div>

      <div className="relative z-20 flex-1 w-full min-h-0 flex">

        <div className="flex-1 h-full relative p-6 overflow-hidden">
          <div className="absolute inset-6 bg-black/60 border border-white/10 rounded-lg overflow-y-auto p-4 text-[11px] leading-relaxed pointer-events-none">
            <div className="whitespace-pre-wrap break-all font-semibold text-green-400">{displayedText}</div>
          </div>

          <div className="absolute inset-0 pointer-events-none z-30 p-6 overflow-hidden">
            {activePopups.map((popup) => (
              <div key={popup.id} className="pointer-events-auto">
                <ModuleLoader
                  moduleId={popup.moduleId}
                  initialX={popup.x}
                  initialY={popup.y}
                  currentTheme={currentTheme}
                  onClose={() => closePopup(popup.id)}
                />
              </div>
            ))}
          </div>
        </div>

        <div
          className={`relative border-l transition-all duration-300 ${collapsed ? 'w-12' : 'w-56'} bg-black/80 h-full flex flex-col`}
          style={{ borderColor: `${activeConfig.primary}30` }}
        >
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="absolute -left-3 top-4 p-1 rounded-full border bg-black z-10"
            style={{ borderColor: `${activeConfig.primary}50`, color: activeConfig.primary }}
          >
            {collapsed ? "→" : "←"}
          </button>

          {!collapsed && (
            <div className="text-[8px] font-black tracking-widest uppercase opacity-80 text-center py-3 border-b" style={{ borderColor: `${activeConfig.primary}20`, color: activeConfig.primary }}>
              {"// STORAGE_DECK"}
            </div>
          )}

          <div className={`flex-1 overflow-y-auto custom-dashboard-scroll p-2 ${collapsed ? 'px-1' : ''}`}>
            <div className={`grid ${collapsed ? 'grid-cols-1 gap-1' : 'grid-cols-2 gap-2'}`}>
              {GEEK_COMPONENTS_REGISTRY.map((folder) => {
                const isRunning = activePopups.some((p) => p.moduleId === folder.id);
                return (
                  <div
                    key={folder.id}
                    onClick={() => triggerManualModule(folder.id)}
                    role="button"
                    tabIndex={0}
                    aria-pressed={isRunning}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        triggerManualModule(folder.id);
                      }
                    }}
                    className={`flex flex-col items-center text-center group cursor-pointer transition-all rounded-lg ${
                      collapsed ? 'p-1' : 'p-2'
                    } ${
                      isRunning
                        ? "bg-white/10 border"
                        : "hover:bg-white/5 hover:border-white/20 border border-transparent"
                    }`}
                    style={isRunning ? { borderColor: activeConfig.primary, boxShadow: `0 0 8px ${activeConfig.primary}40` } : {}}
                  >
                    <div className="relative mb-1">
                      <div
                        className={`relative rounded-sm transition-all duration-200 group-hover:scale-105 flex items-center justify-center ${
                          collapsed ? 'w-8 h-7' : 'w-10 h-9'
                        }`}
                        style={{ backgroundColor: isRunning ? activeConfig.primary : `${activeConfig.primary}40` }}
                      >
                        <div
                          className="absolute -top-1 left-1 rounded-t-sm"
                          style={{
                            width: collapsed ? '4px' : '8px',
                            height: collapsed ? '2px' : '4px',
                            backgroundColor: isRunning ? activeConfig.primary : `${activeConfig.primary}70`
                          }}
                        />
                        <span className={`font-black ${collapsed ? 'text-[10px]' : 'text-sm'}`} style={{ color: isRunning ? "#000" : "#fff" }}>
                          {folder.marker}
                        </span>
                      </div>

                      {isRunning && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full animate-pulse bg-green-500 shadow-[0_0_6px_#00ff00]" />
                      )}
                    </div>

                    {!collapsed && (
                      <span className="text-[9px] font-bold tracking-tight leading-tight text-gray-300 group-hover:text-white transition-colors">
                        {folder.label}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {!collapsed && (
            <div className="border-t p-2 mt-auto" style={{ borderColor: `${activeConfig.primary}20` }}>
              <div className="text-[7px] font-black uppercase tracking-wider opacity-70 mb-1 text-center flex items-center justify-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full animate-pulse bg-green-500" />
                <span className="text-white">SYSTEM ONLINE</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* TASKBAR - DEFAULT BACKGROUND */}
      <div className="relative z-20 h-9 bg-black/80 border-t border-white/10 flex items-center justify-between px-2">
        <div className="flex items-center gap-1.5 h-full">
          <div className="h-[70%] px-3 font-black flex items-center justify-center text-[9px] tracking-wider uppercase" style={{ backgroundColor: activeConfig.primary, color: "#000" }}>
            ☲ NODE
          </div>
          <div className="flex items-center gap-1 h-full py-1 overflow-x-auto max-w-[300px]">
            {activePopups.map((tab) => (
              <div key={tab.id} className="h-full px-2 border border-white/15 text-[8px] font-bold uppercase flex items-center gap-1 bg-black/60 text-white/80 whitespace-nowrap rounded">
                <span>📁</span>
                <span className="max-w-[70px] truncate">
                  {GEEK_COMPONENTS_REGISTRY.find((t) => t.id === tab.moduleId)?.label}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3 text-[8px] opacity-60 font-bold px-3">
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: activeConfig.primary }} />
            <span>SECURE</span>
          </div>
          <Wifi size={10} className="animate-pulse" />
          <span>9600 BAUD</span>
        </div>
      </div>
    </div>
  );
}

// Main Export with Providers
export default function MasterGeek2Workspace() {
  return (
    <ThemeProvider>
      <PopupProvider>
        <Geek2Content />
      </PopupProvider>
    </ThemeProvider>
  );
}
