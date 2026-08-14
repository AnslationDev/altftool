const seo = {
  title: "Animated WebP / APNG Builder – Loop Two Images",
  metaDescription:
    "Turn two stills into a looping animated WebP or APNG in your browser with FFmpeg WebAssembly — 800px wide, 12fps, one second per frame, no upload.",
  steps: [
    "Choose the first frame under Source file and the second frame under Secondary file — any image the browser opens works.",
    "Pick webp or apng in the Output dropdown and press Process locally; the FFmpeg WebAssembly engine loads and encodes in the browser.",
    "The finished loop downloads as altftool-animated-webp-apng-builder.webp or .png — 800 px wide, 12 fps, one second per frame, looping forever.",
  ],
  intro:
    "The Animated WebP/APNG Builder turns two still images into a single looping animation, encoded in the browser by FFmpeg compiled to WebAssembly. Each source frame is held for one second, the pair is concatenated and scaled to 800 pixels wide with the height kept proportional and even, and the result is written at 12 fps with an infinite loop flag — as an animated WebP, or as an APNG saved with a .png extension. The finished file downloads straight to your machine; the images are never uploaded.",
  useCases: [
    "You have a before-and-after product shot and want a two-frame loop for a landing page, without the colour banding a GIF would introduce",
    "You need a small looping avatar or badge for a forum that accepts APNG but rejects video files",
    "You are comparing two versions of a chart or UI screenshot and want them to alternate automatically instead of sitting side by side",
  ],
  benefits: [
    ["Real encoder, not a GIF fallback", "FFmpeg runs in WebAssembly locally, so you get genuine animated WebP or APNG output with full colour rather than a 256-colour palette."],
    ["Predictable output settings", "800 px wide, 12 fps, one second per frame, infinite loop — the same every time, so results are reproducible."],
    ["Nothing is uploaded", "Both source images are written to an in-browser filesystem, processed, and deleted; the only thing that leaves is the file you download."],
  ],
  faqs: [
    [
      "What is the difference between animated WebP and APNG?",
      "Both carry full 24-bit colour and 8-bit alpha transparency, unlike GIF's 256-colour palette and 1-bit alpha. WebP usually produces smaller files because it uses lossy and lossless compression modes; APNG is a PNG extension, so it is always lossless and larger, but it degrades gracefully to a still first frame in software that does not understand the animation.",
    ],
    [
      "Why does my APNG download as a .png file?",
      "Because that is what an APNG is — the Animated PNG format reuses the PNG container and the .png extension, with the animation carried in extra chunks. Browsers and image viewers that support APNG will play it; anything that does not will show the first frame as an ordinary PNG.",
    ],
    [
      "How long is the animation and how many frames does it use?",
      "Two frames, one second each, encoded at 12 fps and looping forever. Each source image is held for a full second before the next, so the complete cycle is two seconds long.",
    ],
    [
      "Should I use animated WebP or GIF on a website?",
      "Animated WebP for almost any modern site — it is supported across current browsers and typically produces files several times smaller than an equivalent GIF at better quality, because GIF is limited to 256 colours per frame and cannot do partial transparency. GIF is still the safer choice only where you need maximum compatibility with old software or platforms that re-encode uploads.",
    ],
  ],
};

export default seo;
