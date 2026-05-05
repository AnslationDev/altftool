export function generateKeyframesCSS(keyframes, transform) {
  let css = "@keyframes customAnimation {\n";
  keyframes.forEach(kf => {
    const transformStr = transform ? ` transform: translateX(${transform.translateX || 0}px) translateY(${transform.translateY || 0}px) rotate(${transform.rotate || 0}deg) scale(${transform.scale || 1});` : "";
    css += ` ${kf.percent}% { opacity: ${kf.opacity};${transformStr} }\n`;
  });
  css += "}";
  return css;
}