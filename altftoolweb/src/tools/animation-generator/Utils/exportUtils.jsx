import { generateKeyframesCSS } from "./animationUtils";

export function exportCSS(keyframes, transform, controls) {
  const { duration = 1, delay = 0, iteration = "infinite", direction = "normal", fillMode = "forwards" } = controls || {};
  const keyframesCSS = generateKeyframesCSS(keyframes, transform);
  return `${keyframesCSS}\n.animation {\n  animation: customAnimation ${duration}s ease ${delay}s ${iteration} ${direction} ${fillMode};\n}`;
}

export function exportReact(keyframes, transform, controls) {
  const { duration = 1 } = controls || {};
  return `<motion.div initial={{ opacity: ${keyframes[0].opacity} }} animate={{ opacity: ${keyframes[keyframes.length-1].opacity} }} transition={{ duration: ${duration} }} />`;
}