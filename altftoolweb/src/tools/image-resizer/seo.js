const seo = {
  title: "Image Resizer — Free Batch Resize in Your Browser",
  h1: "Image Resizer",
  metaDescription:
    "Resize images to exact pixel dimensions or social presets — fit, fill-crop, or stretch. Export JPEG/PNG/WebP, batch up to 20 images. Runs in your browser.",
  intro:
    "The Image Resizer redraws your photo onto an HTML5 canvas at the exact target size using the 2D context's drawImage(), with imageSmoothingQuality set to \"high\" so downscaled edges stay clean, then exports the result through canvas.toBlob() at the quality you choose. Fit mode scales by the smaller of the two width/height ratios and pads the leftover space with your background colour; Fill Crop scales by the larger ratio and crops the overflow; Stretch forces the exact dimensions without preserving the aspect ratio. Everything — decoding, resizing, format conversion, and the JSZip packaging for batches — happens on your own device, so no image is uploaded to a server. It is free and needs no signup.",
  useCases: [
    "Resizing a photo to a platform's exact requirement — 1080x1080 for an Instagram square, 1280x720 for a YouTube thumbnail, 1000x1500 for a Pinterest pin",
    "Preparing a folder of product shots at one uniform size (for example 2000x2000 for a marketplace listing) and downloading them as a single ZIP",
    "Making a hero or banner image fit a fixed layout slot by cropping to fill, or by fitting the whole image with padded background",
  ],
  benefits: [
    [
      "Exact pixels or a percentage",
      "Type a width and height with aspect ratio locked, scale by 1–300% of the original, or tick the retina option to export at 2x the dimensions you entered.",
    ],
    [
      "15 platform presets",
      "Instagram square, portrait and story, TikTok, YouTube thumbnail, X, LinkedIn, Facebook cover, Pinterest, website banner, blog card, and ecommerce sizes are prefilled.",
    ],
    [
      "Fit, fill crop, or stretch",
      "Pick whether the whole image is kept with padding, cropped to fill the canvas edge to edge, or forced to the exact dimensions.",
    ],
    [
      "Batch export with no upload",
      "Queue up to 20 images, resize them in one pass, and download a ZIP that also includes a text summary of every output — all processed locally by your browser.",
    ],
  ],
  faqs: [
    [
      "How do I resize an image to exact pixel dimensions?",
      "Enter the width and height you need in the resize settings and download. Aspect ratio is locked by default, so typing a width updates the height to match — untick \"Lock aspect ratio\" if you want to set both independently, then choose Fit, Fill Crop, or Stretch to control how the image maps onto that canvas.",
    ],
    [
      "Does resizing an image online upload it to a server?",
      "No. The resize runs entirely in your browser using the Canvas API, and the ZIP for batches is built locally with JSZip, so your images never leave your device. The tool is free with no signup and no watermark.",
    ],
    [
      "What is the difference between fit, fill crop, and stretch?",
      "Fit scales the image down until it fits entirely inside the canvas and fills the remaining space with your chosen background colour, so nothing is cut off. Fill Crop scales until the canvas is completely covered and trims the overflow, so nothing is padded but edges are lost. Stretch forces the exact width and height and will distort the image if the ratio does not match.",
    ],
    [
      "Can I resize multiple images at once?",
      "Yes — up to 20 images per batch, each up to 35 MB. A single image downloads as one file; two or more are packaged into resized-images.zip along with a resize-summary.txt listing the preset, mode, format, and every source dimension.",
    ],
    [
      "What size should I resize my image to for Instagram or YouTube?",
      "The built-in presets cover the common ones: Instagram square 1080x1080, portrait 1080x1350, story and reel 1080x1920, TikTok video 1080x1920, YouTube thumbnail 1280x720, X post 1600x900, LinkedIn post 1200x1200, Facebook cover 1640x624, and Pinterest pin 1000x1500. Selecting a preset fills the width and height for you.",
    ],
    [
      "Will resizing make my image blurry?",
      "Shrinking an image stays sharp — the canvas resamples with high-quality smoothing. Enlarging past the original resolution cannot add detail and will look soft, so tick \"Avoid upscaling source pixels\" to cap the scale at 100% in Fit and Fill Crop modes and keep the source pixels intact.",
    ],
    [
      "Can I resize a transparent PNG without losing the transparency?",
      "Yes. Keep the format as PNG or WebP and turn on \"Transparent background when possible\" — the canvas is cleared instead of filled. JPEG has no alpha channel, so if you export to JPEG the transparent areas are filled with white.",
    ],
    [
      "Does resizing remove EXIF data from a photo?",
      "Yes. Because the output is re-encoded from a canvas, metadata including EXIF and GPS location is stripped from the exported file. Animated GIFs also export as the single still frame the browser decoded, not as animation.",
    ],
  ],
  steps: [
    "Drop in your images or click Choose Images — JPG, PNG, WebP, AVIF, and other browser-readable formats, up to 20 files at 35 MB each.",
    "Pick a social preset or type an exact width and height, then choose Fit, Fill Crop, or Stretch, an output format (JPEG, PNG, WebP, or keep source), and a quality between 40% and 100%.",
    "Click Preview to check the result against the original dimensions, then Download — one image saves directly, several are bundled into a ZIP.",
  ],
};

export default seo;
