const seo = {
  title: "Profile Picture Maker — Free Online DP Editor",
  h1: "Profile Picture Maker",
  metaDescription:
    "Free profile picture maker: crop to 1:1, 4:5 or 9:16, add an Instagram ring or #OPENTOWORK frame, and export PNG, JPG or WebP up to 512px.",
  intro:
    "The Profile Picture Maker composites your photo on an HTML5 canvas. Your image loads from a local object URL, is drawn with the Canvas 2D API, and is adjusted through the browser's native ctx.filter pipeline — brightness, contrast, saturate and blur — before being clipped to a circular mask and exported with canvas.toDataURL. Frames, text, crop, zoom and export all render on your own device, so no upload is involved in those steps. The one exception is the Remove Background button (and the Style Presets that call it), which sends your original file through AltFTool's server to the remove.bg API and returns the cut-out image.",
  useCases: [
    "Turning a phone selfie into a clean LinkedIn headshot — background removed, white backdrop, 1:1 crop, slight contrast lift",
    "Adding the green #OPENTOWORK ring or an Instagram-style gradient ring to an existing profile photo without installing an app",
    "Exporting matching avatars at the right pixel size for Discord, a forum, or a website — 64px to 512px, PNG with transparent corners",
  ],
  benefits: [
    [
      "Editing runs in your browser",
      "Crop, zoom, filters, frames, text overlay and export are all Canvas 2D operations on your own device — the photo is not uploaded for any of them. Only the Remove Background button sends your file to a server.",
    ],
    [
      "Platform frames drawn to spec",
      "One click strokes the Instagram gradient ring (#feda75 through #962fbf) or the green #00a86b ring with \"#OPENTOWORK\" curved letter-by-letter along the bottom arc, at whatever border thickness you set from 0 to 30px.",
    ],
    [
      "Export the exact size and format you need",
      "Output size runs 64px to 512px in 32px steps at 1:1, 4:5 or 9:16, exported as lossless PNG with transparency preserved, or JPG/WebP with a 0.5–1.0 quality slider.",
    ],
    [
      "Presets persist between visits",
      "Save up to 10 combinations of zoom, brightness, contrast, saturation, background colour, frame, border width and text — they are stored in your browser's localStorage and reload the next time you open the tool.",
    ],
  ],
  faqs: [
    [
      "Is this profile picture maker free?",
      "Yes — free, no account, no watermark, and no cap on how many pictures you export. The only limited feature is Remove Background, which is rate-limited to 5 requests per minute because it calls an external background-removal service.",
    ],
    [
      "How do I make an #OPENTOWORK profile picture?",
      "Upload your photo, open Frame & Effects and click \"Open to Work\". The tool strokes a green #00a86b circle around your image and draws \"#OPENTOWORK\" character by character along the bottom arc, each letter rotated to the tangent. Set the ring thickness with the Border Thickness slider (0–30px), then download.",
    ],
    [
      "How do I get a white background for a LinkedIn profile picture?",
      "Click the LinkedIn style preset. It runs background removal on your upload, then sets a solid white (#ffffff) backdrop with brightness 105, contrast 110 and saturation 100 at 1:1. Because that preset calls the background remover, it does send your photo to the server — if you want to stay fully local, set Background to Solid and pick white manually instead.",
    ],
    [
      "What size should a profile picture be?",
      "256px at 1:1 is the default here and covers most platforms. The size slider goes from 64px to 512px in 32px steps, and you can switch the frame to 4:5 or 9:16 if you're exporting for a feed post rather than an avatar. The image is masked to a circle, so PNG keeps the corners transparent.",
    ],
    [
      "Is my photo uploaded anywhere?",
      "Only if you use Remove Background. Loading, cropping, filtering, framing, adding text and downloading all happen on the canvas in your browser. Remove Background — and the six Style Presets, which each call it — posts your original file to AltFTool's server, which forwards it to the remove.bg API and returns the cut-out; skip that button if you don't want the file to leave your device.",
    ],
    [
      "What formats can I download the profile picture in?",
      "PNG, JPG and WebP. PNG is lossless and preserves the transparent area outside the circular crop; JPG and WebP add a quality slider from 0.5 to 1.0, defaulting to 0.9. The file saves as avatar.png, avatar.jpg or avatar.webp.",
    ],
    [
      "Is the \"AI Enhancement\" panel actually AI?",
      "No — those controls are deterministic canvas adjustments, not a machine-learning model. Auto Enhance reads your current sliders and moves brightness, contrast and saturation to roughly 110/115/115 (further if a value is unusually low or high), and Face Focus simply zooms the canvas to 1.28x so the face fills more of the frame.",
    ],
    [
      "Can I put my name on my profile picture?",
      "Yes. The Text Overlay panel takes a name line and a title line, both drawn in bold Arial across the bottom of the canvas. Text size is adjustable from 12px to 40px and the colour comes from a standard colour picker.",
    ],
  ],
  steps: [
    "Drop a photo onto the upload box or click to choose one — it loads straight into the canvas from your device.",
    "Set size, zoom, crop offset and background, then add a frame such as the Instagram ring or the #OPENTOWORK arc, plus any text overlay.",
    "Choose PNG, JPG or WebP under Export Options and click Download — the picture saves as avatar.<format>.",
  ],
};

export default seo;
