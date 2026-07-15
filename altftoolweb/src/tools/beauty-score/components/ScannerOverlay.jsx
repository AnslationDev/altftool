import React from "react";
import { ScanFace } from "lucide-react";

export default function ScannerOverlay({ isScanning }) {
  if (!isScanning) return null;

  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm rounded-lg overflow-hidden">
      <div className="relative flex flex-col items-center">
        {/* Scanning Line Animation */}
        <div className="absolute top-0 w-full h-1 bg-purple-500 shadow-[0_0_15px_#a855f7] animate-scan-line z-10" />
        
        <ScanFace size={64} className="text-purple-400 animate-pulse mb-4" />
        
        <div className="text-purple-300 font-semibold tracking-wider animate-pulse flex flex-col items-center">
          <span>ANALYZING FACIAL STRUCTURE</span>
          <span className="text-xs text-purple-400/70 mt-1">Calculating Golden Ratio & Symmetry...</span>
        </div>
      </div>

      <style>{`
        @keyframes scan-line {
          0% { top: -20%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 120%; opacity: 0; }
        }
        .animate-scan-line {
          animation: scan-line 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
      `}</style>
    </div>
  );
}
