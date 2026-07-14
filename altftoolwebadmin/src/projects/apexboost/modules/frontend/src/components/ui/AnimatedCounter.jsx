import { useCountUp } from "../../hooks/useCountUp";

/**
 * Animated number that counts up when scrolled into view.
 */
export default function AnimatedCounter({
  value,
  decimals = 0,
  prefix = "",
  suffix = "",
  className = "",
}) {
  const { ref, formatted } = useCountUp(value, { decimals, prefix, suffix });
  return (
    <span ref={ref} className={className}>
      {formatted}
    </span>
  );
}
