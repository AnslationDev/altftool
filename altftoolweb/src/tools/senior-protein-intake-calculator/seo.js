const seo = {
  intro:
    "This calculator gives an adult aged 60 or over a daily protein target in grams, using the bands agreed by the PROT-AGE Study Group (JAMDA 2013) and the ESPEN expert group (Clinical Nutrition 2014): 1.0-1.2 g per kg of body weight for healthy older adults, 1.2-1.5 g/kg with chronic illness, and up to 2.0 g/kg during acute illness, injury or malnutrition. It also splits that total across your meals, because ageing muscle responds to the size of each meal rather than the daily figure alone — roughly 25-30 g of protein per meal is needed to trigger muscle protein synthesis. At a BMI of 30 or more it doses on adjusted body weight instead of actual weight, as clinical practice does.",
  useCases: [
    "Checking whether a 72-year-old at 70 kg who lifts weights twice a week is eating anywhere near the 84 g a day floor",
    "Planning meals after hip surgery, when protein needs can rise to 1.5-2.0 g/kg during recovery",
    "Finding out why three 20 g protein meals may not maintain muscle even though the daily total looks adequate",
  ],
  benefits: [
    [
      "Uses the geriatric bands, not the RDA",
      "The 0.8 g/kg RDA was set for healthy young adults; PROT-AGE and ESPEN both put older adults well above it.",
    ],
    [
      "Per-meal dose, not just a daily number",
      "Shows whether each meal clears the 25-30 g threshold that older muscle needs to respond.",
    ],
    [
      "Adjusted body weight above BMI 30",
      "Uses ABW = IBW + 0.25 x (actual - IBW) so the target is not inflated by body fat.",
    ],
  ],
  faqs: [
    [
      "How much protein does a 70-year-old need per day?",
      "For a healthy older adult, 1.0-1.2 g per kilogram of body weight — about 70-84 g a day at 70 kg. That is 25-50% above the 0.8 g/kg adult RDA, because ageing muscle is less responsive to protein. Chronic illness raises it to 1.2-1.5 g/kg and acute illness or injury can push it to 2.0 g/kg.",
    ],
    [
      "Why do older adults need more protein than younger adults?",
      "Anabolic resistance. The same dose of protein produces a smaller muscle-building response in older muscle, so a bigger dose is needed to reach the same effect. Combined with reduced appetite and less physical activity, this is a main driver of sarcopenia, the progressive loss of muscle mass and strength with age.",
    ],
    [
      "How much protein should be in each meal?",
      "About 25-30 g of high-quality protein per meal, carrying roughly 2.5-2.8 g of leucine, which is the dose commonly cited as needed to maximally stimulate muscle protein synthesis in older adults. Moore and colleagues put it at about 0.40 g per kg of body weight per meal for older people, against 0.24 g/kg for young adults. Spreading protein evenly beats loading it all at dinner.",
    ],
    [
      "Is high protein bad for older kidneys?",
      "In people with normal kidney function, intakes in the 1.0-1.5 g/kg range have not been shown to cause kidney damage, and both PROT-AGE and ESPEN recommend them for older adults. Severe kidney disease is different: with an eGFR below 30 and not on dialysis, protein is deliberately restricted and the target must be set by a kidney specialist. If you have any kidney condition, discuss protein with your doctor before changing your diet.",
    ],
  ],
};

export default seo;
