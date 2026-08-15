const seo = {
  title: "Navy Body Fat Calculator",
  metaDescription:
    "US Navy circumference equations turn neck, waist and hip tapes into body fat % with a ±3.5-point range, ACE bands, lean mass, FFMI and a goal weight.",
  intro:
    "The Navy Body Fat Calculator estimates body fat percentage from height plus a neck and waist tape measurement for men, and neck, waist and hip for women, using the US Navy circumference equations developed by Hodgdon and Beckett at the Naval Health Research Center in 1984 and still used for the Department of Defense tape test. It runs both published forms of the equation — the metric 495/(1.0324 − 0.19077·log10(waist − neck) + 0.15456·log10(height)) − 450 for men and its imperial counterpart — and classifies the result against the American Council on Exercise bands, adding fat mass, lean mass, fat-free mass index and a goal weight if you supply your weight. It is informational only: the method's standard error against hydrostatic weighing is around 3.5 percentage points, so speak to a clinician or a registered dietitian before acting on the figure.",
  useCases: [
    "You have a military or law-enforcement tape test coming up and want to know roughly where you sit before someone else measures you.",
    "The scale has not moved in six weeks and you want to check whether you have swapped fat for muscle by tracking waist and neck instead of weight.",
    "You want to know what you would weigh at 15% body fat if you kept your current lean mass, so you have a target that is not just a round number.",
  ],
  benefits: [
    [
      "Reports the estimate as a range",
      "Shows your result plus a ±3.5 percentage-point band, because a single decimal from a tape measure implies a precision the method does not have.",
    ],
    [
      "Runs both published forms of the equation",
      "Calculates the metric and imperial versions separately in their native units and shows how far apart they land, rather than converting and hiding the rounding.",
    ],
    [
      "Turns the percentage into usable numbers",
      "Add your weight and it derives fat mass, lean mass, fat-free mass index, and the weight you would hit at a target body fat with lean mass held constant.",
    ],
  ],
  faqs: [
    [
      "How accurate is the Navy body fat method?",
      "Its standard error against hydrostatic weighing is roughly 3.5 percentage points, so a 20% result realistically means somewhere between about 16.5% and 23.5%. It was designed to screen large populations cheaply, not to match a DEXA scan, and it is most useful for tracking change over time with the same tape and the same measuring technique.",
    ],
    [
      "Why does the women's equation need a hip measurement?",
      "The female form of the equation regresses on waist + hip − neck rather than waist − neck, because hip girth carries much of the fat-distribution signal in women. Without the hip figure the calculation cannot run at all, which is why the men's and women's versions have entirely different coefficients.",
    ],
    [
      "What is a healthy body fat percentage?",
      "Using the American Council on Exercise bands, men sit in the fitness range at 14–17% and the average range at 18–24%, with 25% and above classed as obese; for women the fitness range is 21–24%, average is 25–31% and 32% and above is classed as obese. Essential fat — the minimum the body needs — is about 2–5% for men and 10–13% for women, and going near it carries real health risks.",
    ],
    [
      "Where exactly do I put the tape?",
      "Neck just below the larynx with the tape sloping slightly downward at the front; waist at the navel for men and at the narrowest point of the torso for women, horizontal all the way round at the end of a normal exhale; hip at the widest point of the buttocks with feet together. Keep the tape snug without compressing the skin, and measure three times and average — a centimetre of error at the waist moves the result by more than a percentage point.",
    ],
  ],
};

export default seo;
