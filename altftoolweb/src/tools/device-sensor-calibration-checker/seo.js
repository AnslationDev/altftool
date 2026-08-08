const seo = {
  title: "Phone Accelerometer and Gyroscope Bias Checker",
  metaDescription:
    "Stream DeviceMotion samples and log accelerometer X, Y and Z including gravity to three decimals plus the combined gyroscope rotation rate, locally.",
  steps: [
    "Lay the phone flat and still, press \"Start with permission\" and allow motion access when the browser asks.",
    "Watch the Live local readings table add one timestamped row per sample: accelerometer X, Y and Z including gravity to three decimals, plus the combined rotation-rate magnitude.",
    "Check that a face-up handset reads about 9.8 on the Z axis with X, Y and the rotation rate near zero, then press \"Stop sensor\".",
  ],
  intro:
    "The Device Sensor Calibration Checker streams your phone's motion sensors through the browser's DeviceMotion API and logs a timestamped row for each sample: accelerometer X, Y and Z including gravity, to three decimals, plus the combined gyroscope rotation-rate magnitude across alpha, beta and gamma. Rest the device on a flat surface and the readings tell you whether its sensors sit near their expected at-rest values or carry a visible bias. It is a quick sanity check for anyone whose compass drifts, whose step count looks wrong, or who wants to see raw sensor output before blaming an app.",
  useCases: [
    "Your fitness app has started overcounting steps and you want to see whether the accelerometer reads sensibly with the phone lying still on a table.",
    "A phone came back from repair and you want to confirm the motion sensors respond at all — tilt it through each axis and watch X, Y and Z swap magnitudes.",
    "You are building a web app that uses devicemotion and want to see what your test handset actually reports, including whether the browser grants the permission at all.",
  ],
  benefits: [
    ["Raw numbers, not a verdict", "Shows the actual per-axis accelerometer values and rotation-rate magnitude so you can judge drift yourself instead of trusting a pass badge."],
    ["A rolling live log", "Keeps a continuous timestamped stream of the most recent samples, so a bias that only appears intermittently still shows up in the history."],
    ["Explicit permission, local only", "Nothing starts until you press start and grant motion access, and the readings stay in the page — they are never uploaded."],
  ],
  faqs: [
    [
      "What should my accelerometer read when the phone is lying flat?",
      "With the device face up and still, the Z axis should sit near 9.8 m/s² — one g — while X and Y hover close to zero and the rotation rate stays near zero. A persistent offset from those values on a motionless device is the bias you are looking for.",
    ],
    [
      "Why does the tool ask for permission before it starts?",
      "iOS and other modern browsers require an explicit user gesture and a permission grant before releasing DeviceMotion data, and the page only works in a secure context. If permission is declined or the browser exposes no motion sensor, it says so rather than showing zeros.",
    ],
    [
      "Which sensors does it actually read?",
      "Two: the accelerometer, reported as acceleration including gravity on the X, Y and Z axes, and the gyroscope, reported as a single rotation-rate magnitude combining the alpha, beta and gamma rates. Browsers do not expose a raw magnetometer through this API.",
    ],
    [
      "Can I use this to calibrate my sensors?",
      "No — it observes what the sensors report but cannot write calibration values back to the device. Use it to spot a problem, then recalibrate through your phone's own settings or compass app, and treat the readings as approximate rather than safety-certified measurements.",
    ],
  ],
};

export default seo;
