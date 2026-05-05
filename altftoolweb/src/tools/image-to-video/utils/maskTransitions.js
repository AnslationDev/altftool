export const MASK_OPTIONS = [
  { value: "none",         label: "None"           },
  { value: "circleReveal", label: "Circle Reveal"  },
  { value: "diagonal",     label: "Diagonal Wipe"  },
  { value: "starReveal",   label: "Star Reveal"    },
  { value: "diamondReveal",label: "Diamond"        },
  { value: "horizontalWipe",label: "Horizontal Wipe"},
  { value: "verticalWipe", label: "Vertical Wipe"  },
];

/**
 * Draws mask transition between two images.
 * p = 0 (transition starts) → 1 (transition complete, nextImg fully visible)
 */
export function drawMaskTransition(ctx, currentImg, nextImg, mask, p, W, H) {
  if (!mask || mask === "none" || !nextImg) return false;

  // Step 1 — draw current image as full background
  ctx.save();
  if (currentImg) {
    drawCoverImage(ctx, currentImg, 0, 0, W, H);
  } else {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, W, H);
  }
  ctx.restore();

  // Step 2 — draw next image clipped to mask shape
  ctx.save();
  ctx.beginPath();
  buildMaskPath(ctx, mask, p, W, H);
  ctx.clip();
  drawCoverImage(ctx, nextImg, 0, 0, W, H);
  ctx.restore();

  return true; // tells drawFrame that transition handled rendering
}

/* ── Build clip path for each mask type ── */
function buildMaskPath(ctx, mask, p, W, H) {
  const eased = easeInOut(p);

  switch (mask) {

    case "circleReveal": {
      // Circle grows from center
      const maxR  = Math.sqrt(W * W + H * H) / 2 + 10;
      const r     = maxR * eased;
      ctx.arc(W / 2, H / 2, r, 0, Math.PI * 2);
      break;
    }

    case "diagonal": {
      // Diagonal wipe — top-left to bottom-right
      const total = W + H;
      const pos   = total * eased;
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.min(pos, W), 0);
      ctx.lineTo(Math.max(0, pos - H), H);
      ctx.lineTo(0, H);
      ctx.closePath();
      break;
    }

    case "horizontalWipe": {
      // Left to right
      ctx.rect(0, 0, W * eased, H);
      break;
    }

    case "verticalWipe": {
      // Top to bottom
      ctx.rect(0, 0, W, H * eased);
      break;
    }

    case "diamondReveal": {
      // Diamond (rotated square) from center
      const size = Math.max(W, H) * 1.5 * eased;
      const cx = W / 2, cy = H / 2;
      ctx.moveTo(cx,          cy - size / 2);
      ctx.lineTo(cx + size / 2, cy);
      ctx.lineTo(cx,          cy + size / 2);
      ctx.lineTo(cx - size / 2, cy);
      ctx.closePath();
      break;
    }

    case "starReveal": {
      // 5-point star from center
      const outerR = Math.sqrt(W * W + H * H) / 2 * 1.1 * eased;
      const innerR = outerR * 0.45;
      const cx = W / 2, cy = H / 2;
      const points = 5;
      for (let i = 0; i < points * 2; i++) {
        const angle  = (i * Math.PI) / points - Math.PI / 2;
        const r      = i % 2 === 0 ? outerR : innerR;
        const x      = cx + r * Math.cos(angle);
        const y      = cy + r * Math.sin(angle);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.closePath();
      break;
    }

    default:
      ctx.rect(0, 0, W, H);
  }
}

/* ── Cover-fit helper ── */
function drawCoverImage(ctx, img, x, y, w, h) {
  const iW    = img.naturalWidth  || img.width;
  const iH    = img.naturalHeight || img.height;
  const scale = Math.max(w / iW, h / iH);
  const sw    = iW * scale;
  const sh    = iH * scale;
  const dx    = x + (w - sw) / 2;
  const dy    = y + (h - sh) / 2;
  ctx.drawImage(img, dx, dy, sw, sh);
}

/* ── Smooth easing for mask ── */
function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}