const seo = {
  title: "Trim Video in Your Browser with FFmpeg WASM",
  metaDescription:
    "Cut a section from a video with FFmpeg in your browser - no upload. Lossless stream copy or frame-exact H.264 re-encode, downloaded as trimmed.mp4.",
  steps: [
    "Choose a file under 'Video file (MP4, MOV, WebM)' and type the start and end times in seconds or mm:ss.",
    "Pick 'Fast (stream copy, no re-encode)' or 'Precise (re-encode with H.264)' — with a CRF 14-32 quality slider — then press 'Trim video'.",
    "Press 'Download clip' to save trimmed.mp4 (or trimmed-reencoded.mp4), or 'Copy details' for the exact ffmpeg command used.",
  ],
  intro:
    "Trim Video cuts a chosen section out of a video file entirely inside your browser, using FFmpeg compiled to WebAssembly, so the footage is never uploaded to a server. You set a start and end time and it builds the standard FFmpeg command — seeking with -ss and cutting a duration with -t — in either fast stream-copy mode (-c copy, no quality loss) or a precise H.264 re-encode. It is for anyone who needs one clip out of a long recording without installing an editor.",
  useCases: [
    "Pulling a 30-second highlight out of a two-hour match recording to share in a group chat",
    "Cutting the dead air off the start and end of a screen recording before sending it to a client",
    "Extracting a frame-exact clip from a lecture video where a stream copy would start a second or two early",
  ],
  benefits: [
    ["Nothing leaves your device", "The video is processed locally in the browser, which matters for private or unreleased footage."],
    ["Two cut modes", "Stream copy is near-instant and lossless; the re-encode gives a frame-exact cut at a CRF you choose."],
    ["Size predicted before you cut", "Output size is estimated from the source average bitrate — file size in bits divided by duration."],
  ],
  faqs: [
    [
      "Does trimming a video reduce its quality?",
      "Not in stream-copy mode: -c copy repackages the existing compressed frames without decoding them, so the picture is bit-for-bit identical to the source. The precise mode re-encodes with H.264 at your chosen CRF (default 23), which is visually near-transparent but not lossless.",
    ],
    [
      "Why does my trimmed clip start a bit earlier than I set?",
      "Because a stream copy can only cut on a keyframe, and FFmpeg moves the cut back to the nearest preceding one. Most phone and camera recordings place a keyframe every 2 seconds, so that is the worst-case drift. Switch to the precise re-encode mode for an exact start.",
    ],
    [
      "How large will the trimmed file be?",
      "Roughly the source size multiplied by the fraction you keep: cutting 15 seconds out of a 60-second, 100 MB video gives about 25 MB. That holds for a stream copy because the average bitrate stays the same; a re-encode at a higher CRF will usually come out smaller.",
    ],
    [
      "Is my video uploaded anywhere?",
      "No. The file stays in your browser's memory and is processed by FFmpeg running as WebAssembly. The only network request is a one-time download of the FFmpeg engine itself the first time you trim.",
    ],
  ],
};

export default seo;
