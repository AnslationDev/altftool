"use client";

import { useEffect, useState } from "react";

// Returns a debounced copy of `value` that updates after `delay` ms.
export function useDebounce(value, delay = 200) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
