"use client";

import { useEffect, useRef, useState } from "react";

export default function RouteLazySection({
  children,
  fallback = null,
  rootMargin = "520px 0px",
  className = "",
  idleDelay,
  minHeight,
}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (visible) return;
    const node = ref.current;
    if (!node) return;

    if (!("IntersectionObserver" in window)) {
      const timer = window.setTimeout(() => setVisible(true), 0);
      return () => window.clearTimeout(timer);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setVisible(true);
        observer.disconnect();
      },
      { rootMargin, threshold: 0.01 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [rootMargin, visible]);

  useEffect(() => {
    if (visible || typeof idleDelay !== "number") return undefined;

    if ("requestIdleCallback" in window) {
      const idleId = window.requestIdleCallback(() => setVisible(true), {
        timeout: idleDelay,
      });
      return () => window.cancelIdleCallback?.(idleId);
    }

    const timer = window.setTimeout(() => setVisible(true), idleDelay);
    return () => window.clearTimeout(timer);
  }, [idleDelay, visible]);

  return (
    <div
      ref={ref}
      className={className}
      style={!visible && minHeight ? { minHeight } : undefined}
      aria-busy={!visible || undefined}
    >
      {visible ? children : fallback}
    </div>
  );
}
