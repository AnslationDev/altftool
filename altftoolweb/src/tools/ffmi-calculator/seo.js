const seo = {
  title: "FFMI Calculator — Normalised Fat-Free Mass Index",
  metaDescription:
    "Enter weight, height and body fat % to get FFMI and Kouri height-normalised FFMI, with lean mass, interpretation bands and drug-free ceiling headroom.",
  steps: [
    "Choose Metric (kg / cm) or Imperial (lb / ft), then enter Weight, Height and Body fat (%) — body fat accepts 3 to 70 in 0.5 steps.",
    "Pick the Reference scale — Male bands (ceiling 25) or Female bands (ceiling 22); the result recomputes as you type, with no calculate button.",
    "Read the Height-normalised FFMI headline and its band, plus lean mass, BMI and lean-mass headroom to the ceiling; Copy result copies the summary and Reset restores the 80 kg / 180 cm defaults.",
  ],
  intro:
    "Fat-Free Mass Index (FFMI) is lean body mass in kilograms divided by height in metres squared — the muscularity measure BMI cannot give, because BMI cannot tell muscle from fat. This calculator also reports the height-normalised FFMI from Kouri et al. (1995), which adds 6.1 x (1.8 - your height in metres) so lifters of different heights land on one comparable scale. It is aimed at people tracking a bulk or cut who already have a body fat measurement.",
  useCases: [
    "Check whether a 4 kg gain over a bulk was mostly lean mass or mostly fat, by comparing FFMI before and after.",
    "Compare your muscularity with a training partner of a very different height using the normalised figure instead of raw scale weight.",
    "See how much lean mass separates you from the drug-free ceiling of about 25 normalised FFMI before setting a physique goal.",
    "Explain to a doctor or coach why a BMI of 27 is not overweight when body fat is 10 percent and FFMI is 24.",
  ],
  benefits: [
    [
      "Height-normalised",
      "Applies the Kouri 6.1 coefficient so a 1.65 m and a 1.90 m lifter can be judged on the same number.",
    ],
    [
      "Shows the headroom",
      "Reports the lean mass and scale weight that would put you exactly at the drug-free ceiling for your height.",
    ],
    [
      "Metric and imperial",
      "Takes kilograms and centimetres or pounds and feet-inches, using exact conversion factors.",
    ],
  ],
  faqs: [
    [
      "What is a good FFMI?",
      "For men, a normalised FFMI of 18 to 20 is average for the untrained, 20 to 22 reflects a year or two of training, 22 to 24 is well-muscled and 24 to 25 sits at the drug-free ceiling. For women the equivalent bands run roughly 14 to 16 average, 16 to 18 above average, 18 to 20 excellent and 20 to 22 near the ceiling.",
    ],
    [
      "How is FFMI calculated?",
      "FFMI = fat-free mass (kg) divided by height (m) squared, where fat-free mass is total weight multiplied by (1 minus body fat percentage / 100). The normalised version adds 6.1 x (1.8 - height in metres) to correct the residual bias toward taller people, so an 80 kg man at 180 cm and 15 percent body fat has 68 kg lean mass and an FFMI of 21.0.",
    ],
    [
      "Is an FFMI above 25 proof of steroid use?",
      "No. Kouri and colleagues found that essentially no drug-free athlete in their sample exceeded a normalised FFMI of about 25, which is why 25 is quoted as a practical ceiling — but it is a population observation, not a test. An underestimated body fat percentage is by far the most common reason for an implausibly high result, since a 5-point error moves FFMI by more than a full point.",
    ],
    [
      "Is FFMI better than BMI?",
      "For anyone who trains, yes — BMI counts muscle and fat identically, so a lean 85 kg lifter at 180 cm is classed overweight at a BMI of 26 while his FFMI shows the mass is lean. FFMI's weakness is that it needs a body fat measurement, so it inherits all the error of calipers, bioimpedance scales or DEXA.",
    ],
  ],
};

export default seo;
