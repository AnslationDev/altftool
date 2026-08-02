// Pet Insurance — content file for the Insurance module.
//
// Follows the canonical shape defined in home-insurance.js. Plain serialisable
// data only (no imports, no functions). Icon strings must exist in _lib/icons.js.

export const petInsurance = {
  slug: "pet-insurance",
  name: "Pet Insurance",
  accent: "orange",
  icon: "PawPrint",

  eyebrow: "Pet insurance",
  headline: "Say yes to the treatment your pet needs",
  headlineAccent: "your pet needs",
  subheadline:
    "Pet insurance helps cover unexpected vet bills for your dog or cat, so a sudden accident or illness doesn't come down to what you can afford. Compare plans and pick the coverage that fits your budget.",
  heroPoints: [
    "Help cover accidents, illnesses and surgeries",
    "Keep your own vet — most plans let you",
    "Compare plans for cats and dogs, no obligation",
  ],
  heroStats: [
    { icon: "Clock", label: "Compare in minutes" },
    { icon: "PawPrint", label: "Dogs and cats" },
    { icon: "Wallet", label: "Free to compare" },
  ],

  quoteLabel: "Compare plans",
  quoteUrl: "https://example.com/quote/pet-insurance",

  coverageTitle: "What pet insurance can cover",
  coverageIntro:
    "Most plans reimburse a share of eligible vet bills after your deductible. Here's what a typical accident-and-illness plan often includes.",
  coverage: [
    {
      icon: "Ambulance",
      title: "Accidents and injuries",
      description:
        "Helps with vet bills from mishaps like broken bones, swallowed objects, cuts and other sudden accidental injuries.",
    },
    {
      icon: "HeartPulse",
      title: "Illnesses",
      description:
        "Covers eligible treatment for illnesses such as infections, allergies, cancer and chronic conditions that develop after enrolment.",
    },
    {
      icon: "Cross",
      title: "Surgery and hospitalization",
      description:
        "Contributes toward operations, anesthesia and overnight stays when your pet needs more serious, hands-on care.",
    },
    {
      icon: "Activity",
      title: "Diagnostics and tests",
      description:
        "Helps pay for X-rays, ultrasounds, MRIs and bloodwork used to find out what's actually wrong with your pet.",
    },
    {
      icon: "Pill",
      title: "Prescription medications",
      description:
        "Covers eligible medicines your vet prescribes to treat a covered accident or illness, not just the visit itself.",
    },
    {
      icon: "Sparkles",
      title: "Optional wellness add-ons",
      description:
        "Some insurers offer routine-care extras for things like vaccines, dental cleanings and annual check-ups, for an added cost.",
    },
  ],

  benefitsTitle: "Why compare pet insurance here",
  benefits: [
    {
      icon: "HandHeart",
      title: "Focus on care, not cost",
      description:
        "When a big bill lands, coverage helps you weigh what's best for your pet rather than what fits your bank balance.",
    },
    {
      icon: "Stethoscope",
      title: "Keep your own vet",
      description:
        "Most pet plans let you visit any licensed vet, and many cover emergency and specialist clinics too.",
    },
    {
      icon: "Scale",
      title: "Build a plan that fits",
      description:
        "Adjust your reimbursement level, deductible and annual limit to balance monthly cost against out-of-pocket bills.",
    },
    {
      icon: "PawPrint",
      title: "Cats and dogs welcome",
      description:
        "Compare options for dogs and cats across many ages and breeds, from a new puppy to a senior companion.",
    },
  ],

  processTitle: "From quote to covered in four steps",
  process: [
    {
      title: "Tell us about your pet",
      description:
        "Share a few basics — whether it's a cat or dog, plus breed and age — to see relevant plans in a minute.",
    },
    {
      title: "Compare plans",
      description:
        "Line up options from different insurers side by side, with what's covered and what's excluded laid out clearly.",
    },
    {
      title: "Choose your coverage",
      description:
        "Pick your reimbursement percentage, deductible and annual limit to shape both your monthly cost and payouts.",
    },
    {
      title: "Enrol your pet",
      description:
        "Sign up with the insurer, then note the waiting period — coverage usually starts a few days after you enrol.",
    },
  ],

  factorsTitle: "What affects your pet insurance premium",
  factorsIntro:
    "Every quote is personalised to your pet. These are the factors insurers typically weigh most when pricing a plan.",
  factors: [
    {
      factor: "Species and breed",
      detail:
        "Dogs often cost more to insure than cats, and breeds prone to hereditary or chronic conditions can raise the premium.",
    },
    {
      factor: "Your pet's age",
      detail:
        "Premiums usually rise as pets get older, since the odds of illness increase. Enrolling while young often locks in a lower starting rate.",
    },
    {
      factor: "Where you live",
      detail:
        "Local vet costs vary a lot by area, so your ZIP or region influences what the same treatment is expected to cost.",
    },
    {
      factor: "Reimbursement level",
      detail:
        "Choosing a higher reimbursement percentage means the insurer pays back more per claim, which raises your monthly premium.",
    },
    {
      factor: "Deductible and annual limit",
      detail:
        "A higher deductible or lower annual limit typically lowers the premium, but shifts more of each bill onto you.",
    },
  ],

  faqs: [
    {
      q: "What does pet insurance cover?",
      a: "Most accident-and-illness plans help pay for eligible vet bills from injuries, illnesses, surgeries, diagnostics and prescribed medications. Routine or wellness care is usually an optional add-on, and every policy lists its own exclusions.",
    },
    {
      q: "Does it cover pre-existing conditions?",
      a: "Generally no. Conditions your pet showed signs of before coverage started, or during the waiting period, are typically excluded. This is why enrolling while a pet is young and healthy can matter.",
    },
    {
      q: "How does reimbursement work?",
      a: "With most plans you pay the vet directly, then submit the bill to your insurer. They reimburse a percentage of the eligible amount after your deductible, based on the plan you chose.",
    },
    {
      q: "Can I use my own vet?",
      a: "Usually, yes. Most pet insurers let you visit any licensed veterinarian, including emergency and specialist clinics, rather than tying you to a set network.",
    },
    {
      q: "Is there a waiting period?",
      a: "Yes. Coverage doesn't start the moment you enrol — waiting periods are often a few days for accidents and longer for illnesses. Check each policy for the exact timing.",
    },
    {
      q: "Is pet insurance worth it?",
      a: "It depends on your pet and budget, but it tends to help most with large, unexpected bills from a serious accident or illness. It can make an expensive treatment decision far less stressful.",
    },
  ],

  ctaTitle: "Compare pet insurance plans",
  ctaText:
    "See plans for your cat or dog side by side and pick the coverage that fits — free to compare, with no obligation to enrol.",
  fineprint:
    "AltFTool is not an insurance company or agency and does not sell insurance. Plans, coverage, eligibility and pricing are set by the insurer and vary by state and circumstances, including your pet's age, breed and health. Pre-existing conditions and waiting periods apply; read each policy for exact terms.",

  images: {
    hero: { src: "https://images.unsplash.com/photo-1450778869180-41d0601e046e", alt: "" },
    benefit: {
      src: "https://images.unsplash.com/photo-1770836037289-e00e5f351d11",
      alt: "A veterinarian examining a dog during a checkup",
    },
    detail: {
      src: "https://images.unsplash.com/photo-1522276498395-f4f68f7f8454",
      alt: "A pet owner hugging their dog",
    },
  },

  seo: {
    title: "Pet Insurance — Compare Dog & Cat Plans | AltFTool",
    description:
      "Compare pet insurance plans for dogs and cats in minutes. Help cover accidents, illnesses, surgery and vet bills while keeping your own vet.",
  },
};

export default petInsurance;
