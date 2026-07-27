const seo = {
  intro:
    "This calculator sizes an air conditioner for a living room by adding up each heat gain separately instead of using a flat per-square-foot rule: wall and roof conduction as U x A x deltaT with a sol-air uplift of 15 K for a sunlit roof, solar gain through glass as area x solar heat gain factor x shading coefficient, 130 W per seated adult from ASHRAE, installed lighting and equipment watts, and infiltration at 0.335 W per cubic metre per kelvin. A 10% design margin is added and the total is converted at 3,516.85 W per ton of refrigeration. It is built for open halls where a double-height ceiling or a wall of west-facing glass makes the rule of thumb badly wrong.",
  useCases: [
    "Sizing a 16 x 14 ft top-floor hall with a 12 ft ceiling and a 40 sq ft west window in Delhi",
    "Checking whether adding solar-control film to a glass facade would drop the requirement from 2.5 ton to 2 ton",
    "Working out why an existing 1.5 ton unit never cools a living room where eight people gather in the evening",
  ],
  benefits: [
    ["Component breakdown", "Shows the watts contributed by walls, roof, glass, people, lights and air changes, and names the biggest one."],
    ["Handles high ceilings", "Air volume drives the infiltration load, so a 14 ft ceiling is treated differently from an 8 ft one."],
    ["Glass modelled properly", "West glass is charged at about 480 W/m2 of solar gain versus 110 W/m2 for north glass, before shading."],
  ],
  faqs: [
    [
      "How many tons of AC do I need for a living room?",
      "For a typical 200-250 sq ft Indian living room on a middle floor, 1.5 ton is usually enough; the same room on the top floor with an exposed RCC roof and a large west window commonly needs 2 ton. The deciding factors are roof exposure and glass area, not floor area alone.",
    ],
    [
      "Why does my living room AC struggle in the evening?",
      "Because west-facing glass and a sun-baked roof release stored heat exactly when the room is in use. Peak solar gain through unshaded west glass is around 480 W per square metre, and an uninsulated RCC slab behaves as if outdoor air were roughly 15 C hotter than it actually is, so the load peaks hours after the hottest part of the day.",
    ],
    [
      "Does a high ceiling need a bigger AC?",
      "Yes, though less than the volume increase suggests. Extra height adds exposed wall area and more air to change over — the infiltration term scales directly with room volume at 0.335 W per cubic metre per kelvin — but the roof and floor gains do not change, so going from 10 ft to 14 ft typically adds 10-20%, not 40%.",
    ],
    [
      "Do curtains actually reduce the AC load?",
      "Yes, measurably. Heavy curtains or venetian blinds cut solar gain through glass to roughly 55% of the unshaded value, and solar-control film or a tinted DGU to about 40%. On a room with 40 sq ft of west glass that is several hundred watts, enough to change the recommended size in a borderline case.",
    ],
  ],
};

export default seo;
