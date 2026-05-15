import React from 'react';
import { Lock, Unlock, Eye, EyeOff, Camera } from 'lucide-react';
import { motion } from 'framer-motion';

const FloatingControls = ({ isLocked, onToggleLock, isIllusionMode, onToggleMode, onExport }) => {
  return (
    <motion.div 
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center gap-1.5 md:gap-3 bg-black/60 backdrop-blur-2xl border border-white/10 p-1.5 rounded-full shadow-2xl"
    >
      <div className="flex items-center gap-0.5 bg-white/5 p-1 rounded-full">
        <button
          onClick={onToggleLock}
          className={`group relative p-1.5 rounded-full transition-all duration-300 cursor-pointer active:scale-90 ${isLocked ? 'bg-(--primary) text-white shadow-lg shadow-(--primary)/20' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
        >
          {isLocked ? <Lock size={14} /> : <Unlock size={14} />}
          <div className="hidden md:block absolute -top-9 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-black/90 text-[8px] font-black uppercase tracking-widest rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap backdrop-blur-md border border-white/10 text-white">
            {isLocked ? 'Unlock' : 'Lock'}
          </div>
        </button>
        
        <div className="w-px h-4 bg-white/10 mx-0.5" />
        
        <button
          onClick={onToggleMode}
          className={`group relative p-1.5 rounded-full transition-all duration-300 cursor-pointer active:scale-90 ${isIllusionMode ? 'text-white/60 hover:text-white hover:bg-white/5' : 'bg-green-500 text-white shadow-lg shadow-green-500/20'}`}
        >
          {isIllusionMode ? <Eye size={14} /> : <EyeOff size={14} />}
          <div className="hidden md:block absolute -top-9 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-black/90 text-[8px] font-black uppercase tracking-widest rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap backdrop-blur-md border border-white/10 text-white">
            {isIllusionMode ? 'Split' : 'Merge'}
          </div>
        </button>
      </div>

      <div className="h-5 w-px bg-white/10" />

      <div className="flex items-center pr-1">
        <button 
          onClick={() => onExport('png')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all group border border-white/5 cursor-pointer active:scale-95"
        >
          <Camera size={14} className="text-(--primary) group-hover:scale-110 transition-transform" />
          <span className="text-[8px] font-black uppercase tracking-widest">Snap</span>
        </button>
      </div>
    </motion.div>
  );
};

export default FloatingControls;
