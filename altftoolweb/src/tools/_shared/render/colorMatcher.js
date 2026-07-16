// ColorMatcher: warps a chosen hair/beard colour so it inherits the photo's
// lighting and grading instead of looking like a flat vector fill.

function hexToRgb(hex) {
  let h = (hex || '#000000').replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const num = parseInt(h, 16);
  if (Number.isNaN(num)) return { r: 0, g: 0, b: 0 };
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

function rgbToCss({ r, g, b }, a = 1) {
  return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${a})`;
}

// Blend a base colour toward the ambient mean colour (colour grading match).
function gradeColor(rgb, lighting) {
  const mean = lighting.meanColor;
  const blend = 0.18 * lighting.saturation;
  return {
    r: rgb.r * (1 - blend) + mean.r * blend,
    g: rgb.g * (1 - blend) + mean.g * blend,
    b: rgb.b * (1 - blend) + mean.b * blend,
  };
}

export function matchHairColor(hex, lighting, { shine = 0.5 } = {}) {
  const base = gradeColor(hexToRgb(hex), lighting);
  // Hair is glossy: brighten highlights, deepen shadows, push saturation a touch.
  const lift = (lighting.brightness - 1) * 18;
  const s = 1.08;
  const out = {
    r: clamp(base.r * s + lift * 0.7, 0, 255),
    g: clamp(base.g * s + lift * 0.7, 0, 255),
    b: clamp(base.b * s + lift * 0.7, 0, 255),
  };
  out.css = rgbToCss(out);
  out.shade = rgbToCss({ r: out.r * 0.55, g: out.g * 0.55, b: out.b * 0.55 });
  out.highlight = rgbToCss({
    r: clamp(out.r + 60 * shine, 0, 255),
    g: clamp(out.g + 60 * shine, 0, 255),
    b: clamp(out.b + 60 * shine, 0, 255),
  });
  return out;
}

export function matchBeardColor(hex, lighting) {
  const base = gradeColor(hexToRgb(hex), lighting);
  const lift = (lighting.brightness - 1) * 14;
  const out = {
    r: clamp(base.r + lift, 0, 255),
    g: clamp(base.g + lift, 0, 255),
    b: clamp(base.b + lift, 0, 255),
  };
  out.css = rgbToCss(out);
  out.shade = rgbToCss({ r: out.r * 0.6, g: out.g * 0.6, b: out.b * 0.6 });
  return out;
}

// Build a canvas-space radial/linear gradient string generator for shading.
export function hairShadeGradient(ctx, top, bottom, colorBase, colorShade) {
  const grad = ctx.createLinearGradient(top.x, top.y, bottom.x, bottom.y);
  grad.addColorStop(0, colorShade);
  grad.addColorStop(0.55, colorBase.css);
  grad.addColorStop(1, colorBase.highlight);
  return grad;
}

function clamp(v, min, max) {
  return v < min ? min : v > max ? max : v;
}

export { hexToRgb, rgbToCss };
