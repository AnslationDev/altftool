const seo = {
  intro:
    "Fitness Brand Font Pairing combines condensed display faces with readable body fonts for gyms, sports teams and supplement brands, then solves the fitting problem those faces exist for: given a headline and a container width, what is the largest size that still holds one line. The calculation uses each family's average character advance — around 0.42em for Barlow Condensed and Bebas Neue, 0.44em for Oswald, 0.62em for Archivo Black — so a twelve-character headline in Oswald across a 343 px phone hero lands at 64 px.",
  useCases: [
    "Find the biggest size a two-word class name can be on a phone hero without wrapping.",
    "Check the same headline across a phone, a story, a square post and a 3-metre gym banner in one pass.",
    "Decide between a narrow face like Teko and a wide heavy face like Archivo Black for a long brand name.",
    "See where a longer tagline will break onto a second line before it reaches a designer.",
  ],
  benefits: [
    ["Headline fitting, not guessing", "Returns the exact single-line size and how much slack is left in the container."],
    ["Every placement at once", "The same headline is fitted to phone, social and large-format widths in one table."],
    ["Caps handled", "Uppercase display settings get the small amount of tracking they need to stop crowding."],
  ],
  faqs: [
    [
      "Which fonts suit a gym or fitness brand?",
      "Condensed grotesques carry the most impact per pixel: Oswald, Bebas Neue, Barlow Condensed, Teko and Anton. Pair them with a normal-width sans such as Roboto, Inter, Barlow or Open Sans so schedules and pricing stay readable.",
    ],
    [
      "How big can a headline be before it wraps?",
      "Divide the container width by the character count multiplied by the font's average character width. A twelve-character headline in Oswald, whose caps average about 0.44em, fits a 343 px phone hero at roughly 64 px.",
    ],
    [
      "Should a fitness headline be all caps?",
      "For short headlines, yes — caps give condensed faces their poster quality, and Bebas Neue only has capitals. Add about 0.02em of letter-spacing so the narrow forms do not collide, and keep body copy in sentence case.",
    ],
    [
      "Why does Anton have only one weight?",
      "Anton was drawn as a single ultra-bold display cut rather than a family. That means all hierarchy has to come from size and colour, so pair it with a body face that has a full weight range if you need subheads and captions.",
    ],
  ],
};

export default seo;
