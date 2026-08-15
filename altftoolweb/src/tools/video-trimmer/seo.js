const seo = {
  title: "Video Trimmer: Cut MP4, MOV or WebM",
  metaDescription:
    "Trim MP4, MOV, WebM, MKV, AVI or M4V with in-browser FFmpeg: Fast Trim stream-copies at a keyframe, Precise Trim re-encodes at CRF 18-32.",
  steps: [
    "Press Select Video, or drag an MP4, MOV, WebM, MKV, AVI or M4V onto the dashed panel — the badge reads 'No server upload' because the file is read in the page.",
    "Set the range with the Start and End sliders, the Start seconds / End seconds boxes or the Set Start and Set End buttons that snap to the playhead, use Play Selection to check it, then pick Fast Trim or Precise Trim (with its CRF 18-32 slider), choose MP4, WebM or Original, toggle Keep audio, and press Trim Video.",
    "Press Download Clip to save the result, named from the source with the range appended — for example holiday-00-00-05-to-00-00-20.mp4 — or New Trim to clear it and cut another range.",
  ],
  intro:
    "The Video Trimmer cuts a section out of an MP4, MOV, WebM, MKV, AVI or M4V file using FFmpeg compiled to WebAssembly, offering either a Fast Trim that stream-copies at the nearest keyframe with no re-encode, or a Precise Trim that re-encodes with H.264 or VP9 at a CRF you choose between 18 and 32. Set the start and end points against a waveform-free scrub bar, preview the selection, decide whether to keep the audio, and export as MP4, WebM or the original container. The video is processed in your browser, so nothing is uploaded.",
  useCases: [
    "A screen recording has 40 seconds of setup before the part you actually want to send, and you need the rest gone without re-encoding and softening the text.",
    "You need a clip to start on an exact frame for a montage, so you switch to Precise Trim and accept the re-encode to get the cut where you set it.",
    "A phone-recorded MOV needs to become a small WebM for a web page, trimmed and with the audio dropped entirely.",
  ],
  benefits: [
    [
      "Two cut modes with the trade-off stated",
      "Fast Trim stream-copies so quality and speed are untouched but the start snaps to a keyframe; Precise Trim re-encodes for a frame-accurate boundary, and the tool tells you which you are getting.",
    ],
    [
      "Quality is a number you set, not a preset",
      "Precise mode exposes the CRF slider from 18 to 32, so you decide the size-versus-quality point instead of accepting a hidden default.",
    ],
    [
      "Audio kept or dropped by choice",
      "One toggle either maps the audio stream through or adds -an to strip it, which is often the fastest way to shrink a clip you only need visually.",
    ],
  ],
  faqs: [
    [
      "Why does my trimmed video start slightly before the point I set?",
      "Because Fast Trim copies the existing streams and can only cut at a keyframe, so the start moves back to the nearest one — often up to a couple of seconds in footage with sparse keyframes. Switch to Precise Trim and the clip is re-encoded so the cut lands where you set it.",
    ],
    [
      "Does trimming reduce the quality?",
      "Fast Trim does not touch a single pixel; it copies the compressed streams straight through, so the output is identical in quality to the source. Precise Trim re-encodes, and the CRF slider controls how much that costs — 18 is visually near-transparent, 32 is noticeably softer but much smaller.",
    ],
    [
      "Which file formats can I trim and export?",
      "Input accepts MP4, MOV, WebM, MKV, AVI and M4V. Output is MP4 with H.264, WebM with VP9 and Opus audio at 96 kbps, or the original container when stream-copying — precise mode falls back to MP4 for the Original option so the result plays in a browser.",
    ],
    [
      "Is my video uploaded to a server?",
      "No. FFmpeg is loaded once as a WebAssembly core and every step — reading the file, cutting and writing the output — happens inside the page. Only the FFmpeg core itself is fetched from a public CDN, which is why the first trim needs a working connection.",
    ],
  ],
};

export default seo;
