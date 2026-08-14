const seo = {
  title: "Curtain Colour Matcher by LRV Gap and Fade Risk",
  metaDescription:
    "Enter wall and upholstery hex codes for eight curtain colours ranked by LRV gap: under 10 points the window recedes, over 30 it becomes the feature.",
  steps: [
    "Enter the wall colour hex and the upholstery colour hex, or set them with the two colour pickers.",
    "Say what the curtains should do, disappear, frame the window quietly or be a feature, and set the sun on this window.",
    "Read the eight suggested swatches with their LRV gap and fade risk in strong sun, then press Copy result.",
  ],
  intro:
    "This matcher takes the hex value of your wall paint and your main upholstery and returns eight curtain colours, each scored by its Light Reflectance Value gap from the wall — the number that decides whether the window disappears, sits quietly, or becomes the focal point of the room. LRV is the CIE Y value as a percentage, the same figure printed on a paint chip and calculated here with the WCAG relative luminance formula. It also measures the hue distance between the wall and the sofa on the colour wheel, because two colours already sitting 45 to 100 degrees apart leave a curtain far less room to manoeuvre than a tonal pairing does.",
  useCases: [
    "Deciding whether curtains behind a navy sofa should repeat the sofa colour or stay close to the off-white wall",
    "Choosing a curtain that makes a narrow room read wider by keeping the window within 10 LRV points of the wall",
    "Checking fade risk before ordering a deep, saturated fabric for a south-facing living room window",
  ],
  benefits: [
    ["LRV gap, not guesswork", "Each option shows how far it sits from the wall in LRV, so you know in advance whether the window recedes or dominates."],
    ["Wall and sofa both considered", "Hue distance between the two is measured first, and the suggestions change depending on how much room that leaves."],
    ["Fade and sun exposure flagged", "Dark saturated fabric at a south or west window is called out before you order twelve metres of it."],
  ],
  faqs: [
    [
      "Should curtains match the wall or the sofa?",
      "Match the wall when you want the room to feel larger, and match the sofa when you want the two big fabric areas to read as a set. Keeping the curtain within about 10 LRV points of the wall makes the window disappear into the wall plane, while pulling the sofa hue to the window ties the scheme together but makes the window a visible element.",
    ],
    [
      "Should curtains be lighter or darker than the walls?",
      "Either works — what matters is the size of the gap, not the direction. Under roughly 10 LRV points the curtain merges with the wall, 10 to 30 points frames the window quietly, and more than 30 points makes it the focal point of the room; on a wall that is already dark, going lighter is the only option that registers.",
    ],
    [
      "Do dark curtains fade in the sun?",
      "Yes, and noticeably faster in appearance than pale ones. UV breaks down dye regardless of colour, but the same absolute pigment loss is a much larger proportional change in a dark, heavily saturated fabric, so the leading edge of a deep curtain at a south or west window can show visible lightening within a few summers. A lining, or a solution-dyed or UV-stabilised fabric, slows it considerably.",
    ],
    [
      "What curtain colour makes a room look bigger?",
      "One within about 10 LRV points of the wall, in the same hue family, hung floor to ceiling and wide enough that the stack sits on the wall rather than the glass. Continuous tone across the wall and window removes the visual break that makes a room read as a series of small panels.",
    ],
  ],
};

export default seo;
