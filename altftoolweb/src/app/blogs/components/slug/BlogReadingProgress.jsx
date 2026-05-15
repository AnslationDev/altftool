"use client";

import { useEffect, useState } from "react";

export default function BlogReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - window.innerHeight;
      const nextProgress =
        scrollable > 0 ? Math.min(100, Math.max(0, (window.scrollY / scrollable) * 100)) : 0;
      setProgress(nextProgress);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  return (
    <div className="fixed left-0 right-0 top-[72px] z-40 h-1 bg-transparent">
      <div
        className="h-full bg-(--primary) transition-[width] duration-150"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
