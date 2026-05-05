export const ENTRY_OPTIONS = [
  { value: "none",      label: "None"       },
  { value: "fadeIn",    label: "Fade In"    },
  { value: "slideUp",   label: "Slide Up"   },
  { value: "slideLeft", label: "Slide Left" },
  { value: "zoomIn",    label: "Zoom In"    },
  { value: "blurIn",    label: "Blur In"    },
];

export const EXIT_OPTIONS = [
  { value: "none",       label: "None"        },
  { value: "fadeOut",    label: "Fade Out"    },
  { value: "slideDown",  label: "Slide Down"  },
  { value: "slideRight", label: "Slide Right" },
  { value: "zoomOut",    label: "Zoom Out"    },
  { value: "blurOut",    label: "Blur Out"    },
];


export function applyEntry(ctx, type, p, W, H) {
  if (!type || type === "none" || p >= 1) return;

  switch (type) {
    case "fadeIn":
      ctx.globalAlpha *= p;
      break;

    case "slideUp":
      ctx.translate(0, H * 0.18 * (1 - p));
      ctx.globalAlpha *= Math.min(1, p * 2);
      break;

    case "slideLeft":
      ctx.translate(W * 0.18 * (1 - p), 0);
      ctx.globalAlpha *= Math.min(1, p * 2);
      break;

    case "zoomIn": {
      const s = 0.82 + 0.18 * p;
      ctx.translate(W / 2, H / 2);
      ctx.scale(s, s);
      ctx.translate(-W / 2, -H / 2);
      ctx.globalAlpha *= Math.min(1, p * 1.5);
      break;
    }

    case "blurIn":
     
      ctx.globalAlpha *= p * p;
      break;
  }
}

export function applyExit(ctx, type, p, W, H) {
  if (!type || type === "none" || p <= 0) return;

  switch (type) {
    case "fadeOut":
      ctx.globalAlpha *= 1 - p;
      break;

    case "slideDown":
      ctx.translate(0, H * 0.18 * p);
      ctx.globalAlpha *= 1 - Math.min(1, p * 2);
      break;

    case "slideRight":
      ctx.translate(W * 0.18 * p, 0);
      ctx.globalAlpha *= 1 - Math.min(1, p * 2);
      break;

    case "zoomOut": {
      const s = 1 - 0.18 * p;
      ctx.translate(W / 2, H / 2);
      ctx.scale(s, s);
      ctx.translate(-W / 2, -H / 2);
      ctx.globalAlpha *= 1 - Math.min(1, p * 1.5);
      break;
    }

    case "blurOut":
      ctx.globalAlpha *= (1 - p) * (1 - p);
      break;
  }
}

export function computeTransitionProgress(p, entryFrac = 0.2, exitFrac = 0.2) {
  const entryProgress = entryFrac > 0 ? Math.min(1, p / entryFrac) : 1;
  const exitProgress  = exitFrac  > 0 ? Math.max(0, (p - (1 - exitFrac)) / exitFrac) : 0;
  return { entryProgress, exitProgress };
}