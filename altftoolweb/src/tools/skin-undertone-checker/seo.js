const seo = {
  intro:
    "The Skin Undertone Checker classifies a selfie as warm, cool or neutral by detecting your face, sampling pixels from the centre of the face and from both cheeks, and comparing the combined red channel against the combined blue channel. A red-over-blue gap wider than 35 reads warm, a gap under 15 reads cool, and anything in between reads neutral, which it reports as a warm-versus-cool pigment balance along with foundation and jewellery suggestions. It is for anyone stuck between two foundation shades or unsure whether gold or silver sits better against their skin.",
  useCases: [
    "You are ordering foundation online and need to choose between a warm golden line and a pink-toned line without a counter test.",
    "Two shades look almost identical in the tube and you want a warm-versus-cool reading of your own skin to break the tie before you buy.",
    "You are picking an engagement or wedding ring metal and want to know whether yellow gold or white gold and platinum is the better match for your undertone.",
  ],
  benefits: [
    ["Samples three regions, not one pixel", "It reads a block from the centre of the face plus a patch on each cheek, so a single shadow or blemish cannot decide your result."],
    ["Tells you when the photo is not good enough", "If the face is not found or fewer than about 10 usable skin pixels are collected, it stops and asks for a closer, better-lit shot instead of returning a guess."],
    ["Turns the reading into shopping language", "Results map to the naming schemes you actually see on shelves, pointing warm skin at golden NC-style shades, cool at pink NW-style shades and neutral at N-style shades."],
  ],
  faqs: [
    [
      "How do I know if my skin undertone is warm, cool or neutral?",
      "This tool decides it by measuring how far the red in your skin exceeds the blue: a gap above 35 is reported as warm, a gap below 15 as cool, and the range between as neutral. The classic at-home checks point the same way: veins that look green, skin that tans easily and a better look in gold usually track warm, while blue-looking veins, easy burning and a better look in silver track cool.",
    ],
    [
      "Which regions of my face does the analysis actually sample?",
      "It samples a block across the middle of the detected face, roughly the central tenth of its width at nose height, plus two cheek patches at about a third and two-thirds across. Averaging those areas avoids lips, eyes, eyebrows and hair, which would otherwise pull the colour reading off.",
    ],
    [
      "What kind of photo gives the most accurate result?",
      "A forward-facing selfie in even, neutral daylight with no makeup and no filter. Coloured indoor bulbs, heavy foundation and beauty filters all shift the red and blue channels the tool compares, and a face angled away can push the cheek sample onto hair or background.",
    ],
    [
      "Does my undertone change over time?",
      "Your underlying undertone stays essentially fixed, but your surface tone can lighten or deepen by a shade or two with sun exposure across the year. That is why many people keep two foundation shades in the same undertone family rather than switching between warm and cool.",
    ],
  ],
};

export default seo;
