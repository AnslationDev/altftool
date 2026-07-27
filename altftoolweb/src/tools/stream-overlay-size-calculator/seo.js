const seo = {
  intro:
    "This calculator turns an overlay element expressed as a percentage of your stream canvas into exact pixel dimensions and top-left X/Y coordinates. It applies the canvas-to-output scale factor (output width ÷ base width) that OBS and Streamlabs use, and reserves a safe margin off the short edge so nothing sits under a platform's own chrome. Streamers and overlay designers use it to size facecams, chat boxes and alert boxes once and reuse them at every resolution.",
  useCases: [
    "Sizing a 25% wide facecam on a 1920 × 1080 canvas and reading off the 480 × 270 px box plus the exact bottom-right X/Y",
    "Checking how a 1080p overlay kit will look after OBS downscales the output to 1280 × 720",
    "Finding out whether a 300 px wide logo PNG is big enough for the slot it has been dropped into, before it is stretched",
  ],
  benefits: [
    ["Percentages, not guesses", "Size once as a share of canvas width and the layout survives a resolution change."],
    ["Copy-paste transforms", "X and Y are given for all nine safe-area anchors in canvas pixels."],
    ["Upscale warnings", "Flags mismatched aspect ratios and artwork that would be stretched past 100%."],
  ],
  faqs: [
    [
      "What size should a facecam be on a 1080p stream?",
      "A common facecam is about 25% of canvas width, which is 480 × 270 px on a 1920 × 1080 canvas at 16:9. Small corner cams run nearer 16% (about 307 × 173 px) and full-frame 'just chatting' cams can exceed 50%.",
    ],
    [
      "What is the difference between base canvas and output resolution in OBS?",
      "The base (canvas) resolution is the coordinate space you position sources in; the output (scaled) resolution is what is actually encoded. OBS multiplies everything by output width ÷ base width, so a 1920 canvas sent out at 1280 is scaled to 0.67×.",
    ],
    [
      "How much safe margin should a stream overlay use?",
      "Around 5% of the short edge is the usual working figure — 54 px on a 1080-tall canvas. That keeps elements clear of player controls, follower banners and platform watermarks that overlap the frame edges.",
    ],
    [
      "Should overlay artwork be exported at 1× or 2×?",
      "Export at least at the element's canvas pixel size (1×). Exporting at 2× is worth it if you may raise the canvas later or the element contains fine text, because upscaling a raster PNG always softens edges while downscaling does not.",
    ],
  ],
};

export default seo;
