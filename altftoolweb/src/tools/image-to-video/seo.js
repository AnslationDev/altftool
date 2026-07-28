const seo = {
  title: "Image to Video Converter — Free Slideshow Maker",
  h1: "Image to Video Converter",
  metaDescription:
    "Free image to video converter. Drop photos, add Ken Burns motion and text, then export a 720x1280 WebM at 30 fps — all in-browser, nothing uploaded.",
  intro:
    "The Image to Video Converter turns a set of photos into a 720x1280 vertical video with no server in the loop. Every frame is composed on an HTML canvas — the image cover-fit over a gradient built from its own average colour, plus any text and shape layers — and the canvas is then captured with canvas.captureStream(30) and encoded by the browser's native MediaRecorder into a WebM file. Motion presets like Ken Burns, zoom and pan are plain 2D canvas transforms driven by an easing curve, and project files are stored locally in IndexedDB, so your images never leave the device.",
  useCases: [
    "Turning a batch of product or travel photos into a 9:16 clip for Reels, Shorts or TikTok without opening a video editor.",
    "Building a before/after, trio or collage split-screen from images you already have, with each pane cover-fit and drifting on its own Ken Burns offset.",
    "Timing a photo montage to a song by tapping the beat on the spacebar so each slide change lands on the beat.",
  ],
  benefits: [
    [
      "Nothing is uploaded",
      "Images are read with URL.createObjectURL and drawn straight onto a canvas. The only fetch() in the whole tool reads a local blob: URL when you save a project to IndexedDB — no file is ever sent to a server, and there is no account or signup.",
    ],
    [
      "Vertical-first, watermark-free output",
      "The recording canvas is fixed at 720x1280 — the 9:16 frame Reels, Shorts and TikTok expect — captured at 30 fps. No watermark is drawn into the frame at any point.",
    ],
    [
      "Timing you can actually control",
      "The global slider sets 1–8 seconds per slide in 0.5s steps, any single slide can override that up to 10 seconds, and entry and exit animations each occupy 5–45% of that slide's own duration.",
    ],
    [
      "Overlays are baked into the file",
      "Text, subtitle and shape layers are drawn into the same canvas that MediaRecorder is recording, so overlays appear in the downloaded video, not just in the live preview.",
    ],
  ],
  faqs: [
    [
      "How do I turn photos into a video for free?",
      "Drop your images onto this page, choose a duration and a motion preset, then press Generate. The tool draws each frame on a canvas and records it with your browser's built-in MediaRecorder into a WebM file you download — free, no signup, no watermark, and no upload.",
    ],
    [
      "What format is the exported video?",
      "WebM, downloaded as video.webm at 720x1280 and 30 fps. The recorder requests the video/webm MIME type, which Chrome, Edge and Firefox support; Safari's MediaRecorder does not, so use a Chromium-based browser or Firefox. YouTube accepts WebM directly — for apps that only take MP4, convert the file after export.",
    ],
    [
      "Can I add music or audio to the video?",
      "No. Only the canvas is recorded via canvas.captureStream(30), so the exported file has no audio track. The Beat Tap Sync panel is timing-only: you tap the spacebar on each beat, it derives BPM as 60000 divided by your average tap interval, and it maps the gap between taps to each slide's duration. Add the actual song when you post the clip.",
    ],
    [
      "How long can the video be?",
      "As long as your slides add up to. Each slide runs 1–8 seconds from the global slider, or up to 10 seconds if you override it individually, and the loop styles extend that: Bounce plays A B C as A B C B A, Reverse plays the set backwards, and ABAB repeats the first two slides four times.",
    ],
    [
      "What is Ken Burns motion, and what does Smart Auto do?",
      "Ken Burns scales the photo from 1.1x to 1.25x while drifting it diagonally across the frame. Smart Auto picks a preset from the image's own aspect ratio: wider than 1.15 gets a left pan, narrower than 0.87 gets a zoom-in, and anything in between gets Ken Burns. Seven presets total, plus five speed curves from linear to a three-segment cinematic curve.",
    ],
    [
      "What transitions are available between slides?",
      "Six mask transitions plus per-slide entry and exit animations. Circle Reveal, Diagonal Wipe, Star Reveal, Diamond, Horizontal Wipe and Vertical Wipe are canvas clip paths that play over the last 40% of a slide and reveal the next image through the shape. Independently, each slide can fade, slide up or left, zoom or blur in, and fade, slide down or right, zoom or blur out.",
    ],
    [
      "What image formats can I use?",
      "PNG, JPG and WEBP — anything the picker accepts as image/*, dragged in or browsed, several at once. Each photo is fitted inside the 720x1280 frame without cropping, over an animated gradient generated from the image's dominant colour, which is sampled by downscaling it to 50x50 pixels and averaging.",
    ],
    [
      "Can I save a project and finish it later?",
      "Yes. Save Project writes your slides, per-slide timings, hook text and split layout into an IndexedDB database named ImageToVideoDB, along with the image blobs themselves. That storage is local to that browser on that device — it is not tied to an account and is not synced anywhere.",
    ],
  ],
  steps: [
    "Drop your PNG, JPG or WEBP images onto the dropzone, or click it to browse. Each file becomes a slide in the order it loaded.",
    "Pick a motion preset and speed curve, set the duration per slide, and optionally add text or shape layers, a hook line on the first slide, a split-screen layout, or a mask transition.",
    "Press Generate, watch the progress bar as frames are recorded in real time, then download video.webm from the player that appears.",
  ],
};

export default seo;
