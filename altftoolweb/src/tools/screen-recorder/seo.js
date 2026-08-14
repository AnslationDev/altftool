const seo = {
  title: "Free Online Screen Recorder — WebM VP9, No Upload",
  metaDescription:
    "Record your screen in the browser at 24, 30 or 60 fps with pause/resume, then download a VP9 WebM — recordings stay in the page and are never uploaded.",
  steps: [
    "Open the settings panel to set Video Quality (High 2.5 Mbps or Standard 1 Mbps), Include Audio, and Frame Rate: 24, 30 or 60 fps.",
    "Click Start Recording and pick the screen or window in the browser's share dialog; Pause/Resume and Stop control the capture while the timer counts only recorded time.",
    "Play the capture back in the preview player, then click Download to save screen-recording-<timestamp>.webm, or Delete to discard it.",
  ],
  intro:
    "The Screen Recorder captures your screen through the browser's own getDisplayMedia and MediaRecorder APIs and writes a WebM file encoded with VP9 — no extension, no upload, no account. You choose 24, 30 or 60 fps, high (2.5 Mbps) or standard (1 Mbps) quality, and whether to include audio, then record, pause and resume, watch the result back in the player and download it. It suits anyone who needs a quick demo, bug report or walkthrough clip and does not want a desktop recorder for a two-minute capture.",
  useCases: [
    "Reproducing a bug for a ticket: record the exact click path that breaks the page at 30 fps and attach the WebM so the developer sees the sequence instead of reading a description.",
    "Recording a short how-to for a colleague — pause while you switch tabs or find the right file, resume, and the timer keeps counting only the recorded time.",
    "Capturing a smooth 60 fps clip of an animation or scroll behaviour where a lower frame rate would hide the stutter you are trying to show.",
  ],
  benefits: [
    [
      "Pause and resume without splitting the file",
      "MediaRecorder pauses in place and the elapsed timer stops with it, so a single continuous WebM comes out rather than several clips you have to join.",
    ],
    [
      "Bitrate and frame rate are yours to set",
      "Pick 24, 30 or 60 fps and 2.5 Mbps or 1 Mbps before you start, instead of accepting one fixed preset and re-encoding afterwards.",
    ],
    [
      "Stops cleanly when the share ends",
      "Ending the capture from the browser's own sharing bar finalises the recording and releases every track, so nothing keeps capturing in the background.",
    ],
  ],
  faqs: [
    [
      "What file format does the recording come out as?",
      "A .webm file encoded with the VP9 video codec, named with a timestamp when you download it. WebM plays natively in Chrome, Edge and Firefox and imports into most editors; convert it to MP4 if you need it in software that only takes H.264.",
    ],
    [
      "Can it record system audio as well as the screen?",
      "It requests audio alongside the display capture, but what you actually get depends on the browser and the surface you pick — Chrome on Windows and ChromeOS can share tab or system audio, while sharing an entire screen on macOS generally captures no system sound. Check the audio checkbox in the browser's own share dialog when it appears.",
    ],
    [
      "What is the difference between high and standard quality?",
      "High targets 2,500,000 bits per second and standard targets 1,000,000, so a high-quality minute is roughly 19 MB against about 7.5 MB. Use high for text-heavy screens and UI detail where compression artefacts make small type unreadable, and standard for long captures where file size matters more.",
    ],
    [
      "Does the recording get uploaded anywhere?",
      "No. The captured chunks stay in the page as a Blob in your browser's memory and the download is generated locally from that blob, so nothing is sent to a server. Closing or reloading the tab discards the recording, so download it before you navigate away.",
    ],
  ],
};

export default seo;
