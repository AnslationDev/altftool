import React, { useState, useEffect, useRef } from "react";

export default function PlaygroundCanvas({
  animationStyle,
  animationKey,
  transform = { x: 0, y: 0, scale: 1, rotate: 0, skew: 0 },
  trigger = "auto",
  color1,
  color2,
  useGradient
}) {
  const containerRef = useRef(null);

  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [active, setActive] = useState(false);
  const [dropdownHover, setDropdownHover] = useState(false);

  // Center object on initial render
  useEffect(() => {
    if (containerRef.current) {
      const { width, height } = containerRef.current.getBoundingClientRect();
      setPosition({ x: (width - 100) / 2, y: (height - 100) / 2 });
    }
  }, []);

  const handleMouseDown = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setDragging(true);
  };

  const handleMouseUp = () => setDragging(false);

  const handleMouseMove = (e) => {
    if (!dragging || !containerRef.current) return;
    const container = containerRef.current.getBoundingClientRect();

    let newX = e.clientX - container.left - offset.x + 50;
    let newY = e.clientY - container.top - offset.y + 50;

    const maxX = container.width - 100;
    const maxY = container.height - 100;

    newX = Math.max(0, Math.min(maxX, newX));
    newY = Math.max(0, Math.min(maxY, newY));

    setPosition({ x: newX, y: newY });
  };

  const resetPosition = () => {
    if (containerRef.current) {
      const { width, height } = containerRef.current.getBoundingClientRect();
      setPosition({ x: (width - 100) / 2, y: (height - 100) / 2 });
    }
  };

  const handleClick = () => {
    if (trigger === "click") setActive(!active);
  };

  const handleHover = (state) => {
    if (trigger === "hover") setActive(state);
  };

  const transformStyle = `
    translate(${transform.x}px,${transform.y}px)
    scale(${transform.scale})
    rotate(${transform.rotate}deg)
    skew(${transform.skew}deg)
  `;

  const finalAnimation = trigger === "auto" || active ? animationStyle : "none";

  return (
    <div
      ref={containerRef}
      className="w-full aspect-square max-h-[500px] md:max-h-[600px] lg:max-h-[700px] bg-(--card) rounded relative overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Header */}
      <div className="flex justify-between items-center px-4 pt-3 mb-2">
        <h3 className="font-semibold text-(--foreground) border-b border-(--border) pb-2">
          Animation Playground
        </h3>
        
        {/* Dropdown button */}
        {/* <div
          className="relative"
          onMouseEnter={() => setDropdownHover(true)}
          onMouseLeave={() => setDropdownHover(false)}
        >
          <button className="text-sm border p-2 rounded bg-(--card) text-(--foreground) shadow-card hover:bg-(--muted)">
            Export Options
          </button>

          {dropdownHover && (
            <div className="absolute top-full left-0 mt-1 w-44 bg-(--card) border border-(--border) rounded shadow-card p-2 text-(--foreground) z-20">
              <div className="py-1 px-2 hover:bg-(--muted) rounded cursor-pointer">Export as PNG</div>
              <div className="py-1 px-2 hover:bg-(--muted) rounded cursor-pointer">Export as JPG</div>
              <div className="py-1 px-2 hover:bg-(--muted) rounded cursor-pointer">Export as SVG</div>
            </div>
          )}
        </div> */}
      </div>

      {/* Draggable Object */}
      <div
  key={animationKey}
  onMouseDown={handleMouseDown}
  onClick={handleClick}
  onMouseEnter={() => handleHover(true)}
  onMouseLeave={() => handleHover(false)}
  style={{
    position: "absolute",
    left: position.x,
    top: position.y,
    transform: transformStyle,
    animation: finalAnimation,
    cursor: dragging ? "grabbing" : "grab",
    background: useGradient
      ? `linear-gradient(45deg, ${color1}, ${color2})`
      : color1
  }}
  className="animated-element w-24 h-24 rounded-lg flex items-center justify-center text-3xl select-none">
        ✨
      </div>
    </div>
  );
}