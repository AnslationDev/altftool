const seo = {
  intro:
    "This calculator splits a room's wall area into an upper and a lower band at whatever dado height you choose, then works out the litres of each colour separately. It handles the part most estimates get wrong: a door or window is deducted from the band it physically occupies, and an opening that crosses the dado line is divided between the two using the overlap of the opening's vertical span with each band. It suits anyone painting a dado, wainscot line or accent skirt band in a room.",
  useCases: [
    "A homeowner painting a darker lower band to 4 ft and a light shade above it in a 12 by 10 ft bedroom",
    "A contractor ordering two shades separately when a window sill sits below the dado line and straddles it",
    "A planner checking how many running feet of masking tape the dado line will need",
  ],
  benefits: [
    ["Openings split correctly", "A window crossing the dado line is deducted proportionally from both bands."],
    ["Two colours, two orders", "Each band gets its own coats, spreading rate, price and pack suggestion."],
    ["Cheapest tins", "Suggests the least-cost mix of 1 L, 4 L, 10 L and 20 L packs for each colour."],
  ],
  faqs: [
    [
      "What is the standard dado height for a two-tone wall?",
      "Most dado or wainscot lines are set between 3 and 4 feet from the floor, with 3 ft 6 in a common compromise that lands near chair-rail height. Designers often place it at about one-third of the wall height, so a 10 ft wall takes a line at roughly 3.3 ft.",
    ],
    [
      "How do I calculate paint for two colours on one wall?",
      "Work out the perimeter, multiply by the dado height for the lower band and by the remaining height for the upper band, deduct each opening from the band it sits in, then divide each band's net area by the spreading rate and multiply by the number of coats. Keeping the two bands separate matters because you buy two different tins.",
    ],
    [
      "How do you deduct a window that crosses the dado line?",
      "Split it at the line. A window with its sill at 3 ft and a height of 4 ft spans 3 ft to 7 ft; with the dado at 4 ft, one foot of its height comes off the lower band and three feet off the upper. Deducting the whole window from one band overstates that band's saving and understates the other.",
    ],
    [
      "Should the darker colour go on the top or the bottom?",
      "Convention puts the darker shade on the lower band, because it hides scuffs at hand and furniture height and makes the ceiling feel higher. It is a design choice rather than a rule — the quantities work out the same either way, though a dark shade over a pale wall usually needs an extra coat.",
    ],
  ],
};

export default seo;
