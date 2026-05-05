

"use client";




import { Handle, Position, NodeProps } from '@xyflow/react';
import { useState, useCallback } from 'react';

export function DocumentNode({ data, selected }) {
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState((data ).label || 'Document');

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
      if ((data ).onLabelChange) (data ).onLabelChange(label);
    }
  }, [label, data]);

  return (
    <div className="relative min-w-[130px] text-center" onDoubleClick={handleDoubleClick}>
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-rose-500 !border-2 !border-white !z-10" />
      <svg viewBox="0 0 130 90" className="w-[150px] h-[95px]">
        <path
          d="M5,5 L125,5 L125,65 Q95,50 65,70 Q35,90 5,65 Z"
          fill="#fff1f2"
          stroke={selected ? '#f43f5e' : '#fda4af'}
          strokeWidth="2"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center pb-3">
        {isEditing ? (
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            autoFocus
            className="w-[90px] text-center text-xs font-medium bg-transparent outline-none border-b-2 border-rose-400"
          />
        ) : (
          <div className="text-xs font-semibold text-rose-700">{label}</div>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-rose-500 !border-2 !border-white !bottom-[8px]" />
    </div>
  );
}
