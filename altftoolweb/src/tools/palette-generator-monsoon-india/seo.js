const seo = {
  intro:
    "The Monsoon India Palette Generator builds six-role rain-season palettes — sky, rain slate, water teal, wet green, wet earth and a paper tone — and then solves the problem monsoon campaigns actually hit: type over a photograph. For an assumed mean photo tone it steps a scrim's opacity one percent at a time and reports the lowest value at which the headline reaches 3:1, 4.5:1 and 7:1 under the WCAG 2.x contrast formula, compositing with the standard source-over rule. It is meant for designers producing seasonal sale creatives, travel campaigns, editorial covers and app banners where the artwork is a rain photo and the text still has to be readable.",
  useCases: [
    "Work out that white headline text over a bright overcast sky photo needs roughly a 41% black scrim before it clears 4.5:1.",
    "Pick a mood — first rain, overcast, deep monsoon, petrichor or storm night — and get a coherent six-colour set for a seasonal campaign.",
    "Check which label colour, paper or white or black, reads best on the water teal before setting a caption.",
    "Copy CSS variables plus a ready-made scrim rule for the banner component.",
  ],
  benefits: [
    [
      "Answers the scrim question",
      "Instead of nudging an opacity slider by eye, you get the exact percentage that reaches each WCAG threshold.",
    ],
    [
      "Honest about failures",
      "Where a pairing cannot reach the target at any opacity, the tool says so rather than returning a flattering number.",
    ],
    [
      "Reproducible moods",
      "Mood, hue rotation and variation fully determine the palette, so the same brief always produces the same hex codes.",
    ],
  ],
  faqs: [
    [
      "What opacity should a scrim be for text on an image?",
      "It depends entirely on how bright the photo is behind the words. White text over a mid-tone street photo may need only a few percent of black, while the same text over a bright overcast sky typically needs around 40% to reach 4.5:1, and over half that again to reach 7:1. Measure the region the text actually sits on rather than the whole image.",
    ],
    [
      "What colours represent the monsoon?",
      "Cool hues between roughly 150 and 230 degrees: slate blues for cloud, deep teals for standing water, and saturated wet greens for soaked foliage — with one warm earth note, usually a terracotta or ochre, to stop the set going lifeless. Saturation rises and lightness drops as the season deepens, which is why the deep monsoon mood here is darker than first rain.",
    ],
    [
      "Does WCAG apply to text on a background image?",
      "Yes. SC 1.4.3 makes no exception for photographic backgrounds, and the ratio is measured against whatever pixels sit behind the glyphs. Since a photo varies across its area, the safe approach is to test the brightest patch under the text, or to add a scrim, a gradient or a solid plate so the effective background is predictable.",
    ],
    [
      "Is a gradient scrim better than a flat one?",
      "Usually, because it darkens the text area without flattening the whole image. The catch is that the ratio then varies across the headline, so check the lightest end of the gradient, not the average. The percentages here describe a flat scrim; treat them as the minimum your gradient must reach where the text sits.",
    ],
  ],
};

export default seo;
