const seo = {
  title: "Video to Animated WebP Converter in Your Browser",
  metaDescription:
    "Converts a video segment to a looping animated WebP in the browser — pick start/end, 5–30 fps and width up to 800 px; max 60 s and 600 frames per file.",
  steps: [
    "Choose a Video file, then set the Start time and End time in seconds — a clip can span at most 60 seconds.",
    "Pick Frames per second (5 to 30), an Output width preset from 240 to 800 px and the WebP quality, then press 'Convert to WebP'; one animation holds at most 600 frames.",
    "Press the Download button to save the result, named after your source file with a .webp extension.",
  ],
  intro:
    "Video to WebP turns a short section of a video clip into a single animated WebP file, entirely inside your browser. It samples the clip at your chosen frame rate, encodes each frame as a WebP still through the canvas encoder, and then assembles them into one file using the RIFF-based WebP container — a VP8X header with the animation flag, an ANIM chunk carrying the loop count, and one ANMF chunk per frame. It is for anyone who wants a looping animation that is far smaller than the equivalent GIF.",
  useCases: [
    "Turn a 4-second product demo into a looping animation for a landing page hero.",
    "Replace a heavy GIF in documentation with an animated WebP a fraction of the size.",
    "Export a 3-second reaction clip at 12 fps and 320 px wide for a chat sticker.",
  ],
  benefits: [
    ["Much smaller than GIF", "WebP frames use VP8 compression and full 24-bit colour instead of GIF's 256-colour palette."],
    ["Frame rate and length under your control", "Pick the segment, the frames per second and the width, and see the frame count before converting."],
    ["Nothing leaves your machine", "Decoding, encoding and muxing all happen in the browser tab; no upload and no server."],
  ],
  faqs: [
    [
      "Why is an animated WebP smaller than a GIF?",
      "GIF is limited to a 256-colour palette per frame and uses LZW compression from 1987; WebP frames use VP8 lossy compression with full 24-bit colour. For the same clip a WebP is commonly 50-80% smaller with fewer visible colour bands.",
    ],
    [
      "Which browsers can run this conversion?",
      "Any browser whose canvas can encode WebP, which means Chrome, Edge, Opera and Firefox 96 or later. If the canvas returns something other than image/webp the tool stops and says so rather than producing a broken file.",
    ],
    [
      "How long a clip can I convert?",
      "Up to 60 seconds of source, and at most 600 frames in one animation. At 12 frames per second that is 50 seconds of animation; raising the frame rate shortens the maximum clip proportionally.",
    ],
    [
      "Does an animated WebP keep transparency?",
      "Yes — the container sets the alpha flag whenever the encoded frames carry an ALPH chunk. Frames sampled from a normal video are opaque, so transparency only appears if the source itself has an alpha channel.",
    ],
  ],
};

export default seo;
