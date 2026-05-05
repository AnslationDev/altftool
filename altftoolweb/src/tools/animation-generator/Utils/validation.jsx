export function validateKeyframes(keyframes) {
  return keyframes.every(kf => kf.percent >= 0 && kf.percent <= 100 && kf.opacity >= 0 && kf.opacity <= 1);
}