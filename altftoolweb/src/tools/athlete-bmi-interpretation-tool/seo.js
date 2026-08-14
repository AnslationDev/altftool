const seo = {
  title: "Athlete BMI: Muscle or Fat? FFMI and Waist Check",
  metaDescription:
    "Put BMI beside Navy-tape body fat, height-normalised FFMI and waist-to-height against 0.5 to see whether a high reading is muscle or genuine fat.",
  steps: [
    "Pick Centimetres and kilograms or Feet, inches and pounds, then enter sex, height, weight and waist at the navel.",
    "Set Body fat figure to estimate it from tape measurements, or enter a DEXA or skinfold percentage you already have.",
    "Read BMI with its band beside body fat, lean mass, height-normalised FFMI against the drug-free ceiling and waist-to-height against the 0.5 limit.",
  ],
  intro:
    "The Athlete BMI Interpretation Tool tests whether a high BMI reflects fat or muscle by putting it beside three measures that can tell them apart: body fat percentage from the US Navy circumference equations, fat-free mass index with the Kouri height normalisation, and waist-to-height ratio against the 0.5 limit. BMI itself is weight divided by height squared and treats every kilogram identically, which is why a lean rugby player and a sedentary person of the same weight and height get the same number. The output states which reading the measurements actually support rather than leaving you to guess.",
  useCases: [
    "A 92 kg lifter at 180 cm reads BMI 28.4 and wants to know whether that is muscle or a genuine warning.",
    "Checking whether an insurance or workplace health screen has misclassified a strength athlete as overweight.",
    "Spotting the opposite pattern — a normal BMI paired with a waist-to-height ratio over 0.5.",
    "Feeding a DEXA body fat result into an FFMI figure to see how much lean mass is behind the BMI.",
  ],
  benefits: [
    ["Three cross-checks, not one", "Combines body fat, fat-free mass index and waist-to-height so a single measure cannot mislead."],
    ["Shows the BMI floor", "Calculates the BMI you would still have at a lean body fat with the same muscle, which often stays above 25."],
    ["Catches normal-weight obesity", "Flags a normal BMI sitting alongside high body fat or a large waist, a combination BMI alone never surfaces."],
  ],
  faqs: [
    [
      "Is BMI accurate for athletes and bodybuilders?",
      "No — it systematically overstates fatness in muscular people because it cannot distinguish lean mass from fat mass. Studies of professional rugby and American football squads routinely classify most of the roster as overweight or obese despite body fat percentages in the athletic range.",
    ],
    [
      "What is a good FFMI?",
      "Fat-free mass index is lean mass in kilograms divided by height in metres squared, normalised to a 1.8 m reference. Untrained men typically sit around 18 to 20; a normalised value approaching 25 is close to the ceiling that drug-free trained men in the 1995 Kouri study almost never exceeded, and the female equivalent runs several points lower.",
    ],
    [
      "What should I use instead of BMI?",
      "Waist-to-height ratio is the most practical alternative: a waist under half your height is the simple rule, and it tracks central fat regardless of muscle. Body fat percentage from a DEXA scan, skinfolds or the Navy tape method adds the composition picture, and blood pressure, lipids and glucose remain the measures that risk actually rests on.",
    ],
    [
      "Can a muscular person with a high BMI still be unhealthy?",
      "Yes. Muscle explains the number, but it does not cancel high blood pressure, poor lipids or high blood glucose, and very high lean mass carries its own load on joints and the heart in some sports. Treat a muscle-driven BMI as a reason to stop worrying about that one index, not as a reason to skip routine checks with a doctor.",
    ],
  ],
};

export default seo;
