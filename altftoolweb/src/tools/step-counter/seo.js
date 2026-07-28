const seo = {
  title: "Step Counter Online — Free Pedometer, No App",
  h1: "Step Counter Online",
  metaDescription:
    "Free step counter online — no app to install. Uses your phone's motion sensor with real pedometer-grade step detection, right in your browser.",
  intro:
    "The Step Counter tracks your walking steps online using your phone's built-in accelerometer — no app install and no account needed. It runs a real pedometer algorithm: gravity-compensated acceleration, smoothing, and hysteresis peak detection with cadence gating, so a picked-up phone, a tap, or a single bump reads as zero steps instead of inflating your count.",
  useCases: [
    "Counting a walk or workout without installing a fitness app",
    "Checking daily step totals on a phone or tablet that doesn't have a pedometer built in",
    "Quick step tracking for a walking challenge, rehab exercise, or daily activity goal",
  ],
  benefits: [
    [
      "No app, no install",
      "Works straight from your mobile browser — open the page and start counting; nothing to download or sign up for.",
    ],
    [
      "Real pedometer-grade detection",
      "Uses gravity-compensated acceleration and cadence-gated peak detection, the same approach dedicated pedometers use, so taps, bumps, and a stationary phone don't get counted as steps.",
    ],
    [
      "Honest by design",
      "If your device has no motion sensor, the count stays at zero instead of faking a number — there's no simulated fallback.",
    ],
    [
      "Free, and your progress is saved",
      "No signup and no step limit. Your count is saved to your browser's local storage, so it survives closing the tab or restarting your phone.",
    ],
  ],
  faqs: [
    [
      "How does an online step counter work without installing an app?",
      "It reads your phone's built-in accelerometer through the browser's motion-sensor API — the same sensor a native pedometer app uses — so no install or account is needed. On iPhone, Safari asks for one-time permission to share motion data before it can start counting.",
    ],
    [
      "Is this step counter free?",
      "Yes, completely free with no signup, no step limit, and no app to install — it runs entirely in your mobile browser.",
    ],
    [
      "How accurate is the step count?",
      "It uses the same core technique as dedicated pedometers: gravity-compensated linear acceleration, smoothing, and hysteresis peak detection with a cadence gate, so isolated taps, bumps, or a phone sitting on a desk read as zero steps. Accuracy is best when the phone is held or in a pocket during a steady walking rhythm.",
    ],
    [
      "Why do I need to allow motion access on my iPhone?",
      "iOS requires an explicit one-time permission before any website can read the accelerometer, as a privacy protection. Tap \"Allow\" when prompted — the counter can't detect movement without it. Android browsers don't require this extra step.",
    ],
    [
      "Does the step counter work on a desktop or laptop?",
      "No — step detection needs a physical motion sensor, which desktops and laptops don't have. Use it on a phone or tablet you can carry while walking; on desktop the session still runs, but the count stays at zero rather than faking a result.",
    ],
    [
      "Can I use it for running or a workout, not just walking?",
      "It's tuned for a walking cadence. Running, cycling, or exercises with a different rhythm may under- or over-count, since the cadence gate expects footstep-like timing.",
    ],
    [
      "Does my step count save if I close the browser?",
      "Yes — your count is saved to your browser's local storage on that device, so it survives closing the tab, reloading, or restarting your phone. It won't sync to a different browser or device, since nothing is sent to a server.",
    ],
  ],
  steps: [
    "Open the Step Counter on your phone and tap Start — no download or signup.",
    "Allow motion access if your browser asks (required once on iPhone).",
    "Walk normally with the phone in hand or your pocket; the count updates live and saves automatically.",
  ],
};

export default seo;
