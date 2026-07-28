const seo = {
  title: "Flip & Rotate Image Online — Free Batch Tool",
  h1: "Image Flip & Rotate Tool",
  metaDescription:
    "Free flip and rotate image tool — any angle from -180° to 180°, mirror, flip, export JPG/PNG/WebP. Up to 20 images at once, nothing uploaded.",
  intro:
    "The Image Flip & Rotate Tool redraws each image onto an HTML canvas using the 2D context's transform stack — a horizontal scale of -1 for a mirror, a vertical scale of -1 for a top-to-bottom flip, and a rotation set anywhere from -180° to 180° in one-degree steps. With \"expand canvas\" on, the output canvas is sized to the rotated bounding box (width·|cos θ| + height·|sin θ| across, width·|sin θ| + height·|cos θ| down), so a straightened scan never loses its corners. Decoding, transforming, and re-encoding all happen on your own device through the canvas API — no image data is sent to a server, and no account is needed.",
  useCases: [
    "Straightening scanned documents, receipts, or book pages that came out tilted by a few degrees",
    "Fixing sideways or upside-down phone photos before uploading them to a listing, form, or CMS",
    "Mirroring selfies, product shots, or thumbnails so the composition and text read the right way round",
  ],
  benefits: [
    [
      "Any angle, not just 90°",
      "Quick buttons handle -90°, +90°, and 180°, while a slider and number field set any whole-degree angle between -180° and 180° for straightening tilted scans and horizons.",
    ],
    [
      "Canvas and background control",
      "Keep the expanded canvas so a rotated image is never clipped, or switch to crop-to-original to hold the source dimensions. The corners rotation exposes can stay transparent or take a solid fill colour.",
    ],
    [
      "Batch of up to 20 images",
      "Queue up to 20 images (35 MB each), apply the same rotation and flip to all of them, then get a single file back or the whole batch as flipped-rotated-images.zip.",
    ],
    [
      "Runs in your browser",
      "Every transform is drawn on a local canvas — no upload, no signup, no cost. Output format (JPEG, PNG, WebP) and quality from 40% to 100% are yours to set.",
    ],
  ],
  faqs: [
    [
      "Does this tool upload my images anywhere?",
      "No. Each image is decoded and redrawn on an HTML canvas inside your own browser, and the result is handed back as a local blob. Nothing is sent to a server, and there is no account or signup step.",
    ],
    [
      "How do I rotate an image online without losing quality?",
      "Rotate by 90°, 180°, or -90° and the pixels are simply remapped, so there is no resampling loss — export as PNG to avoid re-encoding artifacts entirely. Arbitrary angles do resample the image (canvas smoothing is set to high), and JPEG or WebP output re-encodes at the quality you pick, adjustable from 40% to 100% with a default of 92%.",
    ],
    [
      "Why does my image get larger after I rotate it by an angle?",
      "Because the canvas expands to fit the rotated bounding box so the corners are not cut off — rotating a square 45°, for example, makes the canvas about 1.41x wider and taller. Untick \"Expand canvas to fit rotation\" to keep the original dimensions and let the corners crop instead.",
    ],
    [
      "How do I mirror an image horizontally?",
      "Click Mirror to flip the image left-to-right, or Flip Vertical to flip it top-to-bottom. Both toggles can be combined with each other and with a rotation, and the Active transform readout shows exactly which operations are queued before you export.",
    ],
    [
      "Can I flip or rotate multiple images at once?",
      "Yes — up to 20 images per batch, 35 MB per image. The rotation, flip, canvas, format, and quality settings apply to every image in the queue; a single image downloads as one file, and two or more are packaged into flipped-rotated-images.zip.",
    ],
    [
      "What image formats does it support?",
      "It reads anything your browser can decode — JPG, PNG, WebP, AVIF, and the first frame of an animated GIF — and exports as JPEG, PNG, or WebP. \"Keep Source\" maps JPG to JPEG, WebP to WebP, and everything else to PNG.",
    ],
    [
      "Does rotating an image remove EXIF data?",
      "Yes. The exported file is re-encoded from the canvas, so EXIF metadata such as camera model, timestamp, and GPS coordinates is not carried into the output. Keep your original file if you need that metadata preserved.",
    ],
    [
      "Can I keep a transparent background when I rotate an image?",
      "Yes, when exporting to PNG or WebP — tick \"Transparent background when possible\" and the corner areas exposed by rotation stay transparent. JPEG has no alpha channel, so with JPEG output those areas are filled with the chosen background colour, white by default.",
    ],
  ],
  steps: [
    "Drag in up to 20 images, or click Choose Images to pick them from your device.",
    "Set the angle with the quick buttons or the -180° to 180° slider, toggle Mirror or Flip Vertical, then choose canvas behaviour, background, format, and quality.",
    "Click Preview to check the output dimensions and estimated file size, then Download — one image saves directly, several arrive as a ZIP.",
  ],
};

export default seo;
