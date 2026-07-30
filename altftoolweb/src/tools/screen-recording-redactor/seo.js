const seo = {
  intro:
    "This tool covers sensitive areas of a screen recording with timed rectangles — solid fill, blur or pixelation — and re-encodes the video so the hidden pixels are gone from the file, not just hidden behind an overlay. Each region has its own start and end time, so a password field can be covered for the eight seconds it is visible and left alone after that. Export redraws every frame onto a canvas at the video's native resolution and records it at 30fps through MediaRecorder into a WebM, entirely on your machine.",
  useCases: [
    "You recorded a product walkthrough and a real customer's name and email appear in the CRM sidebar for part of it, so you need those pixels destroyed before the clip goes on a public help page",
    "A bug reproduction video shows an API token in a devtools panel for a few seconds, and you want that window covered without re-recording the whole session",
    "You are sharing a demo where a Slack notification slid in with a colleague's message, and you need to pixelate that corner only for the seconds it was on screen",
  ],
  benefits: [
    ["The pixels are actually removed", "Redaction is baked into every exported frame, so no one can scrub the overlay off the way they can with a video editor's layer or a CSS mask."],
    ["Per-region timing, not whole-clip masking", "Every rectangle carries its own start and end time, so covers appear and disappear with the content instead of blocking the frame for the entire video."],
    ["Blur and pixelation scale to the region", "Blur radius is at least 8px and grows with the smaller side of the box, and pixelation downsamples the area to a sixteenth of its size before enlarging it with smoothing off."],
  ],
  faqs: [
    [
      "Is blur safe enough to hide a password or a name?",
      "Use solid fill for anything that must never be recovered. Blur and pixelation reduce detail but are reconstructions of the original pixels, and text with a known font and layout has been recovered from weak pixelation before — solid fill writes over the area completely.",
    ],
    [
      "What format does the export produce?",
      "A WebM, saved as your-filename-redacted.webm. It prefers VP9 with Opus audio, falls back to VP8 with Opus and then to whatever plain video/webm the browser offers, and the canvas is captured at 30fps at the source video's native pixel dimensions.",
    ],
    [
      "Why does exporting take as long as the video?",
      "Because the export plays the video through and records the redrawn canvas in real time — a four-minute recording takes about four minutes to write. There is no faster offline encode path in the browser, so leave the tab in the foreground while it runs.",
    ],
    [
      "Does the audio survive the export?",
      "Yes where the browser supports capturing a stream from the video element — the source audio tracks are added to the recording stream alongside the redacted canvas. Support varies by browser, so play the exported file back before deleting the original, and note that redaction is visual only: anything spoken aloud is still in the audio.",
    ],
  ],
};

export default seo;
