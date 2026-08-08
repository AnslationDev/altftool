const seo = {
  title: "Browser Fingerprint Test: See Your Tracking Score",
  metaDescription:
    "Read your canvas, WebGL, audio, font, screen and hardware signals, hash them to SHA-256 in your own tab, and score how identifiable you are out of 100.",
  intro:
    "Browser Fingerprint Visualizer reads the signals a website can silently collect about your browser — canvas and WebGL rendering, an AudioContext waveform, installed fonts, screen geometry, CPU cores, timezone, languages, storage and media devices — and turns them into a single SHA-256 fingerprint plus a 0-100 tracking risk score. It exists for anyone who wants to see what \"cookieless tracking\" actually looks like before they change browsers or install a blocker. The weighting follows the entropy ranking from the EFF's Panopticlick research: canvas is worth 20 points, WebGL 15, audio 10 and fonts 10, because those four carry the most identifying information.",
  useCases: [
    "Check whether a privacy extension or Firefox's resistFingerprinting actually changed your canvas and WebGL readings — run the tool, toggle the setting, run it again and compare the hash",
    "Show a client or a class the real difference between a cookie banner and fingerprinting, using their own laptop as the example",
    "Confirm that a hardened browser profile you built for research or reporting produces a common, low-entropy fingerprint rather than a distinctive one",
  ],
  benefits: [
    ["Signal-by-signal breakdown", "Every one of the twelve scored signals shows its own raw value and point contribution, so you can see which probe is exposing you."],
    ["Stability re-test", "Re-runs the collection to check whether your fingerprint holds steady between reads — a stable hash is what makes cross-site tracking possible."],
    ["Nothing leaves the browser", "All probes run locally in JavaScript and the fingerprint is hashed in your own tab; no reading is uploaded or stored on a server."],
  ],
  faqs: [
    [
      "What is a browser fingerprint?",
      "It is a profile built from configuration details your browser reveals automatically — screen size, timezone, installed fonts, GPU model, how your hardware renders a hidden canvas image and an audio waveform. The EFF's Panopticlick study found 83.6% of tested browsers had a fingerprint that was unique across the whole dataset, which is why the technique works without a single cookie.",
    ],
    [
      "How is the tracking risk score calculated?",
      "Twelve signals are scored and summed, then capped at 100: canvas 20, WebGL/GPU 15, audio 10, installed fonts 10, timezone 8, screen resolution 8, CPU cores plus device memory 7, languages 5, storage profile 4, media devices 4, touch points 3, and 3 for sending a Do-Not-Track header. Under 30 is Low, under 70 is Medium, 70 and above is High. Blocked or unavailable probes score zero, so a hardened browser genuinely scores lower — the one exception is languages, which floors at 2 points because every browser discloses at least one language even when reduced to a single generic value.",
    ],
    [
      "Does blocking cookies stop fingerprinting?",
      "No. Fingerprinting reads properties your browser must expose to render pages at all, so it survives cookie blocking, private browsing and clearing site data. What does help: Tor Browser and Firefox's privacy.resistFingerprinting, which return uniform canvas, font and screen values so many users share one profile; Safari's Intelligent Tracking Prevention, which reports a simplified system configuration; and Brave's per-session randomisation of canvas and audio readings.",
    ],
    [
      "What is the hash shown at the top?",
      "A SHA-256 digest — 64 hexadecimal characters — of every raw signal joined together. It is computed in your tab with the Web Crypto API and never sent anywhere. Change one input, such as connecting an external monitor or installing a font, and the hash changes completely, which is exactly how you can test whether a privacy setting worked.",
    ],
  ],
  steps: [
    "There is nothing to upload — collection starts the moment the page loads, and a progress bar pinned to the top names each probe as it runs: Reading browser information..., Reading screen & display info..., Detecting fonts..., Capturing canvas fingerprint..., Extracting WebGL fingerprint..., Generating fingerprint hash... and Calculating tracking risk score...",
    "Read the two cards at the top. Your Browser Fingerprint ID prints the 64-character digest under the note SHA-256 · 256-bit · Locally generated, and Tracking Risk Score counts up to a number out of 100 against the bands Low (0–30), Medium (30–70) and High (70–100); press Show score breakdown to see how many points each signal contributed.",
    "Press Copy Hash to put the digest on the clipboard — the button reads Copied! for two seconds — then change a browser or extension setting and press Re-run Analysis, which reads Analyzing... while it re-probes, to see whether the hash moved. Reloading the page instead feeds the Fingerprint Stability card, which compares the hash between visits and carries its own Reset test button.",
  ],
};

export default seo;
