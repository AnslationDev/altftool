
"use client";


import { Handle, Position, NodeProps } from '@xyflow/react';
import { useState, useCallback } from 'react';

export function CommentNode({ data, selected }) {
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState((data ).label || 'Comment');

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
    <div
      className={`px-5 py-3 min-w-[130px] text-center bg-yellow-50 border-2 border-dashed shadow-sm transition-all ${
        selected ? 'border-yellow-500 shadow-yellow-200 shadow-lg' : 'border-yellow-300'
      }`}
      style={{ borderRadius: '4px' }}
      onDoubleClick={handleDoubleClick}
    >
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-yellow-500 !border-2 !border-white" />
      {isEditing ? (
        <textarea
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleBlur(); } }}
          autoFocus
          rows={2}
          className="w-full text-center text-xs bg-transparent outline-none border-b-2 border-yellow-400 resize-none"
        />
      ) : (
        <div className="text-xs text-yellow-800 italic">{label}</div>
      )}
      <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-yellow-500 !border-2 !border-white" />
    </div>
  );
}
