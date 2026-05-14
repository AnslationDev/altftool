"use client";

import { useMemo, useState } from "react";

const TRANSPARENT_PIXEL =
  "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";

function isValidImageSrc(value) {
  return typeof value === "string" && value.trim().length > 0;
}

export default function ManagedImage({
  src,
  fallbackSrc = "/image-fallback.svg",
  alt = "",
  fill = false,
  loading = "lazy",
  decoding = "async",
  referrerPolicy = "no-referrer",
  onError,
  style,
  ...props
}) {
  const [failedSrcs, setFailedSrcs] = useState([]);

  const imageSrc = useMemo(() => {
    const candidates = [src, fallbackSrc, TRANSPARENT_PIXEL].filter(isValidImageSrc);
    return candidates.find((candidate) => !failedSrcs.includes(candidate)) || TRANSPARENT_PIXEL;
  }, [failedSrcs, fallbackSrc, src]);

  function handleError(event) {
    onError?.(event);
    setFailedSrcs((current) => (
      current.includes(imageSrc) ? current : [...current, imageSrc]
    ));
  }

  return (
    // Remote/Firebase image URLs are data-driven, so centralize raw image fallback behavior here.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      {...props}
      src={imageSrc}
      alt={alt}
      loading={loading}
      decoding={decoding}
      referrerPolicy={referrerPolicy}
      data-altftool-image-state={imageSrc === fallbackSrc ? "fallback" : "loaded"}
      onError={handleError}
      style={fill ? { ...style, position: "absolute", inset: 0, width: "100%", height: "100%" } : style}
    />
  );
}
