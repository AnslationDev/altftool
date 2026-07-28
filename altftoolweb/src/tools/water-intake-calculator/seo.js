const seo = {
  title: "Water Intake Calculator — Daily Litres by Weight",
  h1: "Water Intake Calculator — Daily Litres, ml and Glasses",
  metaDescription:
    "Water intake calculator: 35 ml per kg body weight + 12 ml per exercise minute + climate top-up. Shows litres, ml and 250 ml glasses. Free, no signup.",
  intro:
    "The Water Intake Calculator turns three inputs — body weight in kilograms, daily exercise minutes and climate — into a daily fluid figure using a fixed arithmetic rule: 35 ml per kilogram of body weight, plus 12 ml for every minute of exercise, plus a flat climate top-up of 500 ml for hot or humid conditions or 300 ml for dry air. The result is shown three ways at once — litres to one decimal, the exact millilitre total, and the equivalent count of 250 ml glasses (millilitres divided by 250, rounded to the nearest whole glass). The whole calculation is a React useMemo that re-runs on every keystroke inside your own browser tab, so there is no submit button, no account and no request sent to a server. It is a planning estimate built from a rule of thumb, not a personalised medical figure.",
  useCases: [
    "Set a gym-day target: the default 70 kg with 45 minutes of training in a normal climate returns 2,990 ml — 3.0 L, or about 12 glasses.",
    "Compare a rest day with a training day by changing only the exercise minutes, since every extra 30 minutes adds exactly 360 ml to the total.",
    "See what a heatwave does to the number — switching climate from Normal to Hot / humid adds a flat 500 ml, and Dry adds 300 ml.",
  ],
  benefits: [
    [
      "Every number is traceable",
      "The target is weight × 35 ml + exercise minutes × 12 ml + a climate top-up. There is no hidden model or opaque scoring, so you can check the arithmetic yourself.",
    ],
    [
      "Three units on one screen",
      "Litres to one decimal, the exact millilitre figure and the number of 250 ml glasses appear together, with a bar strip that draws one block per glass up to twelve.",
    ],
    [
      "Recalculates as you type",
      "The maths lives in a useMemo hook in the page itself, so changing weight, minutes or climate updates the result immediately — no submit step, no page reload, no network call.",
    ],
    [
      "Nothing leaves your device",
      "Weight and activity are held in React state for the length of the session only. Nothing is uploaded, written to browser storage, or attached to an account.",
    ],
  ],
  faqs: [
    [
      "How much water should I drink a day for my weight?",
      "This calculator uses 35 ml per kilogram of body weight as the base figure: 2,100 ml at 60 kg, 2,450 ml at 70 kg and 3,150 ml at 90 kg, before anything is added for exercise or climate. It is a rule-of-thumb planning estimate — real needs vary with diet, health and medication, so treat guidance from a doctor or dietitian as the authority.",
    ],
    [
      "What formula does this water intake calculator use?",
      "Daily total in ml = (weight in kg × 35) + (exercise minutes × 12) + climate top-up, where the top-up is 500 ml for hot or humid, 300 ml for dry and 0 for normal. The default case of 70 kg, 45 minutes and normal climate works out as 2,450 + 540 + 0 = 2,990 ml, displayed as 3.0 L.",
    ],
    [
      "How much extra water does exercise add?",
      "12 ml per minute of exercise in this tool — so 30 minutes adds 360 ml, an hour adds 720 ml and 90 minutes adds 1,080 ml. That amount is added on top of the weight-based base rather than blended into it, so you can see the training contribution by setting the minutes field to 0 and comparing.",
    ],
    [
      "How many glasses of water is 3 litres?",
      "Twelve, using the 250 ml glass this tool assumes (3,000 ÷ 250 = 12). The calculator divides your millilitre total by 250 and rounds to the nearest whole glass, and the blue strip under the result draws one block per glass up to a maximum of 12 blocks — larger targets still show the full ml and litre figures.",
    ],
    [
      "Does hot weather change the amount?",
      "In this calculator, yes — choosing Hot / humid adds a flat 500 ml and Dry adds 300 ml, while Normal adds nothing. These are fixed amounts rather than percentages, so the same top-up represents a larger relative increase for a lighter person than a heavier one.",
    ],
    [
      "Is this water intake calculator free, and do I need an account?",
      "Yes, it is free, and there is no signup. The calculation is plain JavaScript running in your own browser tab; the weight, minutes and climate values stay in page memory for the session and are never sent to a server or saved to local storage.",
    ],
    [
      "Is 35 ml per kg accurate for everyone?",
      "No — it is a general baseline, not a personalised figure. It takes no account of pregnancy, breastfeeding, kidney or heart conditions, medication, altitude, or the water you already get from food. Use the output as a rough planning number and check anything medical with a qualified clinician.",
    ],
    [
      "Should tea, coffee and food count towards the total?",
      "The calculator does not separate them — it returns a single daily fluid figure and makes no assumption about which drinks or foods supply it. Nothing in the code subtracts water obtained from food, so if you want a plain-drinks-only target you would need to adjust the number yourself.",
    ],
  ],
  steps: [
    "Enter your body weight in kilograms in the first field — the calculator opens at 70 kg.",
    "Add your typical daily exercise in minutes (default 45), then choose Normal, Dry or Hot / humid from the climate menu.",
    "Read the target straight away: litres to one decimal, the exact millilitre figure and the number of 250 ml glasses, all updating as you type.",
  ],
};

export default seo;
