import React, { useRef } from "react";
import { AlignLeft, AlignCenter, AlignRight, Plus } from "lucide-react";

const SettingSidebar = ({ fontSize, setFontSize, textAlign, setTextAlign, textColor, setTextColor, bgColor, setBgColor }) => {
  const colors = ["#000000", "#ffffff", "#0081d1", "#ffc107"];
  
  // Refs for hidden color inputs
  const textColorRef = useRef(null);
  const bgColorRef = useRef(null);

  return (
    <div className="col-span-4 relative bg-white h-full border-l border-slate-100 min-w-[329px]">
      <div className="flex flex-col items-start px-[35px]">
        
        {/* 1. Font Size */}
        <div className="mt-[45px] flex flex-col gap-[8px]">
          <label className="text-[13px] font-bold text-slate-700 uppercase tracking-tight">Font Size</label>
          <div className="w-[209px] h-[67px] flex items-center bg-[#F1F5F9] rounded-[10px] p-[6px] border border-slate-200 gap-[8px]">
            <button onClick={() => setFontSize(Math.max(12, fontSize - 4))} className="w-[42px] h-[42px] flex items-center justify-center bg-white rounded-[8px] shadow-sm hover:bg-gray-50 active:scale-95 transition-all text-xl font-bold text-slate-600">-</button>
            <input type="number" value={fontSize} onChange={(e) => setFontSize(parseInt(e.target.value) || 0)} className="flex-grow bg-transparent text-center font-black text-[18px] text-slate-800 outline-none w-0" />
            <button onClick={() => setFontSize(fontSize + 4)} className="w-[42px] h-[42px] flex items-center justify-center bg-white rounded-[8px] shadow-sm hover:bg-gray-50 active:scale-95 transition-all text-xl font-bold text-slate-600">+</button>
          </div>
        </div>

        {/* 2. Text Align */}
        <div className="mt-[24px] flex flex-col gap-[8px]">
          <label className="text-[13px] font-bold text-slate-700 uppercase tracking-tight">Text Align</label>
          <div className="w-[209px] h-[70px] flex items-center justify-between bg-[#F1F5F9] rounded-[10px] p-[6px] border border-slate-200 gap-[7px]">
            {[
              { icon: <AlignLeft size={20}/>, val: "left" },
              { icon: <AlignCenter size={20}/>, val: "center" },
              { icon: <AlignRight size={20}/>, val: "right" }
            ].map((b) => (
              <button key={b.val} onClick={() => setTextAlign(b.val)} className={`flex-1 h-full flex items-center justify-center rounded-[8px] transition-all ${textAlign === b.val ? "bg-white shadow-sm text-[#0081d1]" : "text-slate-400 hover:text-slate-600"}`}>{b.icon}</button>
            ))}
          </div>
        </div>

        {/* 3. Colors Section */}
        <div className="mt-[24px] space-y-[24px]">
          {[
            { label: "Text Color", cur: textColor, set: setTextColor, ref: textColorRef },
            { label: "Background Color", cur: bgColor, set: setBgColor, ref: bgColorRef }
          ].map((ctrl) => (
            <div key={ctrl.label} className="flex flex-col gap-[8px]">
              <label className="text-[13px] font-bold text-slate-700 uppercase tracking-tight">{ctrl.label}</label>
              <div className="w-[209px] flex items-center gap-[11px]">
                {colors.map((c) => (
                  <button 
                    key={c} 
                    onClick={() => ctrl.set(c)} 
                    className={`w-[32px] h-[32px] rounded-full border-[2px] transition-transform ${ctrl.cur === c ? 'border-slate-800 scale-110 shadow-md' : 'border-transparent shadow-sm'}`} 
                    style={{ backgroundColor: c }} 
                  />
                ))}
                
                {/* 🎨 The Color Picker Button */}
                <div className="relative">
                  <button 
                    onClick={() => ctrl.ref.current.click()}
                    className="w-[32px] h-[32px] rounded-full border border-dashed border-slate-300 flex items-center justify-center text-slate-400 hover:border-slate-500 hover:bg-slate-50 transition-all"
                  >
                    <Plus size={14} />
                  </button>
                  {/* Hidden Input for Color Picker */}
                  <input 
                    type="color" 
                    ref={ctrl.ref} 
                    value={ctrl.cur} 
                    onChange={(e) => ctrl.set(e.target.value)} 
                    className="absolute inset-0 opacity-0 w-0 h-0 pointer-events-none"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SettingSidebar;