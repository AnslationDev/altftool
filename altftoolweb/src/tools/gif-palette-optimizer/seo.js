const seo = {
  title: "GIF Palette Optimizer: 64, 128 or 256 Colour",
  metaDescription:
    "Shrink a GIF or video clip with FFmpeg's two-pass palettegen and paletteuse at 15 fps and 960 px wide, running as WebAssembly in your own browser.",
  steps: [
    "Choose your animation with the Source file picker, which accepts a GIF or any video file (image/gif, video/*).",
    "Set Palette to 64 colors, 128 colors or 256 colors — 256 is the GIF format's own ceiling — then press Process locally.",
    "FFmpeg loads as WebAssembly and runs palettegen then paletteuse at 15 fps, scaled to 960 px wide with Sierra-2-4A dithering, and downloads altftool-gif-palette-optimizer.gif without your file leaving the browser.",
  ],
  intro:
    "GIF Palette Optimizer rebuilds a GIF or a video clip with a smaller colour palette using FFmpeg's two-pass palettegen/paletteuse chain, which is what makes a GIF shrink without turning muddy. You choose 64, 128 or 256 colours; the tool analyses the whole clip first to build one optimal palette for it, then re-encodes at 15 frames per second, scaled to 960 pixels wide with Lanczos resampling and Sierra-2-4A dithering. FFmpeg runs as WebAssembly inside your browser, so the file is written to an in-memory filesystem and the finished GIF downloads straight back to you.",
  useCases: [
    "A GIF is a few hundred kilobytes over a forum or chat upload limit and dropping the palette from 256 to 128 colours gets it under without recutting the animation.",
    "Turning a short screen recording into a GIF for a bug report, where 64 colours is plenty because the footage is flat UI panels.",
    "Cleaning up a GIF that was exported with a per-frame palette and flickers between frames — one global palette makes the colours hold steady.",
  ],
  benefits: [
    ["Two-pass palette, not naive quantisation", "The palette is generated from the whole clip before re-encoding, so colours stay consistent across frames instead of shifting frame to frame."],
    ["Dithering that survives a small palette", "Sierra-2-4A error diffusion spreads quantisation error across neighbouring pixels, keeping gradients smooth at 64 colours rather than banding."],
    ["Nothing leaves the machine", "The FFmpeg build loads into the page and processes your file locally, so unreleased footage or internal screen recordings are never uploaded."],
  ],
  faqs: [
    [
      "How much smaller will my GIF get?",
      "It depends on the source, but the reduction comes from three fixed changes as well as the palette: output is capped at 15 fps and 960 pixels wide, and halving the palette from 256 to 128 colours cuts one bit per pixel before compression. Flat, graphic footage shrinks most; grainy camera video least.",
    ],
    [
      "Why can't I pick more than 256 colours?",
      "Because the GIF format itself is limited to a 256-entry palette per image — that is the format's ceiling, not the tool's. The 64 and 128 options exist to go below it, which is where the real file-size savings are.",
    ],
    [
      "Can I convert a video file to GIF with this?",
      "Yes. It accepts video as well as GIF input, and the output is always a GIF at 15 fps and 960 pixels wide. Trim the clip before uploading, since GIF has no inter-frame compression and long clips stay large whatever the palette.",
    ],
    [
      "Is my file uploaded to a server?",
      "No. FFmpeg is compiled to WebAssembly and runs in your browser after you click the button; your file is written to its in-memory filesystem, processed there, and the result is handed back as a download.",
    ],
  ],
};

export default seo;
