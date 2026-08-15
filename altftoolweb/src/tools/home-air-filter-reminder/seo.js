const seo = {
  title: "Home Air Filter Reminder: Next Change Date and Cost",
  metaDescription:
    "Both filter limits applied — rated hours and calendar months — shortened for your AQI band and pets, with the next change dated and the yearly cost.",
  steps: [
    "Pick the 'Appliance' — Room air purifier or Split or window air conditioner — and set 'Hours run per day', 'Typical outdoor air quality' (the CPCB bands from Good to Severe) and 'Power draw (watts)'.",
    "Tick anything under 'Indoor sources that clog filters faster' — pets, smoking or incense, construction, open-kitchen frying — and give each filter a date under 'When was each filter last changed or washed?'.",
    "Read the yearly cost with the 'Filter schedule' table giving the interval in days, the next-due date and cost per filter, plus the AHAM two-thirds CADR check on a purifier; 'Copy plan' saves the summary.",
  ],
  intro:
    "This tracker converts a filter's dual rating — so many running hours or so many months, whichever comes first — into a real replacement date for your usage, and totals what the appliance costs to run for a year. Filter life is shortened by a loading factor built from the CPCB National AQI band outside plus indoor sources like pets, indoor smoking and nearby construction. For purifiers it also checks size against AHAM's two-thirds rule, where CADR in CFM should be at least two-thirds of the room's floor area for an 8 ft ceiling.",
  useCases: [
    "Finding out that a HEPA filter rated for 8,760 hours is really due in eight months because the AQI outside sits in the poor band",
    "Comparing what a purifier costs a year in filters versus electricity before buying a second unit",
    "Checking whether a 200 CFM purifier is genuinely enough for a 150 sq ft bedroom with a 10 ft ceiling",
  ],
  benefits: [
    ["Both limits applied", "The tool shows whether running hours or calendar age is what actually ends the filter's life."],
    ["Dated, not vague", "Enter the last change and get the exact next-due date for every filter in the unit."],
    ["Whole cost of ownership", "Filters and electricity are added together, so the cheap purifier with expensive cartridges stops looking cheap."],
  ],
  faqs: [
    [
      "How often should a HEPA filter be replaced?",
      "Manufacturers typically rate a true HEPA filter at about 8,760 running hours or twelve months, whichever comes first. In cities where the AQI sits in the poor or very poor band, expect that to fall to roughly eight and six months respectively, because loading depends on particle concentration, not just hours.",
    ],
    [
      "How often should AC filters be cleaned?",
      "Wash a split or window AC's mesh filter about every 30 days of use, or roughly every 150 running hours, and more often with pets or a dusty roadside. A clogged mesh restricts airflow, which drops cooling output and raises the compressor's running cost.",
    ],
    [
      "What CADR do I need for my room?",
      "Use AHAM's two-thirds rule: for an 8 ft ceiling, the CADR in CFM should be at least two-thirds of the room's floor area in square feet, which gives about five air changes an hour. A 150 sq ft room needs roughly 100 CFM at 8 ft, or about 125 CFM if the ceiling is 10 ft.",
    ],
    [
      "Can HEPA filters be washed and reused?",
      "No — washing a true HEPA filter ruptures the fibre matrix and destroys its efficiency, even though it looks clean afterwards. Only pre-filters and AC mesh filters are designed to be rinsed; activated carbon filters are also single-use because their pore structure saturates rather than clogs.",
    ],
  ],
};

export default seo;
