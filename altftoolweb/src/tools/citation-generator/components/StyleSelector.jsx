import React from 'react';
import { STYLES } from '../utils/citation-engine';

const StyleSelector = ({ selected, onSelect }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 mb-8 p-1.5 bg-(--card) rounded-2xl border border-(--border)">
      {STYLES.map((style) => (
        <button
          key={style}
          onClick={() => onSelect(style)}
          className={`px-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
            selected === style
              ? 'bg-white text-(--primary) shadow-sm ring-1 ring-(--border)'
              : 'text-(--secondary-foreground) hover:text-(--foreground) hover:bg-white/50'
          }`}
        >
          {style}
        </button>
      ))}
    </div>
  );
};

export default StyleSelector;
