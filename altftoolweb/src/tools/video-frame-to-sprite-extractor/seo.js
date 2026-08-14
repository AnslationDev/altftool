const seo = {
  title: "Video to 5x5 PNG Sprite Sheet, In Your Browser",
  metaDescription:
    "Sample a local video every 1, 2 or 5 seconds and tile the first 25 frames at 240px wide into one PNG. FFmpeg runs in the page; nothing is uploaded.",
  steps: [
    "Choose your clip with Source file — the picker accepts any video/* file, and it is written to an in-page FFmpeg filesystem rather than uploaded.",
    "Set Sampling to 1 frame/second, 1 frame/2 seconds or 1 frame/5 seconds, then press Process locally.",
    "FFmpeg WebAssembly scales each frame to 240px wide, tiles the first 25 into a 5x5 sheet and downloads altftool-video-frame-to-sprite-extractor.png.",
  ],
  intro:
    "The Video Frame to Sprite Extractor samples frames from a local video at one frame every 1, 2 or 5 seconds, scales each to 240 pixels wide, and tiles the first 25 of them into a single 5x5 PNG sprite sheet. It runs FFmpeg compiled to WebAssembly inside your browser, so the video is decoded on your own machine and only the finished PNG is downloaded. It suits anyone who needs a contact sheet of a clip — video preview scrubbers, storyboards, QA passes, thumbnail picking — in one file rather than 25 loose images.",
  useCases: [
    "You are building a video player with a hover-scrub preview strip and need a single sprite sheet the front end can offset into, instead of loading dozens of separate thumbnails.",
    "A 40-second product demo needs a thumbnail and you want to see 25 candidate frames on one page before deciding which second to grab.",
    "You are writing up a screen recording for a bug report and want a contact sheet showing the sequence of states, attached as one image.",
  ],
  benefits: [
    [
      "One PNG, not a folder of frames",
      "The 5x5 tile filter assembles the sampled frames into a single sprite sheet, so there is nothing to zip, rename or re-order afterwards.",
    ],
    [
      "Sampling rate you choose",
      "One frame per second suits a short clip; one per five seconds spreads the same 25 tiles across just over two minutes of footage.",
    ],
    [
      "The video stays on your machine",
      "FFmpeg runs as WebAssembly in the page, so even long or confidential recordings are never sent to a server for frame extraction.",
    ],
  ],
  faqs: [
    [
      "How many frames does the sprite sheet contain?",
      "25 — a fixed 5x5 grid. The extractor takes the first 25 sampled frames at your chosen rate and writes them as one PNG, so a 1-frame-per-second setting covers the first 25 seconds and a 1-frame-per-5-seconds setting covers the first 125 seconds.",
    ],
    [
      "What size is each tile?",
      "Each frame is scaled to 240 pixels wide with the height calculated to preserve the source aspect ratio, so a 16:9 clip produces 240x135 tiles and a 5x5 sheet about 1200x675 pixels.",
    ],
    [
      "Is my video uploaded to a server?",
      "No. The file is written into an in-browser FFmpeg WebAssembly filesystem, processed locally, and read back as a PNG blob. The FFmpeg core itself is fetched once from a public CDN, but your media is not transmitted.",
    ],
    [
      "Which video formats work?",
      "Anything the in-browser FFmpeg build can decode, which covers the usual MP4, WebM, MOV and MKV containers with common codecs. Very large or long files take proportionally longer because decoding happens on your CPU rather than on a server.",
    ],
  ],
};

export default seo;
