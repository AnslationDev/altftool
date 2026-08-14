const seo = {
  title: "Solar Panel Area Calculator: Roof Space for Your kW",
  metaDescription:
    "Turns a target kW into panel count and roof area, deriving efficiency from the panel's spec sheet and adding row-spacing factors — with a roof fit check.",
  steps: [
    "Enter 'Target capacity (kW)', the 'Panel rating (Wp)' with its 'Panel length (mm)' and 'Panel width (mm)', and pick a 'Mounting' option.",
    "Set 'Peak sun hours per day' and 'Performance ratio', and optionally enter 'Roof area you actually have (0 to skip)' in sq ft or sq m.",
    "Read the 'Roof area required' headline with panel count, module efficiency from the spec, the spacing allowance and expected generation, plus the 'Does it fit your roof?' verdict; 'Copy result' copies the sizing.",
  ],
  intro:
    "A solar panel area calculator turns a target kilowatt capacity into the number of panels and the square feet of roof they will occupy. It derives module efficiency straight from the panel's own spec sheet using the Standard Test Conditions definition — rated watts divided by module area times 1000 W/m² — then multiplies the glass area by a mounting factor for row spacing, walkways and edge setbacks. Daily and annual output come from peak sun hours and a system performance ratio.",
  useCases: [
    "Checking whether a 5 kW rooftop quote will physically fit the terrace before paying an advance",
    "Comparing two panel models where the higher-wattage one is also physically larger",
    "Deciding between flush mounting on a sloped roof and tilted rows on a flat terrace, which needs roughly twice the area",
    "Working backwards from the roof you have to the largest system it can carry",
  ],
  benefits: [
    ["Efficiency checked against the spec sheet", "Flags a panel whose claimed watts and dimensions imply an impossible efficiency."],
    ["Row spacing built in", "Tilted flat-roof rows use about 2.2× the glass area; flush pitched mounting only about 1.15×."],
    ["Fit check both ways", "Tells you if the array fits and, if not, the largest system your roof will actually hold."],
  ],
  faqs: [
    [
      "How much roof area do I need for a 5 kW solar system?",
      "About 28–32 m² (300–345 sq ft) if the panels lie flush on a pitched roof, and roughly double that for tilted rows on a flat terrace. Ten 550 Wp panels of 2278 × 1134 mm give 25.8 m² of glass, which becomes about 29.7 m² once edge setbacks and a service gap are allowed.",
    ],
    [
      "How many solar panels make 1 kW?",
      "Two 550 Wp panels give 1.1 kW, so 1 kW takes two modern panels — but panel counts must round up, since you cannot install a fraction of a panel. Older 330 Wp panels needed three, which is why the same kilowatt rating took more roof a few years ago.",
    ],
    [
      "What is a good solar panel efficiency?",
      "Mass-market monocrystalline modules sit at 20–23% in 2026, with the best commercial panels near 24.5%. A single-junction silicon cell cannot exceed the Shockley-Queisser limit of about 33%, so any panel advertised above that is either a data-entry error or a multi-junction laboratory cell.",
    ],
    [
      "How many units will my rooftop solar system generate?",
      "Multiply installed kW by your site's peak sun hours per day and by the performance ratio: a 5.5 kW array at 5 peak sun hours and a 0.78 performance ratio makes about 21 kWh a day, or roughly 1,400 kWh per kWp per year. Actual output varies with shading, soiling, panel temperature and grid availability, so treat the figure as a planning estimate and ask your installer for a site-specific shade study.",
    ],
  ],
};

export default seo;
