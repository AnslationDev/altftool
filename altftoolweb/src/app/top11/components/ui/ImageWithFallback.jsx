"use client";

import { useEffect, useRef, useState } from "react";

/**
 * External art with its own skeleton. A plain <img> on purpose: the Pexels host
 * is not in next.config.mjs's remotePatterns, and next/image would throw
 * "hostname is not configured" at request time.
 */
export default function ImageWithFallback({
  src,
  alt,
  className = "",
  eager = false,
}) {
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef(null);

  // A cached image can finish decoding before React attaches onLoad — that
  // event then never fires and the picture stays at opacity-0 behind its
  // skeleton forever. Re-check `complete` once mounted so it still reveals.
  useEffect(() => {
    if (imgRef.current?.complete) setLoaded(true);
  }, [src]);

  return (
    <div className={`overflow-hidden bg-slate-200 ${className}`}>
      <div className="relative h-full w-full">
        <div
          className={`absolute inset-0 bg-slate-200 transition-opacity duration-700 ${loaded ? "opacity-0" : "animate-pulse opacity-100"}`}
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          loading={eager ? "eager" : "lazy"}
          onLoad={() => setLoaded(true)}
          className={`h-full w-full object-cover transition duration-1000 ${loaded ? "scale-100 opacity-100" : "scale-[1.03] opacity-0"}`}
        />
      </div>
    </div>
  );
}
