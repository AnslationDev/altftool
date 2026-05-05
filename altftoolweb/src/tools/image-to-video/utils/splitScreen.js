export const SPLIT_LAYOUTS = [
  { value: "none",       label: "Off"             },
  { value: "side-by-side", label: "Side by Side"  },
  { value: "top-bottom",   label: "Top / Bottom"  },
  { value: "trio",          label: "Trio (3-col)"  },
  { value: "before-after",  label: "Before / After"},
  { value: "collage",       label: "Collage"       },
];


export function getLayoutSlots(layout, W, H) {
  const GAP = 6; // px gap between panes

  switch (layout) {
    case "side-by-side": {
      const colW = (W - GAP) / 2;
      return [
        { x: 0,          y: 0, w: colW,  h: H },
        { x: colW + GAP, y: 0, w: colW,  h: H },
      ];
    }
    case "top-bottom": {
      const rowH = (H - GAP) / 2;
      return [
        { x: 0, y: 0,          w: W, h: rowH },
        { x: 0, y: rowH + GAP, w: W, h: rowH },
      ];
    }
    case "trio": {
      const colW = (W - GAP * 2) / 3;
      return [
        { x: 0,                  y: 0, w: colW, h: H },
        { x: colW + GAP,         y: 0, w: colW, h: H },
        { x: (colW + GAP) * 2,   y: 0, w: colW, h: H },
      ];
    }
    case "before-after": {
      const leftW  = W * 0.55 - GAP / 2;
      const rightW = W - leftW - GAP;
      return [
        { x: 0,           y: 0, w: leftW,  h: H },
        { x: leftW + GAP, y: 0, w: rightW, h: H },
      ];
    }
    case "collage": {
      const leftW  = W * 0.58 - GAP / 2;
      const rightW = W - leftW - GAP;
      const rowH   = (H - GAP) / 2;
      return [
        { x: 0,           y: 0,          w: leftW,  h: H     }, // big
        { x: leftW + GAP, y: 0,          w: rightW, h: rowH  }, // top-right
        { x: leftW + GAP, y: rowH + GAP, w: rightW, h: rowH  }, // bottom-right
      ];
    }
    default:
      return [];
  }
}

export function coverFit(img, slot) {
  const iW    = img.naturalWidth  || img.width;
  const iH    = img.naturalHeight || img.height;
  const scale = Math.max(slot.w / iW, slot.h / iH);
  const sw    = iW * scale;
  const sh    = iH * scale;
  const sx    = slot.x + (slot.w - sw) / 2;
  const sy    = slot.y + (slot.h - sh) / 2;
  return { sx, sy, sw, sh };
}