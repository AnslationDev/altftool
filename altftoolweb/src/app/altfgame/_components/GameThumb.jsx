"use client";

import { useEffect, useRef, useState } from "react";

// Game thumbnail: renders game.image — a local /images/games/<slug>.webp
// asset — over a gradient + emoji tile. The gradient is the fallback for
// games with no image (flappy-bird) or if an asset ever fails to load, so
// there is never a blank tile. The photo fades in smoothly once loaded
// instead of popping in.
export default function GameThumb({ game, className = "", rounded = "rounded-2xl" }) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef(null);
  const src = failed ? null : game.image;

  // Small local files load very fast — often before React finishes
  // attaching onLoad/onError (a well-known SSR/hydration race), which left
  // the image stuck invisible at opacity-0 forever since the load event
  // fired and was missed. Catch that by checking the native
  // `complete`/`naturalWidth` state directly once the element is mounted,
  // plus a short safety-net timer so a photo can never stay invisible
  // indefinitely even in some other edge case.
  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete) {
      if (img.naturalWidth > 0) {
        setLoaded(true);
      } else {
        setLoaded(false);
        setFailed(true);
      }
      return;
    }
    const t = setTimeout(() => setLoaded(true), 800);
    return () => clearTimeout(t);
  }, [src]);

  const [c1, c2] = game.colors;
  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden ${rounded} ${className}`}
      style={{ background: `linear-gradient(135deg, ${c1} 0%, ${c2} 100%)` }}
    >
      {/* soft highlight */}
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{ background: "radial-gradient(120% 80% at 20% 0%, rgba(255,255,255,0.35), transparent 60%)" }}
      />
      {/* subtle grid pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      />
      {src ? (
        <img
          key={src}
          ref={imgRef}
          src={src}
          alt={game.title}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => {
            setLoaded(false);
            setFailed(true);
          }}
          className={`absolute inset-0 h-full w-full object-cover transition duration-500 ease-out group-hover:scale-105 ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
        />
      ) : (
        <span
          aria-hidden="true"
          className="relative select-none text-5xl drop-shadow-[0_2px_10px_rgba(0,0,0,0.35)] sm:text-6xl"
        >
          {game.emoji}
        </span>
      )}
    </div>
  );
}
