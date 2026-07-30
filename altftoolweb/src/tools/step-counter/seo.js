/**
 * Search Console (7 days) shows this page owning the modified long tail —
 * "step counter online" (pos 2.54), "step counter online free" (2.20),
 * "step counter online without app" (1.90) — while the bare head term
 * "step counter" sits at 10.56 with 349 impressions and 3 clicks.
 *
 * The gap was never keyword presence ("step counter" is a substring of every
 * phrase here). It was depth: the copy only ever argued "this is the version
 * you don't have to install", and answered nothing a person typing the plain
 * head term wants to know — what a step counter actually is, whether it works
 * in a pocket, whether it survives the screen turning off, how the distance
 * and calorie numbers are produced, where the data goes.
 *
 * Every claim below is traceable to code:
 *   utils/stepDetector.js  — gravity removal, SMOOTH_WINDOW, hysteresis peaks,
 *                            MIN/MAX_STEP_MS cadence gate, CONFIRM_STEPS = 4
 *   utils/useStepCounter.js— devicemotion only, no simulated counting, iOS
 *                            DeviceMotionEvent.requestPermission, no sensor =
 *                            session runs but the count never moves
 *   utils/stepStore.js     — METERS_PER_STEP 0.762, CALORIES_PER_STEP 0.04,
 *                            STEPS_PER_FLOOR 650, DEFAULT_GOAL 10000,
 *                            MIN_GOAL 500, MAX_GOAL 100000, localStorage only
 * Nothing here may claim a body-weight calorie model, a barometer, a personal
 * stride, offline support (the root service worker unregisters itself, see
 * public/sw.js), or background counting.
 */

const seo = {
  // Rendered title = this + " | AltFTool" (44 + 11 = 55 chars). The exact
  // phrase "Step Counter Online" stays at the front on purpose — it is the
  // 303-click query and is not worth risking for the head term.
  title: "Step Counter Online — Free Pedometer, No App",
  h1: "Step Counter Online",
  metaDescription:
    "A free step counter online: your phone's motion sensor counts every step as you walk, with distance and calories. No app, no signup, nothing uploaded.",
  intro:
    "A step counter — a pedometer — counts your steps by measuring the small, repeating acceleration your body produces each time a foot lands. This one does that in your phone's browser: it reads the built-in accelerometer through the browser's motion API, so there is no app to install and no account to create. The detection runs the same pipeline a dedicated pedometer uses — gravity is filtered out of the raw reading, the signal is smoothed, peaks are found with hysteresis, and a walking-cadence gate holds the first steps back until four of them arrive in rhythm. A tap, a single bump, or a phone picked up off a table therefore counts as zero rather than inflating your total. The accelerometer only exists on a phone or tablet, so a laptop counts nothing at all, and every step, goal and daily total is written to your browser's local storage on that device — there is no account and no upload.",
  useCases: [
    "Counting a walk, a treadmill session, or laps around the block without installing a fitness app",
    "Using a phone or tablet with no built-in pedometer, or one whose health app you'd rather not sign in to",
    "Tracking a walking challenge, a rehab walk, or a daily activity goal, with each day stored separately",
    "Checking roughly how far a walk was — steps convert to distance and calories as you go",
    "Counting steps on a borrowed or shared phone, where installing anything isn't an option",
    "Watching your last seven days and your current streak without handing step data to a fitness service",
  ],
  benefits: [
    [
      "No app, no account",
      "Open the page on your phone, tap start, and it counts. Nothing to download, no signup, and no limit on how many steps you log.",
    ],
    [
      "Real sensor, real steps",
      "Every step comes from your phone's accelerometer. There is no demo mode and no simulated counter — where there is no sensor, the number honestly stays at zero.",
    ],
    [
      "Pedometer-grade filtering",
      "Gravity is removed from the raw reading, the signal is smoothed, and peaks have to arrive four in a row at a walking cadence before anything is counted, so taps and bumps score nothing.",
    ],
    [
      "Distance and calories you can correct",
      "Steps drive estimated distance and calories. Add your height and weight in settings and both are worked from your own figures instead of a population average; every estimate is labelled as one.",
    ],
    [
      "Your data stays on your phone",
      "Steps, goal, streak and achievements are written to your browser's local storage. No account, no network call, nothing uploaded anywhere.",
    ],
    [
      "Your day and your history are kept",
      "Each date is stored on its own, so today's total, the seven-day chart and your streak are still there the next time you open the page.",
    ],
  ],
  faqs: [
    [
      "What is a step counter?",
      "A step counter, also called a pedometer, counts the steps you take by watching the small, repeating acceleration your body makes each time a foot lands. It doesn't use GPS, and no part of the counting talks to a server — all it needs is a motion sensor and a walking rhythm to look for in it. This one runs that detection inside your phone's browser, so the sensor is your phone's own accelerometer and the count never leaves the device.",
    ],
    [
      "How does an online step counter work without installing an app?",
      "It reads your phone's built-in accelerometer through the browser's motion-sensor API — the same sensor a native pedometer app uses — so no install and no account are needed. On iPhone, Safari asks permission to share motion data before counting can start.",
    ],
    [
      "Does the step counter work on a desktop or laptop?",
      "No. Step detection needs a physical motion sensor, and desktops and laptops don't have one. The session will still run and time your activity, but the step count stays at zero instead of faking a number. Open the page on a phone or tablet you can carry while you walk.",
    ],
    [
      "Does it count with the phone in my pocket?",
      "Yes — the detector is tuned for a phone held in your hand or carried in a pocket at a normal walking cadence. What it deliberately ignores is anything that isn't rhythmic: a phone lying on a desk, a tap, a jolt, or being picked up all register as zero steps.",
    ],
    [
      "Does it keep counting when the screen turns off?",
      "No. Browsers stop delivering motion events once the phone sleeps or you switch away to another app, so counting pauses until you come back to the page. For a full walk, keep the screen awake with the page open. Whatever was counted before the screen slept is already saved.",
    ],
    [
      "How accurate is the step count?",
      "It uses the technique dedicated pedometers use: gravity-compensated acceleration, smoothing, and hysteresis peak detection behind a walking-cadence gate. Nothing is counted until four peaks arrive in a valid rhythm, which is why the first steps of a walk appear together in a small burst and why a couple of steps across a room may not register at all. Accuracy is best over a steady walk with the phone in hand or in a pocket.",
    ],
    [
      "How are distance and calories calculated?",
      "Both are estimates, and both are marked as such on screen. Distance uses your step length: 0.415 x your height if you enter it, otherwise a 0.75 m population average. Calories scale with your body weight at roughly 0.0006 kcal per step per kilogram, defaulting to 70 kg until you say otherwise. There is no floors figure — that needs a barometer, which a browser cannot read.",
    ],
    [
      "Is my step data private?",
      "Yes. Your steps, goal, streak and achievements are saved in your browser's local storage on that device and are never sent anywhere — there is no account, no sign-in and no server call. Nobody else, including us, can see your count.",
    ],
    [
      "Why do I need to allow motion access on my iPhone?",
      "iOS requires an explicit permission before any website can read the accelerometer, as a privacy protection. Tap \"Allow\" when prompted — without it the counter can't detect movement and will stay at zero. Android browsers don't ask for this extra step.",
    ],
    [
      "Is this step counter free, and does my count save?",
      "It's completely free, with no signup and no step limit. Your count saves automatically to your browser's local storage, so it survives closing the tab, reloading, or restarting the phone. It won't appear on a different browser or device, because nothing is sent to a server. The daily goal starts at 10,000 steps and can be set anywhere from 500 to 100,000.",
    ],
    [
      "Can I use it for running or a workout, not just walking?",
      "It's tuned for a walking cadence. Running, cycling, or exercise with a different rhythm may under- or over-count, because the cadence gate expects footstep-like timing between peaks.",
    ],
  ],
  steps: [
    // toolSeoContent.js prepends "Open Step Counter on AltFTool — it loads
    // instantly in your browser." to curated steps, so these three must not
    // start with "Open" again. Three curated + one prepended = a clean row of
    // four in ToolSeoSection's lg:grid-cols-4 layout.
    "Use a phone or tablet — a laptop has no motion sensor, so it cannot count steps.",
    "Tap Start and allow motion access if your browser asks; iOS won't hand the accelerometer to a website without it.",
    "Walk normally with the phone in hand or in your pocket. The first few steps are held back until a steady rhythm confirms, then released together, and your total saves as you go.",
  ],
};

export default seo;
