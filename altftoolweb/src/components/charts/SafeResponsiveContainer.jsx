"use client";

import { useEffect, useRef, useState } from "react";
import { ResponsiveContainer as RechartsResponsiveContainer } from "recharts";

export default function SafeResponsiveContainer({
  children,
  className = "",
  minHeight,
  minWidth,
  ...props
}) {
  const frameRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return undefined;

    let frameId = 0;
    const updateReady = () => {
      const rect = frame.getBoundingClientRect();
      setReady(rect.width > 0 && rect.height > 0);
    };

    updateReady();
    frameId = window.requestAnimationFrame(updateReady);

    if (typeof ResizeObserver === "undefined") {
      return () => window.cancelAnimationFrame(frameId);
    }

    const observer = new ResizeObserver(updateReady);
    observer.observe(frame);

    return () => {
      window.cancelAnimationFrame(frameId);
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={frameRef}
      className={className}
      style={{
        width: "100%",
        height: "100%",
        minHeight,
        minWidth,
      }}
    >
      {ready ? (
        <RechartsResponsiveContainer
          initialDimension={{
            width: Math.max(1, minWidth || 1),
            height: Math.max(1, minHeight || 1),
          }}
          minHeight={minHeight}
          minWidth={minWidth}
          {...props}
        >
          {children}
        </RechartsResponsiveContainer>
      ) : null}
    </div>
  );
}
