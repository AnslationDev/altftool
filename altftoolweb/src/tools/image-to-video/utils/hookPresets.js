export const HOOK_PRESETS = [
  {
    id: "wait-for-it",
    label: "Wait for it…",
    text: "Wait for it…",
    style: "typewriter",
    color: "#ffffff",
    fontSize: 52,
    position: "center",
  },
  {
    id: "dont-skip",
    label: "Don't skip",
    text: "Don't skip",
    style: "bounce",
    color: "#FFD700",
    fontSize: 56,
    position: "center",
  },
  {
    id: "watch-till-end",
    label: "Watch till end",
    text: "Watch till end",
    style: "fadeSlideUp",
    color: "#FF6B35",
    fontSize: 50,
    position: "center",
  },
  {
    id: "trust-me",
    label: "Trust me on this",
    text: "Trust me on this",
    style: "pulse",
    color: "#ffffff",
    fontSize: 48,
    position: "center",
  },
  {
    id: "you-need-this",
    label: "You need this",
    text: "You need this",
    style: "zoomPop",
    color: "#00E5FF",
    fontSize: 54,
    position: "center",
  },
  {
    id: "custom",
    label: "Custom text…",
    text: "",
    style: "fadeSlideUp",
    color: "#ffffff",
    fontSize: 48,
    position: "center",
  },
];

export const HOOK_STYLES = [
  { value: "typewriter",  label: "Typewriter"   },
  { value: "bounce",      label: "Bounce"       },
  { value: "fadeSlideUp", label: "Fade + Slide" },
  { value: "pulse",       label: "Pulse"        },
  { value: "zoomPop",     label: "Zoom Pop"     },
];

export const HOOK_POSITIONS = [
  { value: "top",    label: "Top"    },
  { value: "center", label: "Center" },
  { value: "bottom", label: "Bottom" },
];

export function drawHookText(ctx, hook, p, W, H) {
  if (!hook || !hook.enabled || !hook.text) return;

  const hookDur = hook.duration ?? 0.45;

  // Only show during first `hookDur` fraction of slide
  if (p > hookDur) return;

  // Local progress within hook window (0→1)
  const hp = Math.min(1, p / hookDur);

  ctx.save();

  const fontSize  = hook.fontSize  ?? 52;
  const color     = hook.color     ?? "#ffffff";
  const style     = hook.style     ?? "fadeSlideUp";
  const position  = hook.position  ?? "center";

  // Y position
  const yMap = {
    top:    H * 0.18,
    center: H * 0.5,
    bottom: H * 0.82,
  };
  const baseY = yMap[position] ?? H * 0.5;

  ctx.font         = `bold ${fontSize}px Arial`;
  ctx.textAlign    = "center";
  ctx.textBaseline = "middle";

  // Background pill behind text
  const metrics  = ctx.measureText(hook.text);
  const textW    = metrics.width;
  const padX     = 28, padY = 16;

  // Apply animation style
  let x = W / 2;
  let y = baseY;
  let alpha = 1;
  let scale = 1;

  switch (style) {
    case "typewriter": {
      // Reveal characters one by one
      const visibleChars = Math.floor(hp * hook.text.length);
      const visible = hook.text.slice(0, visibleChars);
      drawPill(ctx, x, y, ctx.measureText(visible).width, padX, padY, fontSize, 0.55);
      ctx.fillStyle = color;
      ctx.fillText(visible, x, y);
      ctx.restore();
      return;
    }
    case "bounce": {
      const bounceY = Math.abs(Math.sin(hp * Math.PI * 3)) * 18;
      y = baseY - bounceY * (1 - hp);
      alpha = Math.min(1, hp * 3);
      break;
    }
    case "fadeSlideUp": {
      y = baseY + 40 * (1 - hp);
      alpha = Math.min(1, hp * 2.5);
      break;
    }
    case "pulse": {
      scale = 0.92 + 0.08 * Math.sin(hp * Math.PI * 4);
      alpha = Math.min(1, hp * 2);
      break;
    }
    case "zoomPop": {
      // Overshoot scale: zooms past 1 then settles
      if (hp < 0.35) {
        scale = hp / 0.35 * 1.25;
      } else {
        scale = 1.25 - (hp - 0.35) / 0.65 * 0.25;
      }
      alpha = Math.min(1, hp * 3);
      break;
    }
  }

  ctx.globalAlpha = alpha;
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  // Draw pill bg
  drawPill(ctx, 0, 0, textW, padX, padY, fontSize, 0.55);

  // Draw text
  ctx.fillStyle = color;
  ctx.fillText(hook.text, 0, 0);

  ctx.restore();
}

function drawPill(ctx, x, y, textW, padX, padY, fontSize, bgAlpha) {
  const pillW = textW + padX * 2;
  const pillH = fontSize + padY * 2;
  ctx.save();
  ctx.fillStyle = `rgba(0,0,0,${bgAlpha})`;
  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(x - pillW / 2, y - pillH / 2, pillW, pillH, pillH / 2);
  } else {
    ctx.rect(x - pillW / 2, y - pillH / 2, pillW, pillH);
  }
  ctx.fill();
  ctx.restore();
}