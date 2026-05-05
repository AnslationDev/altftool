import React, { useState } from "react";

export default function DraggableItem({ element, keyframes, transform, trigger }) {
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const handleDrag = (e) => {
    const rect = e.target.getBoundingClientRect();
    setPos({ x: e.clientX - rect.width / 2, y: e.clientY - rect.height / 2 });
  };

  // Simple inline style for transform
  const style = {
    transform: `translate(${pos.x}px, ${pos.y}px) translateX(${transform?.translateX || 0}px) translateY(${transform?.translateY || 0}px) rotate(${transform?.rotate || 0}deg) scale(${transform?.scale || 1})`,
    opacity: transform?.opacity || 1,
    position: "absolute",
    cursor: "grab",
  };

  return (
    <div
      style={style}
      onMouseDown={(e) => {
        e.target.onmousemove = handleDrag;
        e.target.onmouseup = () => (e.target.onmousemove = null);
      }}
      className="bg-primary text-primary-foreground p-2 rounded select-none"
    >
      {element.label}
    </div>
  );
}