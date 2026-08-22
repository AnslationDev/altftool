const seo = {
  title: "Road Roughness Logger: Jolts Over 12 m/s²",
  metaDescription:
    "Logs a jolt whenever total acceleration passes 12 m/s², alongside GPS fixes with lat/long to six decimals, speed in km/h and accuracy in metres.",
  steps: [
    "Mount the phone so it moves with the vehicle rather than rattling loose, then press Start with permission to allow motion and location.",
    "Drive the route: any device-motion sample whose acceleration including gravity exceeds 12 m/s² is appended as a Jolt row with its magnitude.",
    "Watch Live local readings fill with timestamped GPS fixes — latitude and longitude to six decimals, speed in km/h, accuracy in metres — then press Stop sensor.",
  ],
  intro:
    "Road Roughness Logger records road jolts from a phone's accelerometer alongside a live GPS track, timestamping every reading so bumps can be matched to a place and a speed. It flags a jolt whenever the total acceleration including gravity exceeds 12 m/s² — roughly 2 m/s² above the ~9.81 m/s² a stationary device reads — and logs each GPS fix with latitude and longitude to six decimals, speed converted to km/h, and the reported accuracy in metres. It is for anyone who wants evidence about a rough stretch of road rather than an impression of one.",
  useCases: [
    "You are reporting a stretch of broken road to a municipal body and want a timestamped list of jolts with the coordinates where each one happened.",
    "Two routes to the same place feel different in the car, and you want to log both runs and compare how many jolts each produced.",
    "You are checking whether new suspension, tyres or tyre pressure changed anything, by driving the same road before and after and comparing the jolt magnitudes.",
  ],
  benefits: [
    ["Jolts and position on one timeline", "Accelerometer events and GPS fixes are appended to the same timestamped log, so a spike can be traced to the point on the route where it occurred."],
    ["A stated, checkable trigger", "Rows are only written above 12 m/s² of total acceleration, so you know exactly what counted as a jolt instead of trusting an opaque score."],
    ["High-accuracy positioning", "The GPS watch runs with high accuracy enabled and no cached positions, and every fix carries its own accuracy figure in metres so you can discard weak fixes."],
  ],
  faqs: [
    [
      "What counts as a jolt?",
      "Any device-motion sample whose combined X, Y and Z acceleration including gravity exceeds 12 m/s². Since a phone lying still already reads about 9.81 m/s² from gravity alone, that threshold corresponds to roughly 2 m/s² of genuine vertical disturbance.",
    ],
    [
      "Do I need to mount the phone a particular way?",
      "The magnitude is the vector length across all three axes, so orientation does not change the trigger, but mounting does change the reading. A phone rattling loose in a cup holder registers its own movement as road roughness — clamp it to the car so it moves with the vehicle.",
    ],
    [
      "Why does the speed column say unavailable?",
      "Because the browser's Geolocation API only reports speed when the device can derive it, typically from consecutive GPS fixes while moving. Stationary starts, indoor use and some desktop browsers return null, and the log records that rather than guessing a value.",
    ],
    [
      "Are these readings accurate enough for engineering use?",
      "No. Consumer phone accelerometers are uncalibrated and sampling rates vary by device and browser, so the output is indicative rather than a certified roughness index such as IRI. Use it to spot and document problem stretches, not to certify pavement condition.",
    ],
  ],
};

export default seo;
