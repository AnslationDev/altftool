const seo = {
  title: "AI Selfie Enhancer: 79 Presets, Split",
  metaDescription:
    "Adjust brightness, contrast and saturation 50–150% plus 0–10 smoothing, compare on a split slider, export full-resolution JPEG in your browser.",
  intro:
    "AI Selfie Enhancer retouches a portrait with four controls — brightness, contrast and saturation from 50% to 150%, plus a 0–10 smoothing amount applied as a Gaussian blur — and layers 79 one-click presets on top, from a barely-there natural look to studio, cinematic and glamour finishes. A draggable split slider shows the original and the edited version side by side in the same frame, and the export re-renders the same filter chain onto a full-resolution canvas so the download matches what you previewed. The photo is never uploaded; every pixel operation happens on a canvas in your tab.",
  useCases: [
    "You have one usable photo for a work profile and it was shot under yellow office light that needs lifting without turning your skin orange",
    "A group selfie came out flat and underexposed, and you want to fix brightness and contrast without installing an app that wants an account",
    "You want to see exactly how much retouching a preset applied before you post the photo, using a side-by-side wipe rather than toggling back and forth",
  ],
  benefits: [
    [
      "Presets you can then take over",
      "Each of the 79 presets simply sets the four sliders, so you can start from a look and dial any part of it back instead of accepting a fixed result.",
    ],
    [
      "Honest before/after comparison",
      "The split slider clips the original over the edited image in the same position and scale, so you are comparing the same pixels rather than two separate previews.",
    ],
    [
      "Export at the original resolution",
      "The download redraws the source at its full natural width and height with the same filter string, saved as JPEG at quality 0.95 — no downscaling to a preview size.",
    ],
  ],
  faqs: [
    [
      "How strong should skin smoothing be?",
      "Start between 1 and 2 on the 0–10 scale; the smoothing value is halved to set the blur radius, so a setting of 2 is a 1-pixel blur. Anything above about 3 starts erasing real skin texture and reads as artificial, especially on a large screen or in print.",
    ],
    [
      "Does it change my face shape or features?",
      "No. All four controls are global image adjustments — brightness, contrast, saturation and blur — applied uniformly across the frame. Nothing detects, reshapes, slims or repositions facial features, so the person in the photo stays the person in the photo.",
    ],
    [
      "Is my photo uploaded to a server?",
      "No. The preview uses CSS filters on the image element and the export draws to an HTML canvas locally, so the file never leaves the browser. There is no account, no gallery and no copy kept.",
    ],
    [
      "Why does my exported image look slightly different from the preview?",
      "Both use the same filter chain, but the preview is scaled to fit the screen while the export runs at full resolution — so blur, which is measured in pixels, covers proportionally less of a large image. If the smoothing looks weaker in the download, raise the value a step and export again.",
    ],
  ],
};

export default seo;
