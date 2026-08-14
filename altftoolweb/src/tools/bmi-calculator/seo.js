const seo = {
  title: "BMI Calculator with WHO Bands and Healthy Weight Range",
  metaDescription:
    "Weight in kg divided by height in metres squared, on the WHO bands, plus the kg range for a BMI of 18.5-24.9 at your height and 33 ml/kg of water.",
  steps: [
    "Enter Height with the CM or FT/IN toggle and Weight with KG or LBS — the two systems can be mixed, since imperial entries are converted before the formula runs.",
    "Add Age and Gender if you want maintenance calories from the Mifflin-St Jeor equation, then press Calculate Now.",
    "Read the BMI Analysis Result with its WHO category, Protein Goal and Water Intake, then press Copy Report or Download Report for a BMI_Report file.",
  ],
  intro:
    "This BMI Calculator divides your weight in kilograms by your height in metres squared and places the result on the WHO scale — under 18.5 Underweight, 18.5 to 24.9 Normal, 25 to 29.9 Overweight, 30 and above Obese. Enter height in centimetres or feet and inches and weight in kilograms or pounds, and it also returns the weight range that would put you inside the normal band, a daily water figure of 33 ml per kilogram, and a protein target scaled to your category. Add age and sex and it estimates maintenance calories from the Mifflin-St Jeor equation; it is a screening number, not a diagnosis.",
  useCases: [
    "A gym membership or insurance form asks for your BMI and you have your height in feet and inches but your weight in kilograms, with no interest in converting either by hand.",
    "You want a concrete goal weight rather than a vague one, so you need the actual kilogram range that corresponds to a BMI between 18.5 and 24.9 at your height.",
    "You have been told your BMI is 27 and want to know what that band actually means before your next check-up, along with roughly how many calories a day maintain your current weight.",
  ],
  benefits: [
    [
      "Turns the category into a weight target",
      "Instead of just naming a band, it back-calculates the kilogram range that a BMI of 18.5 to 24.9 works out to at your exact height.",
    ],
    [
      "Mixes measurement systems freely",
      "Height in feet and inches with weight in kilograms, or centimetres with pounds — the conversions to metric happen before the formula runs.",
    ],
    [
      "Adds calories when you give it age and sex",
      "Supply those two optional fields and it runs the Mifflin-St Jeor BMR equation and a moderate activity factor alongside the BMI result.",
    ],
  ],
  faqs: [
    [
      "What is the formula for BMI?",
      "BMI equals weight in kilograms divided by height in metres squared. For a person 1.75 m tall weighing 70 kg that is 70 / (1.75 x 1.75) = 22.9. Imperial entries are converted first, using 30.48 cm per foot, 2.54 cm per inch and 0.453592 kg per pound.",
    ],
    [
      "What BMI is considered healthy?",
      "The WHO classification used here treats 18.5 to 24.9 as the normal range, below 18.5 as underweight, 25 to 29.9 as overweight and 30 or above as obese. These cut-offs are population screening thresholds, and some health bodies apply lower ones for South Asian populations, so discuss your own number with a clinician rather than treating the band as a verdict.",
    ],
    [
      "Why does BMI call muscular people overweight?",
      "Because the formula only knows height and weight — it cannot tell muscle from fat, so a lean, heavily trained person can land above 25 while carrying very little body fat. It is a screening tool for populations rather than a body-composition measurement; a waist measurement or a body-fat estimate gives a more useful picture for an individual.",
    ],
    [
      "How is the daily water figure worked out?",
      "It uses 33 ml of water per kilogram of body weight, so a 70 kg person gets about 2.3 litres a day. That is a rule of thumb for a temperate climate and ordinary activity — heat, exercise, pregnancy and several medical conditions change the requirement, and some conditions require restricting fluid, so treat it as a starting point.",
    ],
  ],
};

export default seo;
