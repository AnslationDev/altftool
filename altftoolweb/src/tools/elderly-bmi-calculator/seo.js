const seo = {
  title: "Elderly BMI Calculator: 24-29 Range, MUST, Knee",
  metaDescription:
    "BMI for adults 65+ read against the 24-29 desirable band, with Chumlea knee-height stature estimation and a MUST malnutrition screening score.",
  steps: [
    "Enter Age (years) and Sex, then choose Measured standing height or Estimate from knee height.",
    "Add Current weight (kg), optionally Weight 3 to 6 months ago (kg), and tick the box if the person is acutely ill with little food for over 5 days.",
    "Read the BMI, the Age-adjusted category (65+) and the MUST malnutrition screening score, then press Copy result.",
  ],
  intro:
    "This calculator gives BMI as weight in kilograms divided by height in metres squared, then reads it against the 24 to 29 desirable range that Lipschitz proposed for adults over 65 rather than the 18.5 to 24.9 band used for younger adults. It also estimates standing height from knee height using the Chumlea equations, for people whose spine has compressed or who cannot stand for a measurement, and scores malnutrition risk with the BAPEN MUST screening tool. In later life the bigger danger is usually being too thin, so the output leads with how far the weight sits below the desirable range.",
  useCases: [
    "Checking a parent's BMI when a measured standing height is no longer possible, using knee height instead",
    "Screening a care-home resident with MUST after an unplanned weight loss of several kilograms",
    "Understanding why a BMI of 23, which reads as healthy at 40, is a low-normal flag at 80",
  ],
  benefits: [
    ["Age-adjusted range", "Uses the 24 to 29 desirable BMI band for 65+ instead of the general adult band."],
    ["Height without standing", "Chumlea knee-height equations give a stature estimate for bed-bound or stooped patients."],
    ["MUST score included", "Combines BMI, unplanned weight loss and acute illness into the 0, 1, 2+ risk categories."],
  ],
  faqs: [
    [
      "What is a healthy BMI for someone over 65?",
      "Roughly 24 to 29, higher than the 18.5 to 24.9 band used for younger adults. A 2014 meta-analysis in the American Journal of Clinical Nutrition found the lowest all-cause mortality in adults 65 and over clustered near BMI 27.5, with risk rising below about 23.",
    ],
    [
      "Why does BMI change with age?",
      "BMI itself is the same formula at every age, but the risk attached to a given value shifts. Older adults lose muscle and bone, so a low BMI more often reflects frailty and malnutrition than leanness, and a modest fat reserve provides a buffer during illness and hospital stays.",
    ],
    [
      "How do you measure height in an elderly person who cannot stand?",
      "Use the Chumlea knee-height equations. With the knee and ankle at 90 degrees, measure from the sole of the foot to the top of the thigh, then apply height = 64.19 − (0.04 × age) + (2.02 × knee height) for men and 84.88 − (0.24 × age) + (1.83 × knee height) for women, all in centimetres.",
    ],
    [
      "What weight loss is a warning sign in older adults?",
      "More than 5 per cent of body weight lost unintentionally over three to six months, and more than 10 per cent is scored as high risk by MUST. For a 60 kg person that is 3 kg and 6 kg respectively. Any unplanned loss at that scale is worth raising with a GP, because it often precedes a fall or a hospital admission.",
    ],
  ],
};

export default seo;
