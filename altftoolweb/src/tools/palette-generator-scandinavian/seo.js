const seo = {
  intro:
    "The Scandinavian Palette Generator produces a calm Nordic colour scheme — ceiling white, wall white, plaster, birch, cold stone, muted sage and charcoal — with saturation held between 2% and 18% so nothing shouts. Each surface reports its Light Reflectance Value, the 0-100 measure paint suppliers publish, alongside WCAG contrast, and the palette compensates for room aspect: north-facing schemes are warmed to offset cool daylight, south-facing ones can run cooler. A 60-30-10 split shows how much of each colour to actually use.",
  useCases: [
    "Choose wall and trim whites for a north-facing room that currently reads grey and flat.",
    "Set a minimal brand palette where the only strong colour is a single charcoal accent.",
    "Check that a wall colour clears the LRV 60 mark before ordering ten litres of it.",
    "Split a room scheme into 60% wall, 30% secondary surface and 10% accent before buying anything.",
  ],
  benefits: [
    [
      "LRV alongside hex",
      "Every colour carries the light reflectance number that decides how bright a room feels, not just a swatch.",
    ],
    [
      "Aspect-aware",
      "North, south and east-west settings shift warmth the way an interior designer would compensate for daylight.",
    ],
    [
      "Restraint enforced",
      "Saturation is capped at 18% and the mean is reported, so the palette cannot drift out of the Nordic register.",
    ],
  ],
  faqs: [
    [
      "What is LRV and what number should a wall be?",
      "Light Reflectance Value measures how much visible light a colour reflects, from 0 (absorbs everything) to 100 (reflects everything). Walls in rooms with limited daylight are generally kept at LRV 60 or above and ceilings at 80 or above, so the surfaces keep bouncing light rather than absorbing it.",
    ],
    [
      "Why does white paint look grey in my north-facing room?",
      "North light is cool and constant, and a white with a blue or green undertone amplifies it. The usual fix is to pick a white with a warm undertone — a touch of yellow or red pigment — which is what the north-facing setting does automatically here.",
    ],
    [
      "What colours make a Scandinavian palette?",
      "Tinted whites rather than pure white, a pale wood tone such as birch or white oak, one cool mid-grey, at most one muted colour (usually a green or dusty blue), and a near-black used sparingly on joinery and hardware. Saturation stays low throughout — typically under about 20%.",
    ],
    [
      "Will the hex value match the paint I buy?",
      "Not exactly. A screen emits light while paint reflects it, and LRV here is the sRGB approximation rather than a measurement of a physical sample under standard light. Use the hex and LRV to shortlist colours, then test a sample pot on the actual wall in both daylight and lamplight.",
    ],
  ],
};

export default seo;
