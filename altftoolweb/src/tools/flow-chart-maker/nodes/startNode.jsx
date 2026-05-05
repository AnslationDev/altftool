
"use client";




import { Handle, Position, NodeProps } from '@xyflow/react';
import { useState, useCallback } from 'react';

export function StartNode({ data, selected }) {
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState((data  ).label || 'Start');

  const handleDoubleClick = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsEditing(false);
    if ((data ).onLabelChange) (data ).onLabelChange(label);
  }, [label, data]);

  const handleKeyDown = useCallback((e  ) => {
    if (e.key === 'Enter') {
      setIsEditing(false);
      if ((data ).onLabelChange) (data ).onLabelChange(label);
    }
  }, [label, data]);

  return (
    <div
      className={`px-8 py-3 min-w-[120px] text-center rounded-full border-2 bg-gradient-to-br from-green-50 to-emerald-50 shadow-md transition-all ${
        selected ? 'border-green-500 shadow-green-200 shadow-lg' : 'border-green-400'
      }`}
      onDoubleClick={handleDoubleClick}
    >
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-green-500 !border-2 !border-white" />
      {isEditing ? (
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          autoFocus
          className="w-full text-center text-sm font-bold bg-transparent outline-none border-b-2 border-green-400"
        />
      ) : (
        <div className="text-sm font-bold text-green-700">{label}</div>
      )}
      <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-green-500 !border-2 !border-white" />
    </div>
  );
}
