

"use client";



import { Handle, Position, NodeProps } from '@xyflow/react';
import { useState, useCallback } from 'react';

export function SubprocessNode({ data, selected }  ) {
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState((data ).label || 'Subprocess');

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
    <div
      className={`px-6 py-3 min-w-[150px] text-center rounded-lg border-2 bg-indigo-50 shadow-md transition-all ${
        selected ? 'border-indigo-500 shadow-indigo-200 shadow-lg' : 'border-indigo-300'
      }`}
      onDoubleClick={handleDoubleClick}
    >
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-indigo-500 !border-2 !border-white" />
      <div className="border-l-2 border-r-2 border-indigo-300 px-3 py-1">
        {isEditing ? (
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            autoFocus
            className="w-full text-center text-sm font-medium bg-transparent outline-none border-b-2 border-indigo-400"
          />
        ) : (
          <div className="text-sm font-medium text-indigo-700">{label}</div>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-indigo-500 !border-2 !border-white" />
    </div>
  );
}
