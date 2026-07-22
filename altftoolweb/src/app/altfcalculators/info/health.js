const info = {
  "calorie-calculator": {
    intro: [
      "The calorie calculator estimates how many calories you burn in a day and turns that into practical daily targets for maintaining, losing or gaining weight. It first finds your Basal Metabolic Rate (BMR) with the Mifflin-St Jeor equation, then scales it by an activity factor to get your Total Daily Energy Expenditure (TDEE).",
      "Eating at your TDEE keeps weight stable; a deliberate calorie deficit drives fat loss and a surplus supports weight or muscle gain. Because roughly 7,700 kcal equals about 1 kg of body fat, a 500 kcal daily deficit targets about 0.5 kg of loss per week.",
    ],
    formula: {
      expression: "BMR = 10·weight + 6.25·height − 5·age + s ; TDEE = BMR × activity",
      where: [
        ["weight", "body weight in kilograms"],
        ["height", "height in centimetres"],
        ["age", "age in years"],
        ["s", "+5 for males, −161 for females"],
        ["activity", "1.2 sedentary to 1.9 very active"],
      ],
      note: "Weight-goal targets shift TDEE by ±250 kcal (mild) or ±500 kcal (about 0.5 kg/week).",
    },
    howToUse: [
      "Select your sex and enter your age, weight (kg) and height (cm).",
      "Choose the activity level that best matches a typical week.",
      "Read your maintenance calories (TDEE) at the top.",
      "Pick a loss or gain row that matches your goal and eat to that target.",
    ],
    goodToKnow: [
      "Mifflin-St Jeor is the most accurate general BMR equation for the modern population.",
      "Activity multipliers already include exercise, so do not add workout calories twice.",
      "A safe rate of change is about 0.25–0.5 kg per week; larger deficits risk muscle loss.",
      "Estimates are a starting point — track weight for 2–3 weeks and adjust intake as needed.",
    ],
    faqs: [
      {
        q: "Should I eat back the calories I burn during exercise?",
        a: "No. The activity multiplier already accounts for your typical training, so eating extra on top usually cancels a planned deficit.",
      },
      {
        q: "Why is my TDEE different from another calculator?",
        a: "Different tools use different BMR equations (Mifflin-St Jeor, Harris-Benedict, Katch-McArdle) and activity factors. Treat any figure as an estimate within a few hundred calories.",
      },
      {
        q: "How big a deficit is safe?",
        a: "A deficit of 250–500 kcal/day is sustainable for most people. Going below about 1,200 kcal (women) or 1,500 kcal (men) without supervision can be too aggressive.",
      },
      {
        q: "Do these numbers guarantee weight loss?",
        a: "They are estimates. Real energy expenditure varies with genetics, sleep, NEAT and measurement error, so monitor your weight trend and fine-tune.",
      },
    ],
  },

  "tdee-calculator": {
    intro: [
      "TDEE — Total Daily Energy Expenditure — is the total number of calories your body burns in 24 hours, including rest, digestion and movement. This calculator finds your BMR with the Mifflin-St Jeor equation and multiplies it by an activity factor to give your maintenance calories.",
      "Knowing your TDEE is the foundation of any nutrition plan: eat below it to lose fat, at it to maintain, or above it to gain. It is the single most useful number for setting a calorie target.",
    ],
    formula: {
      expression: "TDEE = BMR × activity multiplier",
      where: [
        ["BMR", "10·weight(kg) + 6.25·height(cm) − 5·age + s"],
        ["s", "+5 for males, −161 for females"],
        ["activity", "1.2, 1.375, 1.55, 1.725 or 1.9"],
      ],
      note: "TDEE ≈ BMR + energy from digestion (thermic effect of food) + all daily activity.",
    },
    howToUse: [
      "Select sex and enter age, weight (kg) and height (cm).",
      "Choose the activity level that reflects your weekly routine.",
      "Read your BMR and maintenance TDEE.",
      "Set calories below TDEE for fat loss or above it for weight gain.",
    ],
    goodToKnow: [
      "BMR alone is only the energy for basic functions at complete rest.",
      "TDEE typically ranges from 1.2× BMR (desk job) to 1.9× BMR (heavy manual labour or daily hard training).",
      "The largest and most variable part of TDEE is activity, not exercise structured sessions.",
      "Recalculate as your weight changes — a lighter body burns fewer calories.",
    ],
    faqs: [
      {
        q: "What is the difference between BMR and TDEE?",
        a: "BMR is the calories burned at complete rest; TDEE is BMR plus digestion and all daily activity. TDEE is always higher than BMR.",
      },
      {
        q: "Which activity level should I pick?",
        a: "Base it on your whole week, not your best day. Most office workers who train a few times a week fall into 'light' or 'moderate'.",
      },
      {
        q: "How often should I recalculate my TDEE?",
        a: "Recalculate after every 3–5 kg of weight change or a lasting change in activity, because your energy needs shift with body size.",
      },
    ],
  },

  "protein-calculator": {
    intro: [
      "The protein calculator estimates how many grams of protein you should eat each day based on your body weight and your goal. Protein needs scale with activity and intent: sedentary people need relatively little, while those building muscle or dieting need considerably more to protect lean mass.",
      "Adequate protein supports muscle repair, satiety and metabolic health. This tool multiplies your weight by a goal-based grams-per-kilogram factor and gives a sensible range around it.",
    ],
    formula: {
      expression: "protein (g/day) = body weight (kg) × factor",
      where: [
        ["factor", "0.8 sedentary, 1.4 active, 1.8 build muscle, 2.0 fat loss (g/kg)"],
        ["range", "factor ± 0.2 g/kg for a practical band"],
      ],
      note: "The 0.8 g/kg figure is the minimum RDA; athletes and dieters benefit from more.",
    },
    howToUse: [
      "Enter your body weight in kilograms.",
      "Pick the goal that matches your training and diet.",
      "Read your daily protein target and the suggested range.",
      "Spread the total across 3–4 meals for best absorption.",
    ],
    goodToKnow: [
      "Higher protein preserves muscle during a calorie deficit and increases fullness.",
      "Meals of roughly 20–40 g of protein maximise muscle-protein synthesis.",
      "Quality sources include lean meat, fish, eggs, dairy, legumes, tofu and soy.",
      "Very high intakes are safe for healthy kidneys, but those with kidney disease should ask a doctor.",
    ],
    faqs: [
      {
        q: "Is more protein always better?",
        a: "Up to about 1.6–2.2 g/kg supports muscle and satiety; beyond that there is little added benefit for most people and it simply displaces other nutrients.",
      },
      {
        q: "Should I use body weight or lean body mass?",
        a: "Total body weight is the simplest and works well for most people. If you carry a lot of excess fat, basing the target on lean or goal weight avoids over-estimating.",
      },
      {
        q: "Does protein timing matter?",
        a: "Total daily intake matters most. Splitting it into several evenly spaced meals is a small but useful optimisation for muscle building.",
      },
    ],
  },

  "macro-calculator": {
    intro: [
      "The macro calculator splits a daily calorie target into grams of carbohydrate, protein and fat. Macronutrients each supply energy at a fixed rate, so once you choose how to divide calories by percentage, the calculator converts those percentages into grams you can track.",
      "Different splits suit different goals — a balanced split works for general health, low-carb for appetite control, and high-protein for muscle building or dieting.",
    ],
    formula: {
      expression: "grams = (calories × macro%) ÷ energy density",
      where: [
        ["carbs", "4 kcal per gram"],
        ["protein", "4 kcal per gram"],
        ["fat", "9 kcal per gram"],
        ["macro%", "the chosen split, e.g. 40 / 30 / 30"],
      ],
      note: "Carbs and protein yield 4 kcal/g; fat yields 9 kcal/g. Percentages must sum to 100.",
    },
    howToUse: [
      "Enter your daily calorie target.",
      "Choose a macro split (balanced, low-carb or high-protein).",
      "Read the grams and calories for carbs, protein and fat.",
      "Use these grams as daily targets in a food tracker.",
    ],
    goodToKnow: [
      "Fat is more than twice as energy-dense as carbs or protein, so small gram changes shift calories a lot.",
      "Protein is usually kept high across all splits to protect muscle.",
      "Low-carb splits can help with appetite and blood-sugar control but are not required for fat loss.",
      "Total calories drive weight change; the split mainly affects performance, satiety and adherence.",
    ],
    faqs: [
      {
        q: "Which macro split is best?",
        a: "There is no single best split — pick one you can stick to. Keep protein adequate and adjust carbs and fat to your preference and how you train.",
      },
      {
        q: "Why do carbs and protein have 4 calories but fat has 9?",
        a: "That reflects each nutrient's energy density (Atwater factors). Alcohol, for reference, provides about 7 kcal/g.",
      },
      {
        q: "Do I have to hit my macros exactly?",
        a: "No. Getting within about 5–10 g of each target is plenty for most goals; consistency over weeks matters far more than daily precision.",
      },
    ],
  },

  "calories-burned-calculator": {
    intro: [
      "This calculator estimates how many calories an activity burns using MET values — the Metabolic Equivalent of Task. One MET is the energy you use sitting quietly, so an activity rated at 8 MET burns roughly eight times that rate.",
      "By combining an activity's MET value with your body weight and how long you exercise, you get a quick estimate of energy expenditure that is useful for planning training and tracking your overall calorie balance.",
    ],
    formula: {
      expression: "calories = MET × weight (kg) × time (hours)",
      where: [
        ["MET", "metabolic equivalent of the activity (e.g. running ≈ 9.8)"],
        ["weight", "body weight in kilograms"],
        ["time", "duration in hours (minutes ÷ 60)"],
      ],
      note: "A MET of 1 equals about 1 kcal per kg of body weight per hour at rest.",
    },
    howToUse: [
      "Choose your activity from the list (each shows its MET value).",
      "Enter your body weight in kilograms.",
      "Enter how long you did the activity in minutes.",
      "Read the total calories burned and the per-minute burn rate.",
    ],
    goodToKnow: [
      "MET values are population averages; a fitter person may burn fewer calories for the same task.",
      "Heavier people burn more calories doing the same activity because more mass must be moved.",
      "Intensity matters — jogging and sprinting share a name but have very different METs.",
      "This estimate includes resting metabolism, so it slightly overstates the 'extra' burn versus doing nothing.",
    ],
    faqs: [
      {
        q: "What exactly is a MET?",
        a: "A MET is the ratio of an activity's energy cost to resting energy use. Sitting quietly is 1 MET; brisk walking is about 3.5 MET.",
      },
      {
        q: "Why does my fitness tracker show a different number?",
        a: "Wearables use heart rate, motion sensors and personal data to refine the estimate, whereas MET tables use averages. Both are approximations.",
      },
      {
        q: "Does body weight really change calories burned?",
        a: "Yes. Calories scale directly with weight, so a 90 kg person burns noticeably more than a 60 kg person over the same workout.",
      },
    ],
  },

  "target-heart-rate-calculator": {
    intro: [
      "The target heart-rate calculator shows the beats-per-minute ranges you should aim for to train at different intensities. It first estimates your maximum heart rate from your age, then maps out warm-up, fat-burn, cardio and peak zones.",
      "If you enter your resting heart rate, it uses the more personalised Karvonen (heart-rate reserve) method, which accounts for your cardiovascular fitness and gives more accurate zones than age alone.",
    ],
    formula: {
      expression: "max HR = 220 − age ; Karvonen target = ((max HR − resting HR) × intensity) + resting HR",
      where: [
        ["max HR", "estimated maximum heart rate (bpm)"],
        ["resting HR", "your heart rate at complete rest (bpm)"],
        ["intensity", "zone fraction, e.g. 0.7 for 70%"],
      ],
      note: "Without a resting HR, zones use a simple percentage of maximum heart rate.",
    },
    howToUse: [
      "Enter your age to estimate your maximum heart rate.",
      "Optionally add your resting heart rate for the Karvonen method.",
      "Read the bpm range for each training zone in the table.",
      "Aim for the zone that matches your session's goal.",
    ],
    goodToKnow: [
      "The 220 − age formula is a convenient estimate with an error of about ±10–12 bpm.",
      "Measure resting heart rate first thing in the morning before getting up for the best value.",
      "Fat-burn and cardio zones overlap; higher intensity burns more total calories even if a smaller share comes from fat.",
      "Medications such as beta-blockers lower heart rate and make these estimates unreliable.",
    ],
    faqs: [
      {
        q: "What is the difference between the percentage and Karvonen methods?",
        a: "The percentage method takes a share of your maximum heart rate; Karvonen bases zones on your heart-rate reserve (max minus resting), personalising them to your fitness.",
      },
      {
        q: "Is the 'fat-burning zone' the best way to lose fat?",
        a: "Not necessarily. Lower intensity uses a higher share of fat for fuel, but higher-intensity work burns more total calories, which matters more for fat loss.",
      },
      {
        q: "How do I measure my maximum heart rate accurately?",
        a: "Age formulas are only estimates. A supervised graded exercise test is the accurate way to find your true maximum heart rate.",
      },
    ],
  },

  "bmi-calculator": {
    intro: [
      "Body Mass Index (BMI) is a simple screening number that relates your weight to your height. It is widely used to place adults into underweight, normal, overweight and obese categories and to flag possible weight-related health risk.",
      "BMI is quick and needs only height and weight, but it does not distinguish muscle from fat, so very muscular people can score high while still being lean.",
    ],
    formula: {
      expression: "BMI = weight (kg) ÷ height (m)²",
      where: [
        ["weight", "body weight in kilograms"],
        ["height", "height in metres (cm ÷ 100)"],
      ],
      note: "Categories: under 18.5 underweight, 18.5–24.9 normal, 25–29.9 overweight, 30+ obese.",
    },
    howToUse: [
      "Choose metric or imperial units.",
      "Enter your weight and height.",
      "Read your BMI and its category.",
      "Compare against the healthy weight range shown for your height.",
    ],
    goodToKnow: [
      "BMI is a population screening tool, not a diagnosis of health.",
      "It can overestimate fat in athletes and underestimate it in older adults with low muscle.",
      "Asian populations often use a lower overweight threshold (23) due to higher risk at a given BMI.",
      "Waist circumference and body-fat percentage add useful context BMI cannot capture.",
    ],
    faqs: [
      {
        q: "Is BMI accurate for everyone?",
        a: "It works reasonably for the general adult population but is misleading for very muscular people, pregnant women, children and the elderly.",
      },
      {
        q: "What BMI is considered healthy?",
        a: "A BMI of 18.5 to 24.9 is classed as a healthy weight for most adults.",
      },
      {
        q: "Should I rely on BMI alone?",
        a: "No. Combine it with waist measurement, body-fat percentage and how you feel and function for a fuller picture.",
      },
    ],
  },

  "bmr-calculator": {
    intro: [
      "Basal Metabolic Rate (BMR) is the number of calories your body burns at complete rest just to keep vital functions running — breathing, circulation and cell repair. It is the largest single component of the calories you burn each day.",
      "This calculator uses the Mifflin-St Jeor equation, the most reliable general BMR formula, and can multiply it by an activity factor to estimate your full daily calorie burn.",
    ],
    formula: {
      expression: "BMR = 10·weight(kg) + 6.25·height(cm) − 5·age + s",
      where: [
        ["weight", "body weight in kilograms"],
        ["height", "height in centimetres"],
        ["age", "age in years"],
        ["s", "+5 for males, −161 for females"],
      ],
      note: "Multiply BMR by an activity factor (1.2–1.9) to estimate total daily calories.",
    },
    howToUse: [
      "Select your sex and enter age, weight and height.",
      "Read your BMR — the calories burned at rest.",
      "Choose an activity level to see your total daily needs.",
      "Use these figures as the baseline for a calorie plan.",
    ],
    goodToKnow: [
      "BMR falls with age as muscle mass declines.",
      "More lean muscle raises BMR because muscle is metabolically active tissue.",
      "BMR usually accounts for 60–70% of the calories you burn each day.",
      "Crash diets can lower BMR as the body adapts to conserve energy.",
    ],
    faqs: [
      {
        q: "What is the difference between BMR and RMR?",
        a: "They are very close. BMR is measured under strict fasted, rested conditions; Resting Metabolic Rate (RMR) is measured under slightly less strict conditions and is usually a touch higher.",
      },
      {
        q: "Why does sex change the result?",
        a: "Men typically carry more lean muscle and less fat than women of the same size, which raises their resting energy needs (the +5 vs −161 constant).",
      },
      {
        q: "Can I eat below my BMR to lose weight faster?",
        a: "It is generally not advised. Eating below BMR for long periods can reduce energy, muscle and long-term metabolic rate; create a deficit from your total daily expenditure instead.",
      },
    ],
  },

  "body-fat-calculator": {
    intro: [
      "The body-fat calculator estimates your body-fat percentage from simple tape measurements using the U.S. Navy circumference method. Unlike BMI, it separates fat from lean mass, giving a more meaningful picture of body composition.",
      "It needs your height and neck and waist circumference (plus hip for women). The result places you in categories from essential fat through athletic, fitness, average and above average.",
    ],
    formula: {
      expression: "Men: %BF = 495 ÷ (1.0324 − 0.19077·log₁₀(waist − neck) + 0.15456·log₁₀(height)) − 450",
      where: [
        ["waist", "waist circumference in cm"],
        ["neck", "neck circumference in cm"],
        ["hip", "hip circumference in cm (women only)"],
        ["height", "height in cm"],
      ],
      note: "Women use waist + hip − neck in the formula, with different coefficients.",
    },
    howToUse: [
      "Select your sex.",
      "Enter your height, neck and waist measurements in centimetres (women also add hip).",
      "Measure snugly with a flexible tape, not pulling tight.",
      "Read your estimated body-fat percentage and category.",
    ],
    goodToKnow: [
      "The Navy method is convenient but less accurate than DEXA or hydrostatic weighing.",
      "Measurement technique strongly affects the result — measure the same spots each time.",
      "Essential fat is about 2–5% for men and 10–13% for women; below this is unhealthy.",
      "Track the trend over weeks rather than fixating on a single reading.",
    ],
    faqs: [
      {
        q: "How accurate is the Navy body-fat method?",
        a: "It is typically within about 3–4% of laboratory methods for most people, but consistency of measurement matters more than the single number.",
      },
      {
        q: "Where exactly do I measure?",
        a: "Neck below the larynx, waist at the navel for men and at the narrowest point for women, and hips at the widest point — all with a level, snug tape.",
      },
      {
        q: "What is a healthy body-fat percentage?",
        a: "Fitness ranges are roughly 14–17% for men and 21–24% for women, but healthy ranges vary with age and athletic goals.",
      },
    ],
  },

  "ideal-weight-calculator": {
    intro: [
      "The ideal weight calculator estimates a healthy target body weight for your height using three classic clinical formulas — Devine, Robinson and Miller — alongside the weight range that corresponds to a healthy BMI.",
      "These formulas were originally developed for medication dosing and give a useful reference point, but 'ideal' weight is a range rather than a single number and should be interpreted with build and muscle in mind.",
    ],
    formula: {
      expression: "Devine: 50 (male) / 45.5 (female) + 2.3 × inches over 5 ft",
      where: [
        ["base", "50 kg male, 45.5 kg female (Devine)"],
        ["inches over 5 ft", "(height in inches) − 60"],
        ["BMI range", "18.5 to 24.9 × height(m)² in kg"],
      ],
      note: "Robinson and Miller use the same structure with different base weights and per-inch increments.",
    },
    howToUse: [
      "Select your sex.",
      "Enter your height.",
      "Compare the Devine, Robinson and Miller estimates.",
      "Use the healthy BMI range as a realistic target band.",
    ],
    goodToKnow: [
      "The three formulas can differ by several kilograms — treat the spread as a range.",
      "These equations assume an average frame and do not account for muscle mass.",
      "For heights below 5 ft the formulas extrapolate and become less reliable.",
      "A healthy BMI range is often the most practical target for the general population.",
    ],
    faqs: [
      {
        q: "Which ideal-weight formula should I trust?",
        a: "None is definitive. They were made for drug dosing, so use them as a reference band and lean on the healthy BMI range for everyday goals.",
      },
      {
        q: "Why do the formulas ignore muscle?",
        a: "They depend only on height and sex, so a muscular person may sit above 'ideal' weight while being perfectly healthy.",
      },
      {
        q: "Is there one correct ideal weight?",
        a: "No. Ideal weight is a range that depends on frame size, muscle, age and health, not a single exact figure.",
      },
    ],
  },
};

export default info;
