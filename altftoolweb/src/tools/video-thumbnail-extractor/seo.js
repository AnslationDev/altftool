const seo = {
  title: "Extract Video Frames as JPEG, PNG or WebP Thumbnails",
  metaDescription:
    "Pull up to 120 stills from a video in your browser — evenly spaced, every N seconds or one exact timecode — and download them as JPEG, PNG or WebP.",
  steps: [
    "Choose a clip with the \"Video file\" picker (any format your browser can play; the file is decoded locally and never uploaded), then set \"Frame selection\" to Evenly spaced, Fixed interval or Single frame.",
    "Fill the matching field — \"How many thumbnails\" up to 120, \"Seconds between frames\", or \"Timecode (HH:MM:SS)\" — choose a \"Thumbnail width\" from 320 to 1920 px and an Image format of JPEG, PNG or WebP, then press \"Extract thumbnails\".",
    "Each still is named like clip-001-00-00-20-000.jpg and has its own download link; \"Download all as ZIP\" saves the batch as clip-thumbnails.zip, and \"Copy timestamps\" copies the frame times.",
  ],
  intro:
    "The Video Thumbnail Extractor pulls still frames out of a video file and saves them as JPEG, PNG or WebP images, without uploading anything. For evenly spaced thumbnails it cuts the clip into n+1 equal segments and takes a frame at each internal boundary — t = duration × (i+1)/(n+1) — which deliberately avoids the first frame, so common black or fade-in openings are skipped. It is for editors building contact sheets, marketers picking a cover image, and anyone who needs a still from a clip they already have.",
  useCases: [
    "Build a 12-frame contact sheet from a 10-minute interview to pick the best cover image.",
    "Grab one frame every 5 seconds from a screen recording to document each step of a workflow.",
    "Export a single frame at exactly 00:01:23 to use as a video poster image.",
  ],
  benefits: [
    ["Never lands on frame zero", "Even spacing starts one segment in, so the black opening frame is not what you get."],
    ["Exact timecodes accepted", "Type HH:MM:SS, MM:SS or plain seconds for a start offset or single frame."],
    ["All local, all private", "The video is decoded by your browser's own player; no file or frame is sent anywhere."],
  ],
  faqs: [
    [
      "How are evenly spaced thumbnails chosen?",
      "The clip is divided into one more segment than the number of thumbnails requested, and a frame is taken at each internal boundary. Four thumbnails from a 100-second clip come from 20 s, 40 s, 60 s and 80 s — never 0 s, which is usually black.",
    ],
    [
      "Which video formats work?",
      "Whatever your browser can play, which in practice means MP4/H.264, WebM/VP9 and usually MP4/H.265 on Safari. Files the browser cannot decode, and any DRM-protected stream, cannot be drawn to a canvas and will report an error rather than a blank image.",
    ],
    [
      "How many frames can I extract at once?",
      "Up to 120 in a single run. Each frame requires a seek, a decode and a canvas readback, so larger batches are slow and can exhaust the memory of a browser tab.",
    ],
    [
      "Are the thumbnails the same resolution as the video?",
      "They are as wide as you choose, up to the source width — the tool never enlarges. The height always follows from the source aspect ratio, so a 1920 × 1080 video at 640 px wide gives 640 × 360 thumbnails.",
    ],
  ],
};

export default seo;
