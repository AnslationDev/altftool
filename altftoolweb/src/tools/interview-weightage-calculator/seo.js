const seo = {
  title: "Interview Weightage Calculator: UPSC, IBPS PO",
  metaDescription:
    "Combine written and interview marks under UPSC 1750:275, IBPS PO 80:20 or SBI PO 75:25, and see how many written marks one interview mark is worth.",
  steps: [
    "Pick the Selection scheme — UPSC Civil Services, IBPS PO, SBI PO or Custom scheme — which loads its written and interview maximums and weights.",
    "Enter your written and interview scores, then \"Their written score\" and \"Their interview score\" under \"Compare against another candidate\".",
    "Read the Final merit score, \"One interview mark, in written marks\" and the interview score needed to draw level, then press \"Copy result\".",
  ],
  intro:
    "This interview weightage calculator combines a written score and an interview score into the final merit figure a recruiting body actually publishes, using the weighted-sum rule merit = (written ÷ written max) × written weight + (interview ÷ interview max) × interview weight. It carries the published schemes for UPSC Civil Services, where Mains 1750 and the Personality Test 275 are simply added to give a merit out of 2025, and for IBPS PO and SBI PO, where the stages are normalised to 80:20 and 75:25. Beyond the total, it converts the interview into its written-mark equivalent so you can see what one interview mark is really worth.",
  useCases: [
    "A UPSC candidate with 850 in Mains working out how far a 180 in the Personality Test leaves them from a rival who scored 30 marks higher in the written stage.",
    "An IBPS PO aspirant checking that the 20% interview weight means one interview mark is worth only about 0.56 mains marks.",
    "Comparing two candidates whose written and interview strengths are reversed, to see which profile the scheme actually rewards.",
  ],
  benefits: [
    ["Official weightages built in", "UPSC 1750:275, IBPS PO 80:20 and SBI PO 75:25 are pre-loaded, with a custom option for state exams."],
    ["Exchange rate between stages", "Shows how many written marks one interview mark buys, which is what decides where to invest effort."],
    ["Head-to-head comparison", "Calculates the interview score you would need to draw level with a specific rival, or says it is out of reach."],
  ],
  faqs: [
    [
      "How much weightage does the UPSC interview carry?",
      "275 marks out of a final merit of 2025, which is 13.58%. UPSC adds the Personality Test marks straight onto the Mains written total of 1750 — there is no percentage conversion, so one interview mark and one written mark count exactly the same in the final list.",
    ],
    [
      "What is the interview weightage in IBPS PO and SBI PO?",
      "IBPS PO uses 80% Mains and 20% interview; SBI PO uses 75% Mains and 25% for the Phase III group exercise and interview together. Because the maximums differ from the weights, one IBPS interview mark is worth roughly 0.56 mains marks in the final merit.",
    ],
    [
      "Can a good interview make up for a weak written score?",
      "Only within the interview's own weight. At UPSC the entire Personality Test is 275 merit points, so no interview can recover a gap larger than that — and typical scores cluster far tighter than the full range. This calculator shows the exact gap a full interview could close for your scheme.",
    ],
    [
      "Do SSC exams have an interview stage?",
      "Not for the posts covered by the 2016 decision to abolish interviews for Group B non-gazetted and Group C recruitment. SSC CGL selection is decided on written tier marks and, where applicable, the skill or typing test, so an interview weightage does not arise. Check the notice for the specific post you are applying to.",
    ],
  ],
};

export default seo;
