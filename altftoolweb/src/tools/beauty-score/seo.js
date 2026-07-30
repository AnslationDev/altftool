const seo = {
  intro:
    "The Beauty Score Calculator is an entertainment tool that measures two geometric properties of a face — left/right symmetry and how close its proportions sit to the golden ratio of 1.618 — using 68 facial landmark points detected in your browser. It combines them as 60 percent symmetry and 40 percent proportion into a single novelty score. It measures distances between landmarks, nothing more: attractiveness is cultural, personal and not something a ratio can decide, so treat the number as a party trick rather than a verdict.",
  useCases: [
    "You and a friend are curious how a photo scores and want to compare which of two shots the landmark detector reads as more symmetric.",
    "You are teaching a class about the golden ratio and want a live demonstration of how a face's height-to-width proportion is measured from real landmark coordinates.",
    "You have heard the claim that faces are judged on symmetry and want to see for yourself what a symmetry percentage from actual measurements looks like on your own photo.",
  ],
  benefits: [
    ["Shows the two component scores", "Symmetry and golden-ratio proportion are reported separately, so you can see what is driving the number rather than getting one opaque figure."],
    ["Real landmark geometry", "Distances are computed from 68 detected face points — jaw outline, eye centres, nose tip and mouth — not guessed from the image as a whole."],
    ["The photo stays on your device", "Face detection and landmark models run in the browser, so the image is never sent to a server for scoring."],
  ],
  faqs: [
    [
      "How is the beauty score calculated?",
      "Symmetry is the ratio of the shorter to the longer distance from the nose tip to each side of the jaw, expressed as a percentage. The golden-ratio score averages how close the face height-to-width ratio is to 1.618 and how close the face-width to eye-distance ratio is to about 2.15. The final number is 60 percent symmetry plus 40 percent proportion, with a small random variance added and the result kept within a 65 to 99 range.",
    ],
    [
      "Is this a real measure of how attractive I am?",
      "No. It measures distances between detected landmark points and nothing else. It cannot see skin, expression, colouring, movement or personality, standards of beauty vary enormously across cultures and eras, and the score is deliberately floored so it stays a light-hearted result. Do not use it to make any decision about your appearance.",
    ],
    [
      "Why does the same photo give a slightly different score each time?",
      "A random variance of up to plus or minus 2.5 points is added on purpose to keep the result playful, and the landmark detector can place points a pixel or two differently between runs. The underlying symmetry and proportion figures stay close, so look at those if you want the more stable numbers.",
    ],
    [
      "What makes a photo work best?",
      "One face, looking straight at the camera, evenly lit, with the whole jawline visible. The detector uses a 512-pixel input with a 0.5 confidence threshold and analyses a single face, so a turned head, heavy shadow across one side or a partly cropped chin will distort the symmetry measurement or prevent detection entirely.",
    ],
  ],
};

export default seo;
