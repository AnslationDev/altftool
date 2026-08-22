const seo = {
  title: "Childcare Calorie Calculator: 2.0–4.0 MET",
  metaDescription:
    "Calories burned looking after children from MET x 3.5 x kg / 200 — five intensities from 2.0 to 4.0 MET, with net calories and a weekly total.",
  steps: [
    "Enter 'Body weight (kg)' and 'Minutes per session', which start at 70 and 60, because the MET equation multiplies kilograms by minutes.",
    "Pick the intensity under 'Childcare activity': Light supervision / feeding (2.0 MET), Bathing, dressing, light care (2.5 MET), General childcare, active standing (3.0 MET), Playing with children, moderate effort (3.5 MET) or Carrying child / active play (4.0 MET), then set 'Sessions per week', which starts at 7.",
    "The 'Childcare calorie estimate' panel updates live with the intensity in MET, the burn rate in kcal/min, the session burn as gross kcal with net kcal in brackets, and the weekly estimate. 'Copy output' puts those four lines on the clipboard.",
  ],
  intro:
    "Looking after children burns real energy, and this calculator quantifies it with the standard MET equation: calories per minute = MET x 3.5 x body weight in kg / 200. You pick the kind of care — from light supervision at 2.0 MET up to carrying a child and active play at 4.0 MET — enter your weight, the minutes per session and sessions per week, and get the burn rate, the session total and a weekly figure. It reports both gross calories and net calories, the latter subtracting the 1 MET you would have burned sitting still anyway.",
  useCases: [
    "You are logging activity in a food or fitness app that has no entry for childcare and need a defensible number for two hours of chasing a toddler",
    "You are on a weight-loss plan and want to know whether daily hands-on care already counts as meaningful movement before adding formal exercise",
    "You are back from parental leave and comparing how the day's energy expenditure changed now that most of it is desk-based rather than carrying a baby",
  ],
  benefits: [
    ["Gross and net calories, side by side", "Net subtracts resting expenditure at 1 MET, which is the figure that actually belongs in a calorie deficit calculation."],
    ["Intensity chosen by task, not by guess", "Five options map real activities — feeding, bathing, active standing, play, carrying — onto their MET values so you are not inventing a number."],
    ["Scales straight to a weekly total", "Sessions per week are built into the calculation, so you see the cumulative figure that actually moves a weekly energy balance."],
  ],
  faqs: [
    [
      "How many calories does childcare burn per hour?",
      "For a 70 kg adult at 3.0 MET — general childcare with active standing — the rate works out to about 3.7 kcal per minute, so roughly 220 kcal gross in an hour, or about 147 kcal net once resting metabolism is removed. Heavier bodies and higher-intensity care scale the figure up proportionally.",
    ],
    [
      "What is a MET and why 3.5?",
      "One MET is resting metabolic rate, defined as an oxygen uptake of 3.5 millilitres per kilogram of body weight per minute. The equation converts that oxygen use into calories, which is why 3.5 and the divisor 200 appear in it; a 4.0 MET activity means you are working at four times resting rate.",
    ],
    [
      "Should I use the gross or the net number?",
      "Use net if you are tracking a calorie deficit, because gross includes the energy your body would have spent at rest during those same minutes and counting it twice inflates your deficit. Gross is fine for a general sense of how active the day was.",
    ],
    [
      "How accurate is this for real childcare?",
      "Treat it as an informational estimate with a wide margin. MET values come from population averages and assume steady effort, whereas childcare is bursts of lifting, stairs and interruptions, and fitness, age and body composition all shift the true figure — if calorie intake matters medically, discuss it with a dietitian or doctor.",
    ],
  ],
};

export default seo;
