const seo = {
  title: "Fintech Palette Generator: Light, Dark, WCAG Audit",
  metaDescription:
    "One brand hue becomes a 50-900 ramp, Material 3 dark elevation surfaces, credit and debit money colours, and a WCAG contrast audit of both themes.",
  steps: [
    "Pick a Brand hue — Trust blue, Deep indigo, Bank teal, Ledger green or Royal violet — and nudge it with 'Hue rotation (degrees)' if you need an exact brand angle.",
    "Set 'Dark ground lightness (4-16%)' and press Next variation to cycle Variation 0 to 4; both themes regenerate on every change.",
    "Read 'Contrast checks passing across both themes' as a passing/total count, then the Brand ramp, the Dark elevation surfaces table of Material 3 tint opacities, the Money semantics table for Credit / money in, Debit / money out, Pending, Failed / declined and Saved / rewards, and the per-theme contrast audits; Copy CSS exports the CSS variables.",
  ],
  intro:
    "The Fintech India Palette Generator takes one brand hue and returns a matched pair of themes: a 50-900 tonal ramp, light and dark surfaces, five money-semantic colours for credit, debit, pending, failed and rewards, and a WCAG 2.x contrast audit of every text and control pairing in both themes. Dark surfaces are built the way Material Design 3 specifies — a translucent brand tint composited over the darkest surface at the published elevation opacities of 5%, 8%, 11%, 12% and 14%. It is aimed at product and design teams building UPI apps, lending flows, neobank dashboards and investment products where balances have to stay legible in bright daylight and at night.",
  useCases: [
    "Produce a matching dark theme for an existing brand blue without hand-picking six new surface greys.",
    "Check that the credit green and the debit red both clear 4.5:1 on card in the light theme and again in the dark theme.",
    "Get elevation-correct surfaces for a bottom sheet, nav bar and dialog instead of guessing at opacity values.",
    "Hand engineering one CSS block with a prefers-color-scheme dark override already wired up.",
  ],
  benefits: [
    [
      "Both themes audited",
      "Twelve contrast checks run across light and dark, so a palette cannot pass in one mode and quietly fail in the other.",
    ],
    [
      "Real elevation maths",
      "Dark surfaces are composited with the published Material 3 tint opacities, not invented greys.",
    ],
    [
      "Money colours that survive",
      "Credit, debit, pending, failed and rewards are each repaired to 4.5:1 on their own surface, and the credit-to-debit luminance gap is reported.",
    ],
  ],
  faqs: [
    [
      "What colours build trust in a fintech app?",
      "Blue, indigo and teal dominate financial interfaces because they read as institutional and low-arousal, and users have decades of banking exposure to them. What matters more than the hue is discipline: one brand colour with a full tonal ramp, a strictly separate set of money-semantic colours, and no decorative accent that shares a hue with credit or debit.",
    ],
    [
      "How do I build a dark theme from a light one?",
      "Do not invert. Start from a dark ground of roughly 8% to 12% lightness — pure black causes halation around white text and makes elevation impossible to show — then build each raised surface by compositing a translucent brand tint over that ground. Material 3 publishes the opacities: 5% at level 1, 8% at level 2, 11% at level 3, 12% at level 4 and 14% at level 5.",
    ],
    [
      "Should credit be green and debit be red?",
      "It is the convention most Indian banking and UPI apps follow, and going against it confuses users. Just do not rely on it alone: roughly 8% of men have a red-green colour vision deficiency, so always pair the colour with a plus or minus sign, and keep a visible luminance difference between the two so the amounts still separate in greyscale.",
    ],
    [
      "What contrast ratio does a banking app need?",
      "WCAG 2.x asks for 4.5:1 on body text, 3:1 on large text (24px regular or 18.66px bold) and 3:1 on interface components such as input borders and focus rings. Balances and transaction amounts are the last thing you want to be borderline, so treat 4.5:1 as a floor rather than a target. This tool reports ratios; it is a design aid, not a compliance certification or financial advice.",
    ],
  ],
};

export default seo;
