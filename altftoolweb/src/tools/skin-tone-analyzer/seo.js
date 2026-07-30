const seo = {
  intro:
    "The Skin Tone Analyzer reads a webcam frame or uploaded photo, locates your face with a TinyFaceDetector model, samples a 50x50 pixel patch on the cheek, and averages it into a single skin colour it reports as HEX, RGB and HSL. It then converts that colour into two labels: an undertone taken from the hue angle (roughly 14-36 degrees reads warm, below 14 or above 320 reads cool, anything else neutral) and a Fitzpatrick type from I to VI taken from the lightness value. It is for anyone matching foundation, choosing wardrobe colours or picking a jewellery metal who wants a measured starting point instead of a guess in a shop mirror.",
  useCases: [
    "You are buying foundation online with no tester available and want your cheek colour as an actual HEX value you can compare against a brand's shade swatches.",
    "You keep being told you 'suit gold' by one friend and 'suit silver' by another, and want the hue of your own skin to settle which metal the analysis points to.",
    "You are building a capsule wardrobe and want a short palette of power colours and lipstick shades derived from your measured undertone rather than a quiz.",
  ],
  benefits: [
    ["Samples the cheek, not the frame", "Face detection places the sample box at about 65% across and 60% down the detected face, so hair, background and clothing do not skew the average."],
    ["Gives you the raw numbers", "You get HEX, RGB and HSL for the sampled patch, so you can paste the value into any shade-matching chart yourself."],
    ["Two standards in one pass", "The same sample drives both the warm/cool/neutral undertone call and the Fitzpatrick I-VI classification, so the two never contradict each other."],
  ],
  faqs: [
    [
      "How does this tool decide if my skin is warm, cool or neutral?",
      "It converts the averaged cheek colour to HSL and reads the hue angle: about 14-36 degrees is reported as warm, below 14 or above 320 as cool, and everything in between as neutral. Because hue shifts with lighting, a photo shot in daylight will classify more reliably than one under a warm indoor bulb.",
    ],
    [
      "What is the Fitzpatrick scale and how is my type worked out here?",
      "The Fitzpatrick scale is a six-step classification (Type I to Type VI) describing how skin responds to sun, from always burns and never tans to deeply pigmented and never burns. This tool assigns it from the lightness channel of your sampled colour, with the brightest readings mapping to Type I and the darkest to Type VI. A clinical Fitzpatrick assessment also asks about your burn and tan history, so treat this as informational and see a dermatologist for anything sun-safety related.",
    ],
    [
      "Can I upload a photo instead of using my webcam, and how big can it be?",
      "Yes, uploads work the same as a webcam capture and the size limit is 15MB. A straight-on, evenly lit shot with your cheek clearly visible gives the most stable sample, since the analyser reads one small patch rather than the whole face.",
    ],
    [
      "Why does the jewellery recommendation change between gold and silver?",
      "It follows the undertone result directly: warm undertones return yellow gold, cool undertones return silver and white gold, and neutral undertones return a balanced gold-and-silver suggestion. It is a starting point drawn from your measured hue, not a rule, so try both against your skin before buying.",
    ],
  ],
};

export default seo;
