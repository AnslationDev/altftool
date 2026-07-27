const seo = {
  intro:
    "Luxury Vibe Font Pairing combines high-contrast display serifs with restrained sans body faces and calculates the two numbers that decide whether the result looks expensive or cheap: optical tracking and hairline thickness. Tracking pivots at 16 px — type set larger is tightened, type set smaller is opened up, with an extra 0.08em when the setting is all caps. The hairline check treats the stem as 8% of the em, divides by the face's stroke contrast, and warns when the thin stroke falls below half a device pixel and greys out.",
  useCases: [
    "Set a fashion or hotel wordmark in Bodoni Moda and find the smallest size at which its hairlines still render solidly.",
    "Get the exact negative letter-spacing for a 72 px hero headline instead of nudging it by eye.",
    "Choose between a Didone and a transitional serif for a jewellery site that has to work on a 1x office monitor.",
    "Hand a developer the CSS custom properties, weights and Google Fonts request for a premium brand refresh.",
  ],
  benefits: [
    ["Tracking with a rule", "Letter-spacing is derived from size rather than guessed, so headings and subheads stay consistent."],
    ["Hairline warning", "Tells you when a high-contrast serif will wash out at your chosen size and screen density."],
    ["Caps handled properly", "All-caps settings automatically receive the extra letter-space they need to stay readable."],
  ],
  faqs: [
    [
      "What letter-spacing should a large headline use?",
      "Negative, and more so as the size grows. A practical rule is to remove about 0.0005em for every pixel above 16 px, so a 64 px headline sits near -0.024em and a 96 px one near -0.03em, which is a sensible floor.",
    ],
    [
      "Why does my Bodoni or Didot headline look washed out?",
      "Its hairlines are falling below one device pixel. With a stem at roughly 8% of the em and an 8:1 contrast ratio, 16 px text has a 0.16 px hairline — only 0.32 device pixels on a 2x screen, which the renderer draws as pale grey. Increase the size to about 25 px or choose a lower-contrast serif.",
    ],
    [
      "Which fonts read as luxury without a licence fee?",
      "Playfair Display, Cormorant Garamond, Bodoni Moda, Marcellus, Libre Baskerville and Italiana are all open licence and cover the range from editorial to fashion. Pair them with Lato, Montserrat, Jost, Karla or Source Sans 3 for body copy.",
    ],
    [
      "Should luxury body text be set in a serif too?",
      "Usually not. Display serifs designed for large sizes lose legibility in paragraphs, and a quiet sans gives the headline room to be the only voice. If you want a serif body, choose one drawn for text — Libre Baskerville rather than Italiana.",
    ],
  ],
};

export default seo;
