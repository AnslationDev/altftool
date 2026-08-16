const seo = {
  title: "Nib Angle Practice Grid: Calligraphy Sheets",
  metaDescription:
    "Rule a guide sheet in nib widths with pen-angle hatch marks — Foundational 30°/4 n.w., Italic 45°/5 — and see the stem width your stroke should measure.",
  steps: [
    "Choose a Calligraphic hand — each option lists its pen angle and x-height in nib widths — then set Nib width (mm) or tap a preset such as Pilot Parallel 3.8.",
    "Set Page size, Margin (mm) and Gap between line sets (nib widths), add a Pen angle override (°, optional) if your exemplar differs, and keep or clear Show slant guides where the hand has a forward slope.",
    "Check the x-height on the sheet in mm, the line sets per page and the Predicted stem width (vertical pull), then press Print with fit-to-page turned off so the sheet comes out at 100% scale.",
  ],
  intro:
    "The Nib Angle Practice Grid generates printable broad-edge calligraphy guide sheets ruled in nib widths, which is how calligraphic hands are actually measured, and prints hatch marks at the correct pen angle along every baseline. Choose a hand — Foundational at 30° with a four-nib-width x-height, Italic at 45° with five, Blackletter at 40°, Uncial at 20° — plus your nib width and page size, and it works out the x-height, ascender and descender bands, the row pitch and how many line sets fit on the sheet. It also predicts the stroke widths a nib should produce, since a vertical pull at angle A gives a stem of nib width × cos A and a horizontal pull gives a bar of nib width × sin A.",
  useCases: [
    "Ruling a fresh sheet for a 3.8 mm Pilot Parallel before a Foundational practice session, without measuring nib widths by hand every time.",
    "Checking whether your pen angle is drifting by comparing your downstrokes against the 30° hatch marks printed on the line.",
    "Switching a practice sheet from Foundational to Italic and seeing the x-height change from four to five nib widths automatically.",
    "Working out how many lines of a given hand will fit on A5 before committing to a layout for a finished piece.",
  ],
  benefits: [
    ["Ruled in nib widths", "The x-height follows the hand, not an arbitrary millimetre value, so proportions stay correct at any nib size."],
    ["Angle marks on every line", "Hatch marks at the pen angle give a reference to align the nib against instead of eyeballing it."],
    ["Predicted stroke widths", "Measure a stem against the calculated nib width × cos A figure to confirm your angle is really where you think."],
  ],
  faqs: [
    [
      "What pen angle should I use for each calligraphy hand?",
      "Foundational and Carolingian are written at about 30°, Italic at 40–45°, Blackletter (Textura) at 40–45°, and Uncial at a shallow 20–25°. The angle is measured between the nib edge and the horizontal writing line.",
    ],
    [
      "How many nib widths tall is the x-height?",
      "It depends on the hand: Foundational is 4 nib widths, Italic and Blackletter are 5, Uncial about 4, and Roman capitals stand about 7 nib widths from baseline to cap line. Ascenders and descenders typically add another 2–3 nib widths each.",
    ],
    [
      "Why does my stem look thinner than the nib?",
      "Because a vertical downstroke made at a pen angle only exposes part of the nib edge. The stem measures nib width × cos(angle), so a 3.8 mm nib at 30° draws a 3.29 mm stem, and at 45° a 2.69 mm stem. If your stem is thicker than predicted, your pen angle is shallower than you think.",
    ],
    [
      "Do I need to print at 100% scale?",
      "Yes. Turn off “fit to page” or “shrink to fit” in the print dialog, or every measurement on the sheet shrinks and the nib-width ladder will no longer match your pen. Check by measuring the x-height on the printed sheet against the figure shown on screen.",
    ],
  ],
};

export default seo;
