const seo = {
  title: "Seasonal Color Analysis from a Selfie, in Your Browser",
  metaDescription:
    "Samples skin, hair and cheek RGB in-browser: red over blue by 25 sets warm or cool, an 80-point luminance gap sets contrast. Four seasons, four colours.",
  steps: [
    "Upload a clear front-facing photo — drag and drop your image, or click to browse — ideally in natural light with no filter.",
    "Face detection runs in your browser and samples the average RGB of your skin, hair and cheeks; the image never leaves your device.",
    "Get Warm Autumn, Clear Spring, Deep Winter or Cool Summer with Your Color Palette of four named hex swatches and the Detected Colors behind them.",
  ],
  intro:
    "Seasonal color analysis places you in a colour season by measuring two things from a selfie: whether your skin reads warm or cool, and how much luminance contrast there is between your hair and your face. The tool detects your face in the browser, samples the average RGB of your skin, hair and cheeks, and returns one of four seasons — Warm Autumn, Clear Spring, Deep Winter or Cool Summer — with a four-colour palette. It is for anyone deciding which shirt, lipstick or hair colour will actually flatter them instead of guessing in a fitting room.",
  useCases: [
    "You are standing in a shop between a cool-toned charcoal blazer and a warm camel one and want a reason to pick, not a coin flip.",
    "Your wardrobe is full of clothes you never wear and you want to know whether the common thread is that they all fight your undertone.",
    "You are booking a hair colour appointment and want a starting vocabulary — warm or cool, high or low contrast — to bring to the stylist.",
  ],
  benefits: [
    [
      "Measured, not eyeballed",
      "Your season comes from actual pixel averages of skin, hair and cheek regions, with the RGB values shown so you can check them.",
    ],
    [
      "Two explicit axes",
      "Warm-versus-cool and high-versus-low contrast are scored separately, so you can see which of the two put you in your season.",
    ],
    [
      "A palette you can shop with",
      "Each season returns four named colours with hex codes, so you can match paint chips, swatches or filter a product page.",
    ],
  ],
  faqs: [
    [
      "How does it decide if I am warm or cool?",
      "It compares the red and blue channels of your average skin colour: if red exceeds blue by more than 25 (on the 0-255 scale), you are classified warm, otherwise cool. That single threshold is the warm/cool axis of the result.",
    ],
    [
      "What decides between Deep Winter and Cool Summer?",
      "Contrast. The tool computes perceived brightness of your hair and your skin using the standard 0.299R + 0.587G + 0.114B luminance formula; a gap over 80 counts as high contrast. Cool plus high contrast gives Deep Winter, cool plus low contrast gives Cool Summer.",
    ],
    [
      "Does my photo get uploaded anywhere?",
      "No. Face detection runs in your browser using a TinyFaceDetector model at a 320-pixel input size plus a 68-point landmark model, both loaded into the page. The image is drawn to a local canvas and read pixel by pixel; it never leaves your device.",
    ],
    [
      "Why did it say it could not analyse my photo?",
      "Most often there was no forward-facing face to detect, or fewer than 10 usable skin pixels in the sampled central-face region. Use a close, evenly lit photo with no heavy filter, sunglasses or strong coloured lighting — a warm indoor bulb can shift your reading toward a warm season on its own. Treat the result as a styling starting point rather than a verdict.",
    ],
  ],
};

export default seo;
