const seo = {
  title: "Pet Care Prompt Builder: Life Stage & Session",
  metaDescription:
    "Turns your dog or cat's species, age and daily minutes into an AI prompt already stating the life stage, session length and toilet-break interval.",
  steps: [
    "Set Species, Age and Age unit, then add the optional Pet name, Breed or type and Weight in kg.",
    "Choose 'What the plan is for' and 'Your experience', set Training minutes per day (5 to 240 in steps of 5), and describe 'The behaviour you most want to change' if there is one.",
    "Check the Life stage, Session plan and Toilet-break interval rows against the Prompt length in words, then press Copy prompt to take the text from 'Your prompt'.",
  ],
  intro:
    "Pet Care Prompt Builder converts your dog's or cat's species, age, weight and daily time budget into a ready-to-paste AI prompt that already states the correct life stage, session length and toilet-break interval. Life stages follow the published AAHA canine and AAFP/AAHA feline life-stage frameworks, and the puppy break interval uses the standard age-in-months plus one hour guideline. It suits owners who keep getting generic advice because the assistant does not know whether it is talking about a ten-week puppy or a nine-year-old cat.",
  useCases: [
    "House-training a 10-week puppy where the prompt must build the day around roughly three-hourly toilet breaks.",
    "Turning 20 free minutes a day into four five-minute reward-based sessions instead of one long drill a puppy cannot sit through.",
    "Asking for a senior-cat routine that focuses on litter access and warmth rather than kitten socialisation.",
    "Briefing an assistant on one specific problem behaviour with household context, so it separates immediate management from long-term training.",
  ],
  benefits: [
    ["Life stage baked in", "Age is normalised to months and mapped to a named life stage before the prompt is written."],
    ["Realistic session maths", "Your daily minutes are split into age-appropriate sessions instead of one unrealistic block."],
    ["Reward-based by default", "Every generated prompt rules out aversive tools, punishment and dominance framing."],
  ],
  faqs: [
    [
      "How long should a puppy training session be?",
      "Keep sessions to about five minutes for animals under six months, ten minutes from six to twelve months, and around fifteen minutes for adults, repeated two to four times a day. Short repeated sessions beat one long one because young animals lose focus quickly, so a 20-minute daily budget becomes four five-minute blocks rather than one 20-minute drill.",
    ],
    [
      "How often does a puppy need a toilet break?",
      "A common guideline is age in months plus one hour, so a three-month puppy manages roughly four hours and a four-month puppy roughly five. No dog should routinely go beyond about eight hours, and overnight capacity is usually longer than daytime capacity because the puppy is asleep and not drinking.",
    ],
    [
      "When is a cat considered senior?",
      "Under the AAFP and AAHA feline life-stage guidelines a cat is a kitten to one year, a young adult from one to six years, a mature adult from seven to ten years, and senior from ten years onward. Care priorities shift at those points: play style for young adults, weight management for mature adults, and mobility, litter access and warmth for seniors.",
    ],
    [
      "Can this replace a vet or a professional trainer?",
      "No. The tool builds a prompt and a schedule, and every prompt it writes tells the assistant to flag veterinary and behaviourist questions rather than guess. Sudden behaviour change, aggression, house-soiling in a previously trained animal, or any sign of pain should go to a veterinarian first, because they are frequently medical rather than behavioural.",
    ],
  ],
};

export default seo;
