const seo = {
  title: "Surface Vibration Recorder - X/Y/Z Accelerometer",
  metaDescription:
    "Logs your phone accelerometer as a timestamped timeline: X, Y and Z in m/s² to three decimals plus rotation rate, latest 200 samples.",
  steps: [
    "Rest the phone flat on the surface you are checking - a washing machine, desk or machine housing - because the log reads the device's own accelerometer.",
    "Press \"Start with permission\" and approve the motion prompt; on iOS that fires DeviceMotionEvent.requestPermission(), after which the button reads \"Stop sensor\".",
    "Watch the \"Live local readings\" table: every row is an ISO timestamp, the X, Y and Z acceleration including gravity to three decimals in m/s², and the combined gyroscope rotation-rate magnitude, keeping the latest 200 samples.",
  ],
  intro:
    "This is a browser-based vibration logger that reads your phone's accelerometer through the DeviceMotion API and builds a timestamped timeline of how much a surface is shaking. Each sample records the X, Y and Z components of acceleration including gravity in m/s² to three decimals, plus a single combined rotation-rate figure taken as the vector magnitude of the alpha, beta and gamma gyroscope axes. Put the phone on the washing machine, the desk or the machine housing, press start, and you get a rolling log of the last 200 readings without installing anything.",
  useCases: [
    "Your washing machine walks across the floor on the spin cycle and you want to see whether levelling the feet actually reduced the shaking, by logging the same 30 seconds before and after",
    "A desk fan, fridge compressor or server rack in the next room hums at certain times and you want a timestamped record of when the vibration spikes, so the landlord or facilities team has something concrete",
    "You are checking whether a tripod, shelf bracket or 3D printer frame settles after a knock, and want to watch the acceleration figures return to a steady baseline instead of judging it by hand",
  ],
  benefits: [
    ["Raw axis values, not a single meter", "Every sample keeps X, Y and Z separately, so you can tell a side-to-side wobble from a vertical thump instead of seeing one merged number."],
    ["Rotation logged alongside acceleration", "Each row carries the combined gyroscope rotation-rate magnitude, which separates a rocking or twisting motion from pure linear shake."],
    ["ISO-timestamped rolling timeline", "Readings are stamped in ISO 8601 and kept as the most recent 200 samples, so a spike can be matched to the moment it happened."],
  ],
  faqs: [
    [
      "Why is nothing appearing when I press start?",
      "Almost always it is the permission or the device. The DeviceMotion API only works in a secure HTTPS context, iOS requires an explicit DeviceMotionEvent.requestPermission() approval triggered by your tap, and most desktop and laptop machines have no accelerometer to report from at all — use a phone or tablet.",
    ],
    [
      "What units are the numbers in?",
      "Acceleration is in metres per second squared (m/s²) and rotation rate is in degrees per second. Because the reading is accelerationIncludingGravity, a phone lying flat and perfectly still still shows roughly 9.8 m/s² on the axis pointing down — that gravity offset is the baseline, and vibration is the deviation around it.",
    ],
    [
      "Can I use this instead of a proper vibration meter?",
      "No — treat it as indicative only. Phone accelerometers are uncalibrated, the browser caps and smooths the sampling rate, and the reading depends heavily on how the device is resting on the surface, so the figures are not comparable to a calibrated ISO 10816-class instrument or acceptable as compliance evidence.",
    ],
    [
      "How fast does it sample?",
      "It records whatever rate the browser delivers devicemotion events at, which is typically around 60 events per second and is deliberately throttled by the browser on some devices for privacy and battery reasons. That is fast enough for machine wobble and footfall, but it will miss high-frequency vibration well above a few tens of hertz.",
    ],
  ],
};

export default seo;
