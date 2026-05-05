

"use client";





import { Handle, Position, NodeProps } from '@xyflow/react';
import { useState, useCallback } from 'react';

export function IONode({ data, selected }) {
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState((data ).label || 'Input/Output');

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
      className={`min-w-[140px] text-center shadow-md transition-all ${
        selected ? 'shadow-purple-200 shadow-lg' : ''
      }`}
      style={{
        background: 'linear-gradient(135deg, #f3e8ff, #ede9fe)',
        clipPath: 'polygon(15% 0%, 100% 0%, 85% 100%, 0% 100%)',
        padding: '12px 30px',
        border: selected ? '2px solid #8b5cf6' : '2px solid #a78bfa',
      }}
      onDoubleClick={handleDoubleClick}
    >
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-purple-500 !border-2 !border-white" />
      {isEditing ? (
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          autoFocus
          className="w-full text-center text-sm font-medium bg-transparent outline-none border-b-2 border-purple-400"
        />
      ) : (
        <div className="text-sm font-medium text-purple-700">{label}</div>
      )}
      <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-purple-500 !border-2 !border-white" />
    </div>
  );
}
