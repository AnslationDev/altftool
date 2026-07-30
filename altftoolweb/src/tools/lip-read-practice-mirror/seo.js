const seo = {
  intro:
    "Lip-Read Practice Mirror shows your own camera feed flipped left-to-right like a mirror, magnified from 1× up to 4× so the mouth fills the frame, and can record a short clip that replays in slow motion between 0.35× and 1× normal speed. It is a practice aid for people learning to lip-read or working on their own mouth shapes with a speech therapist's exercises. The camera starts only when you press Start camera, and clips stay in the page as a temporary object URL — nothing is uploaded or saved to disk.",
  useCases: [
    "Practising the visually similar consonant pairs — p/b/m, f/v, t/d — by recording yourself saying them and replaying at 0.35× to see where the shapes actually differ",
    "Working through speech-therapy homework between sessions, checking your mouth position at 2× zoom rather than guessing from a normal-size reflection",
    "Rehearsing a phrase you struggle to make understood, recording it, and watching the replay slowly to spot which syllable loses its shape",
  ],
  benefits: [
    ["Mirrored and zoomed at the same time", "The feed is flipped so left stays left, then magnified up to 4×, which a bathroom mirror or a plain video call cannot do."],
    ["Replay slow enough to see the transitions", "Playback runs as low as 0.35× normal speed, and the rate is re-applied if the player tries to reset it."],
    ["Clips never leave the page", "Recording uses the browser's own MediaRecorder and the result is held as a temporary in-memory URL that is released when you leave."],
  ],
  faqs: [
    [
      "How slow can the replay go?",
      "Down to 0.35× normal speed, adjustable in 0.05 steps up to 1× (full speed), with 0.6× as the starting value. That is slow enough to separate the closing and opening phases of a lip movement without the frames becoming unreadable.",
    ],
    [
      "Is my video uploaded or stored anywhere?",
      "No. The camera stream stays in the browser, the recording is assembled locally by MediaRecorder, and the replay plays from a temporary object URL that is discarded when you close or leave the page. Nothing is written to a server or saved as a file unless you download it yourself.",
    ],
    [
      "How much can I zoom in on the mouth?",
      "From 1× to 4×, in 0.1 steps, starting at 1.6×. Because the zoom scales the live video rather than the camera's optics, very high magnification will look soft on a low-resolution webcam — around 2× is usually the practical limit for a laptop camera.",
    ],
    [
      "Does the recording capture sound?",
      "No — the capture requests video only, so replays are silent by design, which keeps the focus on the visual mouth shape. Camera access also requires your explicit permission each session and depends on your browser supporting getUserMedia and MediaRecorder.",
    ],
  ],
};

export default seo;
