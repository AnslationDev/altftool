const seo = {
  intro:
    "This checker converts a recruitment scheme's physical standard into the exact weight range, in kilograms, that your height allows — using Body Mass Index (weight in kg divided by height in metres squared), the measure recruitment medical boards apply when a notification says weight must be 'proportionate to height and age'. It also checks your height and chest against the published minimums for Indian Army Agniveer GD and SSC GD Constable, or against figures you type from your own notification. Alongside the BMI band it shows the Devine (1974) reference weight, the ideal-body-weight formula quoted in service medical notes.",
  useCases: [
    "Find out how many kilograms you need to lose before the SSC GD Constable medical exam if your BMI reads above 25 at 170 cm.",
    "Check whether a 77 cm relaxed chest with 5 cm expansion clears the Indian Army Soldier GD standard before the recruitment rally.",
    "Enter a state police notification's own height and chest figures and test a candidate against them without doing the arithmetic by hand.",
  ],
  benefits: [
    ["A number, not a guess", "Turns 'weight proportionate to height' into a specific kilogram range for your exact height."],
    ["Checks every standard at once", "Height, absolute minimum weight, relaxed chest and chest expansion are each marked pass or fail with the gap in centimetres."],
    ["Works for any notification", "The custom option accepts your own minimum height, chest and expansion, so category and state relaxations are covered."],
  ],
  faqs: [
    [
      "What is the minimum height for SSC GD Constable?",
      "170 cm for male candidates and 157 cm for female candidates in the unreserved, OBC and EWS categories. Relaxations are notified for Scheduled Tribe candidates and for applicants from the North-Eastern states and hill communities such as Gorkha, Garhwali, Kumaoni and Dogra, so check the height printed in the current notification.",
    ],
    [
      "What weight is accepted for 170 cm in Army or CAPF recruitment?",
      "Roughly 53.5 kg to 72 kg, because 170 cm squared is 2.89 square metres and the medical board's BMI window of 18.5 to 25 multiplies out to that range. The Indian Army also applies an absolute floor of about 50 kg for Soldier GD in most recruiting zones.",
    ],
    [
      "Is there an official height-weight chart for army recruitment?",
      "The Army publishes height, weight and chest tables that vary by recruiting zone, trade and age group rather than one all-India chart. The constant across notifications is the requirement that weight be proportionate to height, which medical boards assess through BMI, so a BMI-derived band is the safest way to plan.",
    ],
    [
      "Can I be rejected for being underweight rather than overweight?",
      "Yes. A BMI below 18.5, or a weight under the scheme's absolute floor such as the Army's 50 kg for Soldier GD, is grounds for rejection at the medical stage just as obesity is. If you are close to either edge, speak to a doctor before changing your diet or training load.",
    ],
  ],
};

export default seo;
