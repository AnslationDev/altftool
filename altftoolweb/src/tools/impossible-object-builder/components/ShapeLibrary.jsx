import React from 'react';
import { Box as BoxIcon, Cylinder as CylinderIcon, Plus, Shapes, Sparkles, Triangle, Layers } from 'lucide-react';
import { generatePenroseTriangle, generateImpossibleCube, generatePenroseStairs } from '../utils/objectGenerators';

const ShapeItem = ({ icon: Icon, label, onClick }) => (
  <button
    onClick={onClick}
    className="group relative flex flex-col items-center justify-center gap-2 rounded-lg p-3 transition-all duration-300 border border-(--border) bg-(--background) hover:border-(--primary) cursor-pointer"
  >
    <div className="p-1.5 rounded-md bg-(--background) border border-(--border) group-hover:border-(--primary)/30 transition-all">
      <Icon size={16} className="text-(--secondary) group-hover:text-(--primary) transition-colors" />
    </div>
    <span className="text-[9px] font-black uppercase tracking-wider text-(--secondary) group-hover:text-(--foreground)">
      {label}
    </span>
  </button>
);

const ShapeLibrary = ({ onAddShape, onAddPreset }) => {
  return (
    <div className="bg-(--background) p-4 md:p-5 rounded-lg border border-(--border) h-full flex flex-col space-y-4">
      <div className="flex items-center gap-2 px-1 text-(--primary)">
        <Shapes size={14} />
        <h3 className="text-[10px] font-black uppercase tracking-widest">Library</h3>
      </div>
      
      <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-1">
        <div className="space-y-2.5">
          <h4 className="px-1 text-[8px] font-black text-(--secondary) uppercase tracking-widest opacity-60">Geometric Units</h4>
          <div className="grid grid-cols-2 gap-2">
            <ShapeItem icon={BoxIcon} label="Beam" onClick={() => onAddShape('beam')} />
            <ShapeItem icon={CylinderIcon} label="Pillar" onClick={() => onAddShape('cylinder')} />
            <ShapeItem icon={Triangle} label="Prism" onClick={() => onAddShape('prism')} />
            <ShapeItem icon={Layers} label="Stair" onClick={() => onAddShape('stair')} />
          </div>
        </div>

        <div className="space-y-2.5 pt-4 border-t border-(--border)">
          <h4 className="px-1 text-[8px] font-black text-(--secondary) uppercase tracking-widest opacity-60">Presets</h4>
          <div className="grid grid-cols-1 gap-1.5">
            <button 
              onClick={() => onAddPreset(generatePenroseTriangle())}
              className="w-full p-2.5 rounded-md bg-(--background) border border-(--border) text-(--secondary) text-[9px] font-black uppercase tracking-widest hover:border-(--primary) hover:text-(--primary) transition-all flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Sparkles size={10} className="text-amber-500 opacity-60" />
                Penrose Triangle
              </div>
              <Plus size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
            <button 
              onClick={() => onAddPreset(generatePenroseStairs())}
              className="w-full p-2.5 rounded-md bg-(--background) border border-(--border) text-(--secondary) text-[9px] font-black uppercase tracking-widest hover:border-(--primary) hover:text-(--primary) transition-all flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Sparkles size={10} className="text-amber-500 opacity-60" />
                Penrose Stairs
              </div>
              <Plus size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
            <button 
              onClick={() => onAddPreset(generateImpossibleCube())}
              className="w-full p-2.5 rounded-md bg-(--background) border border-(--border) text-(--secondary) text-[9px] font-black uppercase tracking-widest hover:border-(--primary) hover:text-(--primary) transition-all flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Sparkles size={10} className="text-amber-500 opacity-60" />
                Impossible Cube
              </div>
              <Plus size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShapeLibrary;
