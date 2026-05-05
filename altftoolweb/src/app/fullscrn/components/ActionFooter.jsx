import React from "react";
import { Maximize2, Trash2 } from "lucide-react";

const ActionFooter = ({ onClear, onFullscreen, btnColor }) => {

  const isWhite = btnColor === "#fff" || btnColor === "#ffffff" || btnColor === "white";

  return (
    <div className="w-full h-[80px] bg-white border-t border-[#E2E8F0] flex justify-between items-center px-[30px]">
      <button 
        onClick={onClear} 
        className="flex items-center gap-2 px-5 py-2 rounded-lg border border-slate-200 text-slate-500 font-bold hover:bg-slate-50 transition-all text-sm"
      >
        <Trash2 size={16}/> Clear
      </button>

      <button 
        onClick={onFullscreen} 
        className={`flex items-center gap-2 px-8 py-3 rounded-xl font-black text-base shadow-md hover:scale-[1.02] active:scale-95 transition-all ${isWhite ? "text-black" : "text-white"}`}
        style={{ backgroundColor: btnColor }}
      >
        <Maximize2 size={18}/> Go Fullscreen
      </button>
    </div>
  );
};

export default ActionFooter;