const seo = {
  title: "Burn SRT or VTT Subtitles Into Video in the Browser",
  metaDescription:
    "Renders an .srt or .vtt permanently into the picture using FFmpeg WebAssembly: H.264 video, copied audio, three type sizes, nothing uploaded.",
  steps: [
    "Choose the video under Source file, then the caption track under Secondary file — the picker accepts .srt and .vtt.",
    "Set Subtitle size to small, medium or large (FFmpeg force_style FontSize 16, 22 or 28) and press 'Process locally'.",
    "FFmpeg WebAssembly re-encodes the video to H.264 and stream-copies the audio inside the tab, then downloads altftool-burn-in-subtitle-encoder.mp4.",
  ],
  intro:
    "The Burn-In Subtitle Encoder permanently renders an SRT or WebVTT subtitle file into the picture of your video, producing an MP4 whose captions are part of the frames and cannot be switched off. It runs FFmpeg compiled to WebAssembly inside the browser tab — the video is written to an in-memory filesystem rather than uploaded — and applies the subtitles filter at one of three type sizes (16, 22 or 28 points) while re-encoding video with H.264 and copying the original audio stream untouched. It is the fix for platforms and players that ignore a separate subtitle track.",
  useCases: [
    "You are posting a clip to a social feed that autoplays muted and shows no caption track, so the words have to be in the picture to be read at all.",
    "You have a talking-head video and a translated .srt from a captioning pass, and you need one file to send a client rather than a video plus a sidecar.",
    "You are handing footage to someone whose player will not load external subtitles, and open captions are the only format guaranteed to survive the transfer.",
  ],
  benefits: [
    ["The video file never leaves the tab", "FFmpeg WebAssembly is loaded only after you press Process, and the source is written to a browser in-memory filesystem, so nothing is uploaded to a server."],
    ["Audio is copied, not re-encoded", "Only the video stream is re-encoded to H.264; the audio track is stream-copied, so a second generation of lossy audio damage is avoided."],
    ["Three explicit type sizes", "Font size is set to 16, 22 or 28 points through FFmpeg's force_style, so a mobile-first vertical clip and a desktop lecture recording get suitable caption sizes."],
  ],
  faqs: [
    [
      "What is the difference between burned-in and soft subtitles?",
      "Burned-in (open) captions are drawn into the video pixels and cannot be turned off, resized or translated; soft subtitles ride as a separate track the player renders on top. This tool produces burned-in captions, which is what you want when the destination player ignores subtitle tracks.",
    ],
    [
      "What subtitle file formats can I use?",
      "SRT and WebVTT — the file picker accepts .srt and .vtt. Cue timings and line breaks come from that file as written, so fix any overlapping or mistimed cues in the subtitle file before encoding, because they cannot be edited once burned in.",
    ],
    [
      "Will burning in subtitles reduce my video quality?",
      "Slightly, because the video stream is re-encoded to H.264 to draw the text, which is one extra lossy generation. The audio is stream-copied rather than re-encoded, so sound quality is unchanged.",
    ],
    [
      "How large a video can it handle in the browser?",
      "It is bounded by the memory the tab can allocate, since the file is decoded and re-encoded entirely in browser memory, so short clips finish comfortably while long or high-resolution files can be slow or run out of memory. Trim to the section you need first, and expect encoding to take longer than it would with a native FFmpeg install.",
    ],
  ],
};

export default seo;
