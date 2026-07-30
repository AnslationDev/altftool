const seo = {
  intro:
    "This icon studio builds an app icon from a letter or two, a built-in glyph or an uploaded image, styles it with a shape, gradient or solid background, border, shadow and glow, and exports the finished mark as PNG, SVG, a real multi-resolution favicon.ico, or a ZIP pack sized for Android, PWA or general use. The Android pack covers 48, 72, 96, 144, 192 and 512 px, the PWA pack ships 192 and 512 px with a matching manifest-icons.json, and favicon.ico is assembled with 16, 32 and 48 px images inside one file. It is for developers and indie makers who need a complete icon set before a release rather than a single square image.",
  useCases: [
    "You are shipping a side project and need launcher icons at every Android density plus a favicon, without opening a design app",
    "Your PWA fails an install audit because the manifest lacks 192 and 512 px icons, and you want both plus the manifest JSON in one download",
    "You already have a logo PNG and just need it framed on a squircle with a gradient background and re-exported at five sizes",
  ],
  benefits: [
    ["A genuine multi-size .ico", "The favicon is written as a real ICO container holding 16, 32 and 48 px PNG entries, not a single image renamed, so browsers pick the right resolution."],
    ["SVG stays vector", "Text and library-glyph icons export as true SVG with the gradient defined in <defs>, so the mark scales cleanly instead of shipping a raster inside an SVG wrapper."],
    ["Packs come out ready to drop in", "The PWA ZIP includes manifest-icons.json with each src, sizes and type already filled in, so the manifest entry is copy-paste rather than hand-typed."],
  ],
  faqs: [
    [
      "What icon sizes do I need for an Android app?",
      "The pack here exports 48, 72, 96, 144, 192 and 512 px, which covers the mdpi-through-xxxhdpi launcher densities plus the 512 px store listing image. Each is rendered from your design at that exact resolution rather than downscaled from one master, so small sizes stay crisp.",
    ],
    [
      "What sizes go into the favicon.ico?",
      "16, 32 and 48 px, packed into a single ICO file. That is the conventional set: 16 px for the browser tab, 32 px for taskbar and higher-DPI tabs, and 48 px for desktop shortcuts. Browsers read the directory inside the file and choose the closest entry.",
    ],
    [
      "Can I export as SVG if I uploaded my own image?",
      "No — SVG export is disabled for uploads. Text and built-in glyph icons become real vector paths and shapes, but an uploaded PNG or JPEG has no vector data to recover, so those export as PNG, ICO or a ZIP of PNGs instead.",
    ],
    [
      "What does the PWA export include?",
      "Two PNGs at 192x192 and 512x512 plus a manifest-icons.json listing both with their src, sizes and \"image/png\" type. Those two sizes are the pair install prompts and audits generally look for — 192 for the home screen icon and 512 for the splash screen.",
    ],
  ],
};

export default seo;
