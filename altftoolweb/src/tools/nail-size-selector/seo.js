const seo = {
  intro:
    "Chooses a nail by the rule that actually governs it: penetration into the member underneath. The National Design Specification for Wood Construction requires at least 6 shank diameters into the main member for any lateral design value and 10 for the full value, so this walks the standard penny table and returns the first size that clears 10 diameters, then checks the point will not come out the far side. Framing, sheathing and trim each get their own path, with the prescriptive IRC fastening schedule shown alongside.",
  useCases: [
    "Sizing nails to fix 19 mm boarding to a stud without splitting it or under-driving it",
    "Working out how many nails a sheathing job needs at 150 mm edges and 300 mm field spacing",
    "Choosing between an 18-gauge brad and a 16-gauge finish nail for skirting board",
  ],
  benefits: [
    ["Sized on penetration", "Uses the code rule rather than the 'three times the board' shortcut, which over-specifies badly on framing lumber."],
    ["Warns about blow-through", "Flags when the point would come out the back of a thin receiving member."],
    ["Counts the box", "Nails per row and total for the run, so you buy once."],
  ],
  faqs: [
    [
      "How long is a 16d nail?",
      "3.5 inches, which is 89 mm, on an 8-gauge shank measuring 0.162 inches. Between 2d and 10d the length in inches works out as (d + 2) ÷ 4, so a 6d is 2 inches and an 8d is 2.5, but above 10d the series stops following that formula and the tabulated lengths take over.",
    ],
    [
      "How deep does a nail need to go into the second piece of wood?",
      "At least 10 shank diameters for the full lateral design value, and never less than 6. For a 16d common at 0.162 inches that means about 41 mm of penetration into the main member. This is why a nail is chosen by what it reaches into, not by the thickness of the piece you are holding.",
    ],
    [
      "What nails should I use for sheathing?",
      "6d common for panels up to 13 mm thick and 8d common for 15 to 25 mm, spaced 150 mm along supported edges and 300 mm in the field. Those are the prescriptive figures in IRC Table R602.3(1); shear walls and braced panels have their own tighter schedules that an engineer specifies.",
    ],
    [
      "What is the difference between 16 gauge and 18 gauge finish nails?",
      "Diameter and holding power. An 18-gauge brad is 0.0475 inches and leaves a hole you barely need to fill, which suits shoe moulding and light beading. A 16-gauge finish nail is 0.0625 inches, holds noticeably more, and is the right choice for skirting, architrave and casing where the trim has weight of its own.",
    ],
  ],
};

export default seo;
