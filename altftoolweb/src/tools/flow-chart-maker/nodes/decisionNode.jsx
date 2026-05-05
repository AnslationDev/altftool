
"use client";



import { Handle, Position, NodeProps } from '@xyflow/react';
import { useState, useCallback } from 'react';

export function DecisionNode({ data, selected }) {
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState((data ).label || 'Decision');

  const handleDoubleClick = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsEditing(false);
    if ((data ).onLabelChange) (data ).onLabelChange(label);
  }, [label, data]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      setIsEditing(false);
      if ((data ).onLabelChange) (data  ).onLabelChange(label);
    }
  }, [label, data]);

  return (
    <div className="relative" onDoubleClick={handleDoubleClick}>
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-amber-500 !border-2 !border-white !top-[-6px]" />
      <div
        className={`w-[130px] h-[130px] flex items-center justify-center rotate-45 border-2 bg-amber-50 shadow-md transition-all ${
          selected ? 'border-amber-500 shadow-amber-200 shadow-lg' : 'border-amber-300'
        }`}
      >
        <div className="-rotate-45 text-center px-2">
          {isEditing ? (
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              autoFocus
              className="w-[80px] text-center text-xs font-medium bg-transparent outline-none border-b-2 border-amber-400"
            />
          ) : (
            <div className="text-xs font-semibold text-amber-800">{label}</div>
          )}
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-amber-500 !border-2 !border-white !bottom-[-6px]" />
      <Handle type="source" position={Position.Right} id="right" className="!w-3 !h-3 !bg-amber-500 !border-2 !border-white !right-[-6px]" />
      <Handle type="source" position={Position.Left} id="left" className="!w-3 !h-3 !bg-amber-500 !border-2 !border-white !left-[-6px]" />
    </div>
  );
}
