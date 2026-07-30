const seo = {
  intro:
    "This calculator estimates the calories an activity burns using the standard MET equation — kcal = MET × 3.5 × body weight in kg ÷ 200 × minutes — where a MET is a multiple of your resting oxygen uptake of 3.5 mL per kg per minute. Pick one of six activities (brisk walking 3.5 METs, weight training 5, swimming 6, cycling 7.5, running 8, jump rope 8.5), enter your weight and duration, and you get the total plus a per-minute and per-hour rate. It is an estimate of gross energy cost, not a measured reading, so treat it as a planning number rather than a precise ledger.",
  useCases: [
    "You walked 45 minutes at lunch and want to know roughly what that adds to the day before deciding on a second helping at dinner",
    "You are choosing between a 30-minute run and an hour of cycling on a busy evening and want to see which actually costs more energy at your weight",
    "Your fitness watch says one number and the treadmill says another, and you want a neutral third estimate from the same MET formula both are loosely based on",
  ],
  benefits: [
    ["Shows the rate, not just the total", "Alongside the total you get kcal per minute and per hour, so you can compare activities without redoing the arithmetic for different durations."],
    ["Weight is in the formula, not assumed", "Burn scales directly with body mass, so a 90 kg person sees a figure roughly 29% higher than a 70 kg person for the identical session."],
    ["Published MET values, stated openly", "The MET behind each activity is the number the tool multiplies by, so you can sanity-check it against the Compendium of Physical Activities instead of trusting a black box."],
  ],
  faqs: [
    [
      "How many calories does a 30-minute run burn?",
      "Roughly 294 kcal for a 70 kg person, using running at 8 METs: 8 × 3.5 × 70 ÷ 200 = 9.8 kcal per minute over 30 minutes. A 90 kg runner burns about 378 kcal for the same half hour, because the figure scales linearly with body weight.",
    ],
    [
      "What is a MET?",
      "A MET is one multiple of resting metabolic rate, defined as consuming 3.5 mL of oxygen per kg of body weight per minute. An activity rated 8 METs therefore costs about eight times your resting energy use, which is why the formula multiplies MET by 3.5 and divides by 200 — 200 being the conversion from mL of oxygen to kilocalories.",
    ],
    [
      "Is this the same as \"calories burned above resting\"?",
      "No. The MET equation gives gross energy cost, which includes the calories you would have burned lying still during that time. To get the net additional burn, subtract roughly one MET's worth — about 1.2 kcal per minute for a 70 kg person — from the result.",
    ],
    [
      "Why is my watch's number different?",
      "Wearables adjust for heart rate, pace, and sometimes VO2 max, while a MET table uses a single average intensity per activity. Two people running at 8 km/h and 12 km/h both fall under \"running\" here, so expect a spread of 20-30% against a device that measures your actual effort. For weight management or medical decisions, check with a clinician or dietitian rather than relying on any single estimate.",
    ],
  ],
};

export default seo;
