const seo = {
  title: "Makeup Shade Finder: Undertone and Depth",
  metaDescription:
    "Averages the skin pixels in a selfie to read your undertone and depth, then names a shade with its hex across six categories, from foundation to bronzer.",
  steps: [
    "Drop a bare-faced, front-facing photo onto Upload a clear front-facing photo, or click to browse — the picker takes any image/* file and the image is drawn to a canvas in your own browser.",
    "The tool loads its TinyFaceDetector and 68-point landmark models, then runs Detecting face, Sampling skin regions and Finding your shades, stopping with an error if no face is found or fewer than 10 usable skin pixels can be sampled.",
    "The header states your undertone and skin depth with an Undertone Match bar; open Foundation, Concealer, Blush, Lipstick, Eyeshadow or Bronzer to read each named shade with its hex code, and Analyze Another clears the photo for a new one.",
  ],
  intro:
    "Makeup Shade Finder reads a selfie in the browser, locates your face with a TinyFaceDetector and a 68-point facial landmark model, samples the skin pixels from the centre of the face and the cheeks, and averages them into a single skin RGB value. From that average it estimates an undertone by comparing the red and blue channel balance and a depth score from perceived luminance, then suggests shades across six categories: foundation, concealer, blush, lipstick, eyeshadow and bronzer. The photo is analysed on your device and never leaves it.",
  useCases: [
    "Buying foundation online where you cannot swatch on your jaw, and needing a starting point on whether to filter for warm, cool or neutral shades.",
    "Working out why a blush you already own looks off — a cool pink against a warm-leaning skin average, or the reverse — before you buy a replacement.",
    "Building a first makeup kit and wanting one coherent set of suggestions across foundation, concealer, blush, lipstick, eyeshadow and bronzer rather than picking each category blind.",
  ],
  benefits: [
    [
      "Measured from your own pixels",
      "The suggestion comes from the average colour of skin pixels sampled inside a detected face box, not from a quiz about how you tan.",
    ],
    [
      "Undertone and depth reported separately",
      "You see the detected undertone and the skin depth as two distinct readings, which is how shade ranges are actually organised on a brand's chart.",
    ],
    [
      "The photo stays on your device",
      "Face detection and colour sampling run in your browser, so the selfie is never uploaded to a server for analysis.",
    ],
  ],
  faqs: [
    [
      "How does it work out my undertone?",
      "It averages the red, green and blue values of skin pixels sampled from the mid-face and cheek regions, then compares the warm (red) and cool (blue) channel balance to classify the result as warm, cool or neutral. Undertone is the constant colour beneath the surface, which is why the sample is taken from an even area of skin rather than a flushed or blemished patch.",
    ],
    [
      "What photo gives the best result?",
      "A front-facing, close, bare-faced selfie in even daylight, with no filter and no makeup on the cheeks. The analysis stops and asks for another photo if it cannot detect a face or cannot sample at least 10 usable skin pixels, which is usually caused by low light, heavy shadow or the face being too small in frame.",
    ],
    [
      "How many product categories does it cover?",
      "Six: foundation, concealer, blush, lipstick, eyeshadow and bronzer. Each returns a named shade with its hex colour so you can compare it against a swatch image on a retailer's page.",
    ],
    [
      "Is my selfie uploaded anywhere?",
      "No. The face detection models are loaded into your browser and the image is drawn to a local canvas, so the pixel analysis happens on your device and no photo is sent to a server or stored.",
    ],
  ],
};

export default seo;
