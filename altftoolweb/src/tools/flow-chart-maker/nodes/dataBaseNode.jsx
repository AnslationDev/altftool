import { Handle, Position, NodeProps } from '@xyflow/react';
import { useState, useCallback } from 'react';

export function DatabaseNode({ data, selected }) {
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState((data).label || 'Database');

  const handleDoubleClick = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsEditing(false);
    if ((data).onLabelChange) (data).onLabelChange(label);
  }, [label, data]);

  const handleKeyDown = useCallback((e  ) => {
    if (e.key === 'Enter') {
      setIsEditing(false);
      if ((data).onLabelChange) (data).onLabelChange(label);
    }
  }, [label, data]);

  return (
    <div
      className={`relative min-w-[120px] text-center transition-all`}
      onDoubleClick={handleDoubleClick}
    >
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-cyan-500 !border-2 !border-white !top-[2px] !z-10" />
      <svg viewBox="0 0 120 80" className="w-[140px] h-[90px]">
        <ellipse cx="60" cy="14" rx="55" ry="14" fill="#ecfeff" stroke={selected ? '#06b6d4' : '#67e8f9'} strokeWidth="2" />
        <rect x="5" y="14" width="110" height="50" fill="#ecfeff" stroke="none" />
        <line x1="5" y1="14" x2="5" y2="64" stroke={selected ? '#06b6d4' : '#67e8f9'} strokeWidth="2" />
        <line x1="115" y1="14" x2="115" y2="64" stroke={selected ? '#06b6d4' : '#67e8f9'} strokeWidth="2" />
        <ellipse cx="60" cy="64" rx="55" ry="14" fill="#ecfeff" stroke={selected ? '#06b6d4' : '#67e8f9'} strokeWidth="2" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center pt-2">
        {isEditing ? (
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            autoFocus
            className="w-[90px] text-center text-xs font-medium bg-transparent outline-none border-b-2 border-cyan-400"
          />
        ) : (
          <div className="text-xs font-semibold text-cyan-700">{label}</div>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-cyan-500 !border-2 !border-white !bottom-[2px]" />
    </div>
  );
}
