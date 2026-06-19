"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { loadImage } from "./imageProcessing";
import { takeHandoffFiles } from "./handoff";

/**
 * Manages a single loaded image for a tool page.
 * Optionally consumes a file handed off from the homepage hero.
 */
export function useImage({ consumeHandoff = true } = {}) {
  const [state, setState] = useState(null); // { file, img, url, width, height }
  const [error, setError] = useState("");
  const urlRef = useRef(null);

  const load = useCallback(async (file) => {
    if (!file) return;
    setError("");
    try {
      const { img, url, width, height } = await loadImage(file);
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
      urlRef.current = url;
      setState({ file, img, url, width, height });
    } catch (e) {
      setError(e.message || "Could not load image.");
    }
  }, []);

  const reset = useCallback(() => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = null;
    setState(null);
    setError("");
  }, []);

  useEffect(() => {
    if (!consumeHandoff) return;
    const files = takeHandoffFiles();
    if (files && files.length) load(files[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => () => { if (urlRef.current) URL.revokeObjectURL(urlRef.current); }, []);

  return { image: state, error, setError, load, reset };
}
