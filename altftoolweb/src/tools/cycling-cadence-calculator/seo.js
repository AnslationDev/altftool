const seo = {
  title: "Cycling Cadence Calculator: Speed, Gear Inches, Gain",
  metaDescription:
    "Enter chainring, cog, wheel circumference and cadence for speed in km/h, gear ratio, development per crank turn, gear inches and crank-aware gain ratio.",
  steps: [
    "Enter Chainring (teeth), Rear cog (teeth) and Cadence (rpm), then pick a Wheel and tyre or type your measured Wheel circumference (mm).",
    "Set Crank length (mm), which the gain ratio depends on, and a Target speed (km/h, optional) to see the cadence that gear would need.",
    "Read the speed in km/h with gear ratio, development per crank turn, gear inches and gain ratio, plus the 60 to 120 rpm sweep.",
  ],
  intro:
    "Cadence, gearing and speed are locked together by one relationship: one turn of the cranks moves the bike forward by (chainring ÷ cog) × wheel circumference, so speed in km/h is simply that development in metres times cadence times 60, divided by 1000. This calculator applies it and also reports gear inches (ratio × wheel diameter in inches) and Sheldon Brown's gain ratio (wheel radius ÷ crank length × ratio), which is the only common measure that accounts for crank length. Wheel circumferences come from the standard rollout tables used by cycle computers, and you can enter your own measured figure.",
  useCases: [
    "Checking what speed a 50/17 gear gives at 90 rpm before choosing a cassette for a flat time trial",
    "Working out whether a 34/34 bail-out gear is low enough to climb at a sustainable cadence",
    "Comparing gearing between a 700c road bike and a 27.5 inch gravel bike on equal terms using gain ratio",
  ],
  benefits: [
    ["Exact, not approximate", "Uses measured wheel rollout rather than a nominal wheel size."],
    ["Three gearing measures", "Ratio, gear inches and gain ratio, so you can compare bikes any way you like."],
    ["Cadence sweep", "See the speed for the same gear from 60 to 120 rpm at a glance."],
  ],
  faqs: [
    [
      "How fast is 90 rpm in a 50/17 gear?",
      "About 33.4 km/h on a 700x25c wheel. The gear ratio is 2.94, each crank turn covers 6.19 m of development, and 90 turns a minute works out to 557 m per minute.",
    ],
    [
      "What is a good cycling cadence?",
      "Most trained road cyclists self-select 80 to 100 rpm on flat ground, and drop to 60-75 rpm on steep climbs where gearing runs out. Below about 60 rpm the same power requires much higher pedal force, which loads the knees; above 110 rpm efficiency starts falling for most riders.",
    ],
    [
      "What is the difference between gear inches and gain ratio?",
      "Gear inches multiplies the gear ratio by wheel diameter in inches and ignores crank length entirely. Gain ratio divides wheel radius by crank length first, so it reflects the actual mechanical advantage — two bikes at 78 gear inches with 165 mm and 175 mm cranks are genuinely different gears, and only gain ratio shows it.",
    ],
    [
      "How do I measure my wheel circumference?",
      "Sit on the bike at your normal tyre pressure, mark the tyre and the floor at the same point, roll forward exactly one wheel revolution, and measure between the marks. That rollout is a few millimetres shorter than the unloaded figure and is what your cycle computer needs for accurate speed and distance.",
    ],
  ],
};

export default seo;
