"use client";

/* eslint-disable @next/next/no-img-element */
import { useMemo, useState } from "react";

export default function LocalFactImage({ article, className = "fn-image", fallbackLabel }) {
  const candidates = useMemo(() => {
    if (article?.imageCandidates?.length) return article.imageCandidates;
    if (article?.image) return [article.image];
    return [];
  }, [article]);
  const [index, setIndex] = useState(0);
  const [failed, setFailed] = useState(!candidates.length);
  const src = candidates[index];
  const label = fallbackLabel || article?.title || "Fact Hub";

  if (failed || !src) {
    return <div className="fn-image-fallback">{label}</div>;
  }

  return (
    <img
      className={className}
      src={src}
      alt={article?.title || "Fact Hub image"}
      loading="lazy"
      onError={() => {
        if (index < candidates.length - 1) {
          setIndex((value) => value + 1);
          return;
        }
        setFailed(true);
      }}
    />
  );
}
