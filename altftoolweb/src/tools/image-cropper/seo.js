const seo = {
  title: "Image Cropper — Crop Images Online Free, No Upload",
  h1: "Image Cropper",
  metaDescription:
    "Crop images online free — drag to frame, lock 1:1, 4:3, 16:9 or 9:16, rotate, flip, filter, then export JPG or PNG. Runs in your browser; nothing uploads.",
  intro:
    "The Image Cropper frames your selection with react-easy-crop and renders the result on an HTML5 canvas: the chosen region is drawn through the Canvas 2D drawImage() source rectangle, rotation and flips are applied with ctx.rotate() and ctx.scale(), and brightness, contrast, saturation and grayscale go through ctx.filter. The finished crop is encoded by canvas.toBlob() as JPEG at 0.8 quality, scaled down proportionally if it exceeds 1000 × 1000 pixels. Your file is read locally with the browser's FileReader API — no image data is sent to a server, and there is no signup.",
  useCases: [
    "Cutting a photo down to a square 1:1 profile picture or a 9:16 vertical story frame using the built-in social presets",
    "Reframing a screenshot or scan — rotate in 90-degree steps, flip it, and use the rule-of-thirds overlay to place the subject",
    "Trimming dead space from a photo and compressing it before attaching it to a form or email with a file-size limit",
  ],
  benefits: [
    [
      "Aspect-ratio presets",
      "Lock the crop box to 1:1, 3:4, 4:3, 16:9, 9:16 or 4:1 — or crop freehand in Free mode — with one-tap Instagram, mobile story, YouTube and LinkedIn buttons.",
    ],
    [
      "Rotate, flip and colour controls",
      "Rotate in 90-degree steps, flip horizontally or vertically, and adjust brightness, contrast, saturation and grayscale. Every adjustment is baked into the exported file, not just the preview.",
    ],
    [
      "Composition overlays and undo",
      "A rule-of-thirds grid and centre crosshair sit over the frame, the crop snaps to dead centre when you get close, and Undo steps back through crop, zoom, rotation, flip and filter changes one at a time.",
    ],
    [
      "Runs in your browser",
      "The image is read with FileReader and cropped on a canvas on your own device. Nothing is uploaded to any server, and the tool is free with no signup.",
    ],
  ],
  faqs: [
    [
      "How do I crop an image to a perfect square without Photoshop?",
      "Pick the 1:1 preset (or the Instagram button), drag and zoom to frame the part you want, then press Crop & Optimize Image. The crop box stays locked to a square while you pan, and you can download the result as JPG or PNG.",
    ],
    [
      "Does this image cropper upload my photo anywhere?",
      "No. The file is read locally with the browser's FileReader API and cropped on an HTML canvas on your own device. No image data is sent to a server, and no account is required.",
    ],
    [
      "What size is the cropped image?",
      "Up to 1000 x 1000 pixels. If the region you select is larger, it is scaled down proportionally to fit inside 1000 x 1000 before export, so your chosen aspect ratio is preserved. At download you can additionally pick Original, Medium (75%) or Small (50%).",
    ],
    [
      "Can I crop a PNG and keep the transparent background?",
      "No — transparency is not preserved. The canvas is filled white before the crop is drawn and the crop is encoded as JPEG, so transparent areas come out white. You can still save the file with a .png extension, but the white background is already baked in.",
    ],
    [
      "Which aspect ratios does it support?",
      "1:1, 3:4, 4:3, 16:9, 9:16 and 4:1, plus a Free mode with no ratio lock. The preset buttons map Instagram to 1:1, mobile story to 9:16, YouTube to 16:9 and LinkedIn banner to 4:1.",
    ],
    [
      "Can I make the cropped file smaller?",
      "Yes. After cropping, the Image Compression panel re-encodes the result as JPEG at the quality you choose (0.1 to 1.0, default 0.7) and caps the width at 1200 pixels. If the first pass is not smaller than the original crop, quality steps down by 0.1 until it is, or until it reaches 0.3.",
    ],
    [
      "Can I zoom in before cropping?",
      "Yes — the zoom slider runs from 1x to 3x in 0.1 steps, and you can drag the image to pan under the crop box. Quick Center, Top, Bottom, Left and Right buttons jump the crop position without dragging.",
    ],
    [
      "Is the Image Cropper free?",
      "Yes — free, no signup, and no cap on how many images you crop. It accepts JPG, PNG, GIF and any other format your browser can decode, and exports JPG or PNG.",
    ],
  ],
  steps: [
    "Drop in an image or click to browse — JPG, PNG, GIF and other browser-supported formats work.",
    "Pick an aspect ratio or social preset, drag and zoom (1x to 3x) to frame the shot, then rotate, flip or adjust brightness, contrast, saturation and grayscale.",
    "Press Crop & Optimize Image, optionally apply compression, then download as JPG or PNG at original, 75% or 50% size.",
  ],
};

export default seo;
