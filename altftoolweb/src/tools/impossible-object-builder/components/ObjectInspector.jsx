import React from 'react';
import { Settings, SlidersHorizontal, Palette, Move, Trash2, Copy } from 'lucide-react';

const SliderInput = ({ label, value, onChange, min = -10, max = 10, step = 0.1 }) => (
  <div className="space-y-1.5">
    <div className="flex justify-between items-center px-1">
      <span className="text-[8px] font-black uppercase tracking-widest text-(--secondary) opacity-70">{label}</span>
      <span className="text-[9px] font-mono font-black text-(--foreground)">{value.toFixed(2)}</span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-full accent-(--primary) cursor-pointer h-1"
    />
  </div>
);

const ObjectInspector = ({ selectedObject, onUpdate, onDelete, onDuplicate }) => {
  if (!selectedObject) {
    return (
      <div className="bg-(--background) p-5 md:p-6 h-full flex flex-col items-center justify-center text-center space-y-3 border border-(--border) rounded-lg">
        <div className="p-3 rounded-full bg-(--background) border border-(--border) text-(--secondary) opacity-20">
          <Settings size={20} />
        </div>
        <div className="space-y-0.5 px-4">
            <h4 className="text-[9px] font-black uppercase tracking-widest text-(--secondary)">Inspector</h4>
            <p className="text-[8px] text-(--secondary)/60 font-bold leading-relaxed italic">Select object</p>
        </div>
      </div>
    );
  }

  const updateProp = (key, index, val) => {
    const newArr = [...selectedObject[key]];
    newArr[index] = val;
    onUpdate({ [key]: newArr });
  };

  return (
    <div className="bg-(--background) p-4 md:p-5 rounded-lg border border-(--border) h-full flex flex-col space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-(--primary)">
            <SlidersHorizontal size={14} />
            <h3 className="text-[10px] font-black uppercase tracking-widest text-(--foreground)">Props</h3>
        </div>
        <span className="text-[8px] px-1.5 py-0.5 rounded bg-(--primary)/10 text-(--primary) font-black uppercase tracking-widest border border-(--primary)/10">
          {selectedObject.type}
        </span>
      </div>

      <div className="space-y-5 flex-1 overflow-y-auto pr-1 custom-scrollbar">
        {/* Position */}
        <div className="space-y-3">
            <div className="flex items-center gap-1.5 text-[8px] font-black uppercase tracking-widest text-(--secondary) opacity-70">
                <Move size={10} /> Transform
            </div>
            <div className="space-y-2.5">
                <SliderInput label="X Pos" value={selectedObject.position[0]} onChange={(v) => updateProp('position', 0, v)} />
                <SliderInput label="Y Pos" value={selectedObject.position[1]} onChange={(v) => updateProp('position', 1, v)} />
                <SliderInput label="Z Pos" value={selectedObject.position[2]} onChange={(v) => updateProp('position', 2, v)} />
            </div>
        </div>

        {/* Rotation */}
        <div className="space-y-3 pt-4 border-t border-(--border)">
            <div className="flex items-center gap-1.5 text-[8px] font-black uppercase tracking-widest text-(--secondary) opacity-70">
                <SlidersHorizontal size={10} /> Orient
            </div>
            <div className="space-y-2.5">
                <SliderInput label="Rot X" value={selectedObject.rotation[0]} min={-Math.PI} max={Math.PI} onChange={(v) => updateProp('rotation', 0, v)} />
                <SliderInput label="Rot Y" value={selectedObject.rotation[1]} min={-Math.PI} max={Math.PI} onChange={(v) => updateProp('rotation', 1, v)} />
                <SliderInput label="Rot Z" value={selectedObject.rotation[2]} min={-Math.PI} max={Math.PI} onChange={(v) => updateProp('rotation', 2, v)} />
            </div>
        </div>

        {/* Appearance */}
        <div className="space-y-3 pt-4 border-t border-(--border)">
            <div className="flex items-center gap-1.5 text-[8px] font-black uppercase tracking-widest text-(--secondary) opacity-70">
                <Palette size={10} /> Style
            </div>
            <div className="flex items-center justify-between p-2.5 bg-(--background) rounded-md border border-(--border)">
                <span className="text-[9px] font-black uppercase tracking-widest text-(--secondary)">Color</span>
                <input
                    type="color"
                    value={selectedObject.color}
                    onChange={(e) => onUpdate({ color: e.target.value })}
                    className="w-8 h-6 bg-transparent border-none rounded cursor-pointer overflow-hidden"
                />
            </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 pt-4 border-t border-(--border)">
        <button 
            onClick={onDuplicate}
            className="flex items-center justify-center gap-1.5 py-2 rounded-md bg-(--background) border border-(--border) text-(--secondary) text-[9px] font-black uppercase tracking-widest hover:border-(--primary) hover:text-(--primary) transition-all cursor-pointer"
        >
            <Copy size={10} /> Clone
        </button>
        <button 
            onClick={onDelete}
            className="flex items-center justify-center gap-1.5 py-2 rounded-md bg-red-50 text-red-600 border border-red-100 text-[9px] font-black uppercase tracking-widest hover:bg-red-100 transition-all cursor-pointer"
        >
            <Trash2 size={10} /> Drop
        </button>
      </div>
    </div>
  );
};

export default ObjectInspector;
