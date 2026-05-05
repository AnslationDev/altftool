"use client"

import React from "react";
import { encodingTypes } from "../utils/encodeDecode";

const DropdownSelector = ({ value, onChange }) => {
  return (
    <div className="flex flex-col w-full py-2 overflow-hidden">
      <div className="w-full max-w-4xl p-4 sm:p-2  border border-(--border) text-(--primary) rounded-2xl overflow-hidden">
        
        <div className="flex flex-row flex-nowrap items-center w-full gap-2 overflow-x-auto no-scrollbar scroll-smooth">
          {encodingTypes.map((type) => {
            const isActive = type.value === value;
            return (
              <button
                key={type.value}
                type="button"
                onClick={() => onChange(type.value)}
                style={{ 
                  width: "calc((100% - 2rem) / 5)", 
                  minWidth: "140px" 
                }}
                className={`flex-none py-2.5 rounded-xl text-[10px] md:text-[16px] font-light transition-all duration-300 whitespace-nowrap cursor-pointer transform active:scale-95 text-center border ${
                  isActive 
                  ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] border-blue-400' 
                  : 'bg-(--card) text-(--primary) border-blue-500/20 hover:bg-blue-600 hover:text-white'
                }`}
              >
                {type.label}
              </button>
            );
          })}
        </div>

      </div>
    </div>
  );
};

export default DropdownSelector;