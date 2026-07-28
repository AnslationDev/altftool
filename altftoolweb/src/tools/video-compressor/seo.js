const seo = {
  title: "Video Compressor — Free, Compress MP4 in Browser",
  h1: "Video Compressor",
  metaDescription:
    "Compress MP4, MOV, WebM, MKV or AVI video in your browser with FFmpeg WebAssembly — CRF quality, resolution caps, audio control. Free, nothing uploaded.",
  intro:
    "The Video Compressor re-encodes your video with FFmpeg compiled to WebAssembly (@ffmpeg/core 0.12.10), loaded into the page on demand — the file is written into FFmpeg's in-memory filesystem inside your own browser tab and is never uploaded. MP4 output goes through libx264 at a CRF you control (18–40), in yuv420p with +faststart so it starts playing before it finishes downloading; WebM output uses libvpx-vp9 with Opus audio. Downscaling uses a Lanczos scale filter and only engages when the source is taller than the cap you pick, and an estimated output size updates live from your CRF, resolution, frame-rate and audio choices before you run anything.",
  useCases: [
    "Getting a screen recording or phone clip under an email, chat, or upload size limit",
    "Downscaling 4K or 1080p footage to 720p or 480p for a website background, product demo, or social post",
    "Stripping embedded metadata and dropping the audio track before sharing a clip publicly",
  ],
  benefits: [
    [
      "Real FFmpeg encoding",
      "libx264 for MP4 or libvpx-vp9 for WebM, driven by CRF rather than a fixed bitrate, so quality stays consistent across the whole clip instead of collapsing on busy scenes.",
    ],
    [
      "Presets plus full manual control",
      "High Quality (CRF 22, 1080p cap, 128 kbps audio), Balanced (CRF 28, 720p, 96 kbps) and Small File (CRF 34, 480p, 24 fps, 64 kbps) — or set CRF, resolution, frame rate, encoder speed and audio bitrate yourself.",
    ],
    [
      "Nothing leaves your device",
      "The video is decoded and re-encoded inside the browser tab. The only network request the tool makes is for the FFmpeg engine files themselves, fetched once from a public CDN.",
    ],
    [
      "Preview and measured savings",
      "Play the compressed result in the page, and see the exact output size, output dimensions and savings percentage before you commit to the download.",
    ],
  ],
  faqs: [
    [
      "Does compressing a video upload it to a server?",
      "No. Your video is read straight from your device into FFmpeg's in-memory filesystem inside the browser tab, encoded there, and handed back as a blob you download. The only network request is for the FFmpeg core files (ffmpeg-core.js and ffmpeg-core.wasm), which are fetched once from the public unpkg CDN — so you need to be online the first time you compress, but the video itself is never sent anywhere.",
    ],
    [
      "Is this video compressor free?",
      "Yes — free, with no signup, no watermark, and no cap on how many videos you compress. Because the encoding runs on your own hardware, there is no server cost to meter.",
    ],
    [
      "What CRF setting should I use to compress a video?",
      "CRF 28 is the balanced default. The slider runs from 18 to 40: lower means better quality and a larger file, higher means a smaller file with more visible artifacts. The three presets sit at CRF 22 (High Quality, capped at 1080p, 128 kbps audio), CRF 28 (Balanced, 720p, 96 kbps) and CRF 34 (Small File, 480p, 24 fps, 64 kbps).",
    ],
    [
      "What video formats can I compress?",
      "Input: MP4, MOV, WebM, MKV, AVI and M4V, plus anything else the browser reports with a video/ MIME type. Output: MP4 with H.264 video and AAC audio, or WebM with VP9 video and Opus audio.",
    ],
    [
      "How much smaller will my video be?",
      "It depends entirely on the source — a clean screen recording compresses far harder than grainy handheld footage. The tool shows a live size estimate derived from your CRF, the pixel-count reduction, the frame-rate ratio and whether audio is kept, then reports the exact measured savings percentage once the encode finishes.",
    ],
    [
      "Is there a file size limit for compressing video online?",
      "The tool sets no limit, but the practical ceiling is your device's memory, since the file is held in the browser's WebAssembly memory during the encode. Long clips and 4K sources take real time and RAM. If a compression fails, try MP4 output, a smaller resolution cap, or a shorter file.",
    ],
    [
      "Can I remove the audio or strip metadata while compressing?",
      "Yes. Unchecking \"Keep audio track\" runs the encode with -an so the output is silent, and \"Strip metadata\" (on by default) passes -map_metadata -1, which drops embedded tags such as camera model, creation date and location. Subtitle streams are dropped either way.",
    ],
    [
      "Will picking 1080p upscale a smaller video?",
      "No — the resolution cap only downscales. If the source is already at or below the height you pick, the original dimensions are kept untouched. When it does scale, it uses a Lanczos filter and rounds width and height to even numbers for encoder compatibility.",
    ],
  ],
  steps: [
    "Drag in a video (MP4, MOV, WebM, MKV, AVI or M4V) or browse for one — it loads into the in-page player and reads its duration and dimensions.",
    "Pick High Quality, Balanced or Small File, or tune CRF (18–40), resolution cap, frame rate, encoder speed and audio bitrate yourself while watching the estimated output size.",
    "Click Compress Video, wait for the FFmpeg progress bar, then preview the result and download the MP4 or WebM.",
  ],
};

export default seo;
