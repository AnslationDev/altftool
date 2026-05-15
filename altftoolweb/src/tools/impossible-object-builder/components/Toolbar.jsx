import React from 'react';
import { MousePointer2, Move, RotateCw, Maximize2, Trash2, Copy, Layers } from 'lucide-react';

const Toolbar = ({ activeTool, setActiveTool, onDelete, onDuplicate }) => {
  const tools = [
    { id: 'select', icon: MousePointer2, label: 'Select' },
    { id: 'move', icon: Move, label: 'Move' },
    { id: 'rotate', icon: RotateCw, label: 'Rotate' },
    { id: 'scale', icon: Maximize2, label: 'Scale' },
  ];

  return (
    <div className="flex flex-col gap-2 p-2 glass-panel rounded-2xl">
      {tools.map((tool) => (
        <button
          key={tool.id}
          onClick={() => setActiveTool(tool.id)}
          className={`toolbar-btn ${activeTool === tool.id ? 'active' : 'text-gray-400'}`}
          title={tool.label}
        >
          <tool.icon size={20} />
        </button>
      ))}
      
      <div className="w-full h-px bg-white/10 my-1" />
      
      <button onClick={onDuplicate} className="toolbar-btn text-gray-400" title="Duplicate">
        <Copy size={20} />
      </button>
      <button onClick={onDelete} className="toolbar-btn text-red-400 hover:bg-red-500/10" title="Delete">
        <Trash2 size={20} />
      </button>
    </div>
  );
};

export default Toolbar;
