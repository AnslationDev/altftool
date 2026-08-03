const seo = {
  title: "Cartoon Yourself — Free Photo to Cartoon Editor",
  h1: "Cartoon Yourself: Turn Your Photo Into a Cartoon",
  metaDescription:
    "Turn a photo into a cartoon with 11 style presets — anime, comic, sketch, pop art. Runs in your browser: no upload, no signup. Export PNG, JPG or WEBP.",
  intro:
    "Cartoon Yourself restyles a photo into a cartoon look using 11 filter presets applied to an HTML canvas through the browser's CanvasRenderingContext2D.filter property — each style is a tuned stack of contrast(), saturate(), brightness() and, for the pencil styles, grayscale(). It is a filter effect, not a generative AI model: your photo is redrawn with new colour and contrast rather than repainted as an illustration, which is why the result appears instantly. The image is read locally with URL.createObjectURL and drawn on your own device, so nothing is uploaded to a server and no account is needed.",
  useCases: [
    "Making a cartoon-style profile picture or avatar from a selfie without sending the photo to a third-party service",
    "Creators and streamers turning a headshot into a bold comic-book or pop-art thumbnail in a few seconds",
    "Converting a portrait to a grayscale pencil-sketch or watercolour look for a card, print or class project",
  ],
  benefits: [
    [
      "Eleven one-click cartoon styles",
      "Classic Cartoon, Anime, Comic Book, Sketch, Pencil Art, Watercolour, Pixar Inspired, 3D Cartoon, Minimal, Pop Art and Flat Illustration — each a fixed contrast/saturation/brightness recipe, so Pop Art pushes saturation to 200% while Sketch drops to full grayscale at 160% contrast.",
    ],
    [
      "Nothing is uploaded",
      "The photo is loaded from your device with a local object URL and rendered on a canvas in the page. The tool makes no network requests with your image, stores nothing, and needs no signup.",
    ],
    [
      "Full-resolution, watermark-free export",
      "The canvas is sized to the photo's own pixel width and height, so Download HD saves at the source resolution — lossless PNG, or JPEG/WEBP with a quality slider from 10% to 100% (default 90%). You can also copy the result to the clipboard as a PNG or send it straight to a printer.",
    ],
    [
      "Live before/after comparison",
      "Drag the divider over the preview to wipe between the original and the cartoon version, and watch brightness, contrast, saturation, sharpness and smoothness sliders redraw the canvas about 30 ms after each change.",
    ],
  ],
  faqs: [
    [
      "How do I cartoon myself from a photo for free?",
      "Drop a JPG, PNG or WEBP photo onto the upload box, pick one of the 11 cartoon styles, then click Download HD. It is free, there is no signup, no watermark and no limit on how many photos you convert — the whole effect is rendered in your browser.",
    ],
    [
      "Does this cartoon photo tool use AI?",
      "No. It applies canvas filter presets — combinations of contrast, saturation, brightness and grayscale — rather than a generative model that redraws your face. That means it will not turn you into a hand-drawn illustration or invent new features; it restyles the real photo, which is why it is instant, private and free with no queue or credits.",
    ],
    [
      "Are my photos uploaded or stored anywhere?",
      "No. The file is read locally with URL.createObjectURL and painted onto a canvas element on your device. The tool sends no image data to AltFTool or any external API, and nothing is saved after you close the tab.",
    ],
    [
      "What image formats and file size does it accept?",
      "JPG, PNG and WEBP. The file picker is set to image/jpeg, image/png and image/webp, and the upload box is sized for photos up to about 10 MB. On a phone, the Camera button opens the front camera so you can shoot the photo directly instead of choosing a file.",
    ],
    [
      "Which cartoon style works best for a profile picture?",
      "Comic Book (160% contrast) and Pop Art (200% saturation) give the boldest, most obviously cartoon result — Anime (170% saturation) is nearly as vivid. Pixar Inspired and Flat Illustration keep a more moderate saturation boost and stay closer to natural skin tones, Watercolour and Minimal are the softest overall, and Sketch (full grayscale) or Pencil Art (80% grayscale) produce a drawn, monochrome look.",
    ],
    [
      "Can I adjust the effect after choosing a style?",
      "Yes. Brightness and contrast run from 50 to 200, saturation from 0 to 200, and sharpness and smoothness from 0 to 100 — sharpness stacks extra contrast on top of the style, while smoothness adds up to a 10-pixel blur. Reset restores every slider to its default in one click.",
    ],
    [
      "Can I copy the cartoon image instead of downloading it?",
      "Yes. Copy Image writes a PNG of the finished canvas to your system clipboard using the Clipboard API's ClipboardItem, so you can paste it straight into a chat or document. It needs a browser that supports clipboard image writes, such as recent Chrome or Edge; if that fails, use Download HD instead.",
    ],
    [
      "Does it work on a phone?",
      "Yes. The tool runs in any modern mobile browser — the before/after slider responds to touch, the Camera button uses your phone's front-facing camera, and export works the same as on desktop.",
    ],
  ],
  steps: [
    "Drag a JPG, PNG or WEBP photo onto the upload box, browse for a file, or tap Camera on mobile to take one.",
    "Choose one of the 11 cartoon styles, then fine-tune brightness, contrast, saturation, sharpness and smoothness while the before/after slider updates live.",
    "Pick PNG, JPEG or WEBP, set the export quality, and click Download HD — or copy the image to your clipboard or print it.",
  ],
};

export default seo;
