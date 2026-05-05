export const ANIMATION_OPTIONS = [
  { value: "none",     label: "No Motion" }, 
  { value: "auto",     label: "Smart Auto" },
  { value: "zoomIn",   label: "Zoom In"    },
  { value: "zoomOut",  label: "Zoom Out"   },
  { value: "panLeft",  label: "Pan Left"   },
  { value: "panRight", label: "Pan Right"  },
  { value: "fade",     label: "Fade"       },
  { value: "zoomFade", label: "Zoom Fade"  },
  { value: "kenBurns", label: "Ken Burns"  },
];

export function detectOrientation(img) {
  const r = img.naturalWidth / img.naturalHeight;
  if (r > 1.15) return "landscape";
  if (r < 0.87) return "portrait";
  return "square";
}

export function autoAnimation(orientation) {
  if (orientation === "portrait")  return "zoomIn";
  if (orientation === "landscape") return "panLeft";
  return "kenBurns";
}

export function resolveAnimation(slide) {
if (slide.focus) {
  return {
    type: "focus",
    focus: slide.focus,
  };
}

if (slide.animation === "none") {
  return { type: "none" };
}
  const anim =
    slide.animation === "auto"
      ? autoAnimation(slide.orientation)
      : slide.animation;

  switch (anim) {
    case "zoomIn":
      return {
        type: "zoomIn",
        startScale: 1,
        endScale: 1.2,
        focus: slide.focus,
      };

    case "zoomOut":
      return {
        type: "zoomOut",
        startScale: 1.2, 
        endScale: 1,
        focus: slide.focus,
      };

    case "panLeft":
      return {
        type: "panLeft",
        startX: 0,
        endX: -100,
        focus: slide.focus,
      };

    case "panRight":
      return {
        type: "panRight",
        startX: 0,
        endX: 100,
        focus: slide.focus,
      };

    case "kenBurns":
      return {
        type: "kenBurns",
        startScale: 1.1,
        endScale: 1.25,
        driftX: -0.05,
        driftY: -0.05,
        focus: slide.focus,
      };

    case "zoomFade":
      return {
        type: "zoomFade",
        startScale: 1,
        endScale: 1.2,
        fade: true,
        focus: slide.focus,
      };

    case "fade":
      return {
        type: "fade",
        fade: true,
        focus: slide.focus,
      };

    default:
      return {
        type: "zoomIn",
        startScale: 1,
        endScale: 1.2,
        focus: slide.focus,
      };
  }
}