// src/app/geek2/components/themes/ApertureUI.jsx - CLEAN INTEGRATION
import React from "react";
import { Beaker, Shield, Terminal, Settings } from "lucide-react";

export default function ApertureUI({
  moduleId,
  onClose,
  handleMouseDown,
  pos,
  hashRate,
  minerLogs,
  crackLogs,
  progress,
  canvasRef,
}) {
  return (
    <div
      className="fixed font-mono rounded-none text-xs bg-[#020d0f]/95 text-cyan-400 border border-cyan-500/40 shadow-[0_0_30px_rgba(6,182,212,0.15)] overflow-hidden z-30 select-none"
      style={{
        left: `${pos.x}px`,
        top: `${pos.y}px`,
        width: moduleId === "miner" ? "540px" : "360px",
      }}
    >
      {/* Upper Drag Header Dock */}
      <div
        onMouseDown={handleMouseDown}
        className="h-8 px-3 flex items-center justify-between cursor-grab bg-cyan-950/20 border-b border-cyan-500/30 select-none"
      >
        <div className="flex items-center gap-2 text-[10px] tracking-widest font-black uppercase">
          <Beaker size={13} className="text-cyan-400 animate-pulse" />
          <span>APERTURE_LABS // MODULE_{moduleId}</span>
        </div>
        <button
          onClick={onClose}
          className="close-btn-action text-cyan-600 hover:text-white font-bold px-1 transition-colors rounded-none cursor-pointer"
        >
          ✕
        </button>
      </div>

      {/* Main Terminal Payload Container */}
      <div className="p-4 space-y-3 relative">
        <div className="absolute inset-0 pointer-events-none opacity-[0.02] bg-[linear-gradient(to_right,#00ffcc_1px,transparent_1px),linear-gradient(to_bottom,#00ffcc_1px,transparent_1px)] bg-[size:14px_14px]" />

        <div className="text-cyan-500/50 text-[9px] uppercase tracking-widest font-black flex justify-between items-center border-b border-cyan-500/10 pb-1">
          <span>[ STATUS: RUNNING_PROTOCOL ]</span>
          <span>0x7A_LOCKED</span>
        </div>

        {/* CONTAINER 1: MINER */}
        {moduleId === "miner" && (
          <div className="space-y-3 relative z-10">
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div className="bg-cyan-950/30 border border-cyan-500/20 p-2">
                <span className="opacity-40 block text-[8px] font-bold uppercase tracking-wider">QUANTUM CORE POOL</span>
                <span className="text-white font-black truncate block">aperture.qpool-09.net</span>
              </div>
              <div className="bg-cyan-950/30 border border-cyan-500/20 p-2 flex flex-col justify-between">
                <span className="opacity-40 block text-[8px] font-bold uppercase tracking-wider">VELOCITY SPEED</span>
                <span className="text-cyan-300 font-black tracking-wide text-right block">{hashRate} Th/s</span>
              </div>
            </div>

            <div className="h-24 bg-black/80 border border-cyan-500/10 p-2 overflow-y-auto text-[9px] custom-dashboard-scroll space-y-0.5 text-cyan-400/70">
              {minerLogs.map((l, i) => (
                <div key={i} className="truncate">{`// ${l}`}</div>
              ))}
            </div>
          </div>
        )}

        {/* CONTAINER 2: COMPILER */}
        {moduleId === "compiler" && (
          <div className="space-y-2 relative z-10">
            <div className="flex items-center gap-1.5 text-[10px] text-zinc-300 font-bold">
              <Settings size={12} className="animate-spin text-cyan-400" style={{ animationDuration: '6s' }} />
              <span>Compiling waveform feed neural stream...</span>
            </div>
            <div className="bg-zinc-950/90 border border-cyan-500/20 p-1">
              <canvas ref={canvasRef} className="block w-full" />
            </div>
          </div>
        )}

        {/* CONTAINER 3: PASSWORD CRACKER */}
        {moduleId === "cracker" && (
          <div className="space-y-2 relative z-10">
            <div className="p-2 bg-cyan-950/40 border border-cyan-500/20 text-white text-[10px]">
              TARGET SECURE PORT:: <span className="text-cyan-400 font-bold font-mono">[PORTAL_GATE_05]</span>
            </div>
            <div className="h-24 bg-black border border-cyan-500/10 p-2 overflow-y-auto text-[9px] text-cyan-400/80 custom-dashboard-scroll">
              {crackLogs.map((l, i) => (
                <div key={i} className="truncate">{l}</div>
              ))}
            </div>
          </div>
        )}

        {/* CONTAINER 4: MALWARE INJECTOR */}
        {moduleId === "malware" && (
          <div className="text-center space-y-4 py-1 relative z-10">
            <Shield size={24} className="text-cyan-500 animate-pulse mx-auto" />
            <div className="space-y-1">
              <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">INJECTING NEURAL_MATRIX.EXE</h3>
              <div className="w-full h-1.5 bg-zinc-950 border border-cyan-500/20 p-[1px]">
                <div className="h-full bg-cyan-400 shadow-[0_0_10px_#22d3ee]" style={{ width: `${progress}%` }} />
              </div>
              <div className="text-[8px] opacity-60 text-right">{progress}% SYSTEM OVERWRITE</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
