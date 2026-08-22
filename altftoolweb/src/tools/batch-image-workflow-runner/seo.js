const seo = {
  title: "Batch Image Workflow: Resize, Crop, Watermark",
  metaDescription:
    "Four FFmpeg WebAssembly presets — resize to 1200px, 1080×1080 centre crop, grayscale, corner watermark — run in the tab and output PNG.",
  steps: [
    "Pick your photo with the \"Source file\" picker, which accepts any image/* file.",
    "Choose resize-1200, square-crop, grayscale or watermark from the Pipeline menu and press \"Process locally\" — the FFmpeg WebAssembly core is only fetched at that point, and your file is written to its in-memory filesystem rather than uploaded.",
    "The finished image downloads as altftool-batch-image-workflow-runner.png while the \"Local processing report\" panel shows the File, Size, Type and Profile rows and the tail of the FFmpeg log.",
  ],
  intro:
    "The Batch Image Workflow Runner applies one of four fixed image pipeline presets — resize to 1200px, centre square crop to 1080×1080, grayscale, or a corner watermark — to a source image using an FFmpeg WebAssembly engine that runs inside the page. It suits anyone standardising images to a house format who does not want to relearn crop maths or filter syntax for every file. The engine only downloads after you press Process, and your image is written to its in-memory filesystem rather than uploaded to a server.",
  useCases: [
    "A marketplace listing rejects your photos for being too large, so you run the resize preset to cap the longest dimension at 1200px without touching the aspect ratio.",
    "Your team's avatar slots need a perfect square and your source shots are all 3:2, so the square-crop preset centre-crops and outputs at exactly 1080×1080.",
    "You are sending a mockup out for review and want a visible ownership mark, so the watermark preset burns a label into the bottom-right corner before you export.",
  ],
  benefits: [
    ["Presets encode the maths for you", "Each option is a tested FFmpeg filter chain, so the crop stays centred and the resize stays proportional every time."],
    ["Real FFmpeg filters, not canvas approximations", "The same scale, crop, format and drawtext filters a desktop encoder would use, compiled to WebAssembly."],
    ["A visible processing log", "The FFmpeg output streams into a report panel so you can see exactly what ran and why a file failed."],
  ],
  faqs: [
    [
      "What are the four pipeline presets?",
      "Resize-1200 scales the image down so its width is at most 1200px while keeping proportions; square-crop takes a centred crop of the shorter side and scales it to 1080×1080; grayscale converts to a gray pixel format; and watermark draws a boxed text label 24px in from the bottom-right corner at 28px.",
    ],
    [
      "What format does the output come out as?",
      "PNG. Every preset writes a .png file that downloads automatically when processing finishes, so a resize or crop will not add a second round of JPEG compression artefacts.",
    ],
    [
      "Can it process a whole folder at once?",
      "No — each run takes one source image and one selected pipeline. The workflow is reusable rather than parallel: pick the preset once and re-run it per file without reconfiguring anything.",
    ],
    [
      "Does my image get uploaded anywhere?",
      "No. The FFmpeg WebAssembly core is fetched on first use, then your file is written into that engine's in-browser virtual filesystem, processed, downloaded, and deleted. The image data itself never leaves the tab.",
    ],
  ],
};

export default seo;
