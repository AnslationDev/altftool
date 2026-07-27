const seo = {
  intro:
    "This suggester takes the hex value of a wall you already have and returns eight accent colours built from the standard colour-wheel harmonies — complementary, split-complementary, analogous, triadic, monochromatic and a near-neutral anchor — each reported with its Light Reflectance Value so it can be matched against a paint chip. LRV is the CIE Y value expressed as a percentage, identical to the WCAG relative luminance formula (0.2126R + 0.7152G + 0.0722B on linearised channels), which is the same number paint manufacturers print on the back of a sample. It is aimed at anyone repainting one wall and unsure whether a shade will read as a deliberate accent or as a patch, since the tool also checks that each candidate clears the trade rule of roughly 10 LRV points from the existing wall.",
  useCases: [
    "Choosing a feature wall behind a bed when the other three walls are already a warm off-white and you want depth without a colour clash",
    "Picking a deeper version of an existing green so a chimney breast reads as intentional rather than as a second-coat mismatch",
    "Checking whether white or dark trim, skirting and lettering will stay legible against a proposed dark accent colour",
  ],
  benefits: [
    ["LRV on every suggestion", "The same number printed on a paint chip, so a shade can be matched in a shop instead of guessed from a screen."],
    ["A real accent, not a patch", "Each candidate is tested against the 10-point LRV rule, and anything that fails is flagged rather than quietly recommended."],
    ["Trim and legibility checked", "WCAG contrast decides whether white or near-black trim survives on the accent, with the 4.5:1 threshold shown."],
  ],
  faqs: [
    [
      "How do I choose an accent wall colour that matches my existing paint?",
      "Take the hue of the existing wall and move around the colour wheel by a fixed angle — 150° or 210° gives the safest strong accent, 30° gives a quiet shift, and staying on the same hue with more saturation and less lightness gives the lowest-risk option of all. Then check the two colours are at least 10 LRV points apart, otherwise the accent reads as a bad touch-up rather than a decision.",
    ],
    [
      "What is LRV and why does it matter for an accent wall?",
      "LRV, Light Reflectance Value, is the percentage of visible light a colour reflects, from 0 for absolute black to 100 for pure white. It matters because a wall below about LRV 20 absorbs most of the light hitting it, so a deep accent in a small or north-facing room will noticeably darken the whole space unless the lighting is increased.",
    ],
    [
      "Should the accent wall be darker or lighter than the other walls?",
      "Darker, if the existing walls are light — that is the conventional feature wall and it makes the room feel deeper. If the existing walls are already dark, below roughly LRV 45, go lighter instead, because a second dark colour will simply disappear into the first under normal room lighting.",
    ],
    [
      "Does the direction a room faces change which accent colour works?",
      "Yes, noticeably. In the northern hemisphere a north-facing room gets cool indirect skylight that drains warmth from a colour, so warm and slightly lighter accents hold up better, while a south-facing room gets warm direct sun for most of the day and can carry a cooler, deeper shade. Reverse north and south in the southern hemisphere, and always test a sample on the actual wall at several times of day before buying the full tin.",
    ],
  ],
};

export default seo;
