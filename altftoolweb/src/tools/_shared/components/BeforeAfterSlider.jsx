"use client";

import { useRef, useState, useCallback, useEffect } from 'react';

export default function BeforeAfterSlider({ beforeImage, afterCanvas, className = '' }) {
  const containerRef = useRef(null);
  const [sliderPos, setSliderPos] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [afterDataURL, setAfterDataURL] = useState(null);

  useEffect(() => {
    if (afterCanvas) {
      setAfterDataURL(afterCanvas.toDataURL());
    }
  }, [afterCanvas]);

  const handleMove = useCallback((e) => {
    if (!isDragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
    setSliderPos(Math.max(0, Math.min(100, (x / rect.width) * 100)));
  }, [isDragging]);

  useEffect(() => {
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', () => setIsDragging(false));
    document.addEventListener('touchmove', handleMove, { passive: true });
    document.addEventListener('touchend', () => setIsDragging(false));
    return () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', () => setIsDragging(false));
      document.removeEventListener('touchmove', handleMove);
      document.removeEventListener('touchend', () => setIsDragging(false));
    };
  }, [handleMove]);

  if (!beforeImage || !afterCanvas) return null;

  return (
    <div ref={containerRef} className={`relative rounded-xl overflow-hidden select-none cursor-ew-resize ${className}`}
      onMouseDown={() => setIsDragging(true)}
      onTouchStart={() => setIsDragging(true)}
    >
      <img src={beforeImage} alt="Before" className="w-full h-full object-contain block" />
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}>
        <img src={afterDataURL} alt="After" className="w-full h-full object-contain block" />
      </div>
      <div className="absolute inset-y-0" style={{ left: `${sliderPos}%` }}>
        <div className="h-full w-0.5 bg-white shadow-lg" />
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center text-sm font-bold text-gray-700">
          ⟷
        </div>
      </div>
      <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-black/40 text-white text-xs backdrop-blur-sm">Before</div>
      <div className="absolute bottom-2 right-2 px-2 py-1 rounded bg-black/40 text-white text-xs backdrop-blur-sm">After</div>
    </div>
  );
}
