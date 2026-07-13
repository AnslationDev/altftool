import { useEffect, useRef, useState } from "react";

/**
 * Animated count-up that starts the first time the element enters the viewport.
 * Replaces react-countup for full React 19 compatibility.
 *
 * @param {number} end      final value
 * @param {object} opts     { duration, decimals, prefix, suffix }
 */
export function useCountUp(end, opts = {}) {
  const {
    duration = 2000,
    decimals = 0,
    prefix = "",
    suffix = "",
  } = opts;

  const ref = useRef(null);
  const [value, setValue] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const tick = (now) => {
            const p = Math.min((now - start) / duration, 1);
            // easeOutExpo
            const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
            setValue(end * eased);
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.4 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [end, duration]);

  const formatted =
    prefix +
    value.toLocaleString("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }) +
    suffix;

  return { ref, formatted };
}
