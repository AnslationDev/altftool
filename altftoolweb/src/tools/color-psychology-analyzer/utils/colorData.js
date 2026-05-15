export const colorMeanings = [
  {
    name: "Red",
    hueRange: [0, 20],
    emotions: ["Energy", "Passion", "Excitement", "Urgency", "Action"],
    branding: {
      industries: ["Food", "Technology", "Entertainment", "Automotive"],
      personality: "Bold, Youthful, Exciting",
      impact: "Creates a sense of urgency, stimulates appetite.",
      cta: "Very effective for 'Buy Now' buttons."
    },
    culture: [
      { region: "Western", meaning: "Love, danger, action" },
      { region: "Eastern", meaning: "Luck, prosperity, happiness" },
      { region: "Middle East", meaning: "Evil, danger, caution" }
    ]
  },
  {
    name: "Orange",
    hueRange: [21, 50],
    emotions: ["Creativity", "Friendly", "Cheerful", "Confidence", "Warmth"],
    branding: {
      industries: ["E-commerce", "Entertainment", "Beverages", "Kids"],
      personality: "Playful, Friendly, Optimistic",
      impact: "Calls for action without being aggressive like red.",
      cta: "Great for subscribe or join buttons."
    },
    culture: [
      { region: "Western", meaning: "Harvest, autumn, warmth" },
      { region: "Eastern", meaning: "Sacred (Buddhism), courage" },
      { region: "Middle East", meaning: "Mourning, loss" }
    ]
  },
  {
    name: "Yellow",
    hueRange: [51, 80],
    emotions: ["Optimism", "Happiness", "Clarity", "Intellect", "Attention"],
    branding: {
      industries: ["Logistics", "Real Estate", "Education", "Food"],
      personality: "Bright, Creative, Logical",
      impact: "Grabs attention easily, promotes feelings of joy.",
      cta: "Good for highlight areas, use with caution on buttons."
    },
    culture: [
      { region: "Western", meaning: "Joy, hope, cowardice" },
      { region: "Eastern", meaning: "Imperial power, sacredness" },
      { region: "Middle East", meaning: "Happiness, prosperity" }
    ]
  },
  {
    name: "Green",
    hueRange: [81, 170],
    emotions: ["Growth", "Health", "Nature", "Peace", "Stability"],
    branding: {
      industries: ["Wellness", "Finance", "Environment", "Agriculture"],
      personality: "Reliable, Balanced, Fresh",
      impact: "Associated with health and relaxation; easiest for eyes.",
      cta: "Best for 'Confirm' or 'Accept' actions."
    },
    culture: [
      { region: "Western", meaning: "Luck, environment, jealousy" },
      { region: "Eastern", meaning: "New life, fertility, infidelity" },
      { region: "Middle East", meaning: "Sacred, strength, luck" }
    ]
  },
  {
    name: "Blue",
    hueRange: [171, 260],
    emotions: ["Trust", "Calmness", "Professionalism", "Security", "Logic"],
    branding: {
      industries: ["Finance", "SaaS", "Healthcare", "Tech"],
      personality: "Secure, Wise, Trustworthy",
      impact: "Creates a sense of security and trust in a brand.",
      cta: "Solid choice for standard UI actions."
    },
    culture: [
      { region: "Western", meaning: "Trust, authority, sadness" },
      { region: "Eastern", meaning: "Immortality, healing" },
      { region: "Middle East", meaning: "Protection, spirituality" }
    ]
  },
  {
    name: "Purple",
    hueRange: [261, 300],
    emotions: ["Luxury", "Wisdom", "Imagination", "Mystery", "Spirituality"],
    branding: {
      industries: ["Beauty", "Luxury Goods", "Creative Services", "Education"],
      personality: "Mysterious, Creative, High-end",
      impact: "Often used in creative or luxury branding to show quality.",
      cta: "Excellent for premium or 'Upgrade' buttons."
    },
    culture: [
      { region: "Western", meaning: "Royalty, wealth, spirituality" },
      { region: "Eastern", meaning: "Wealth, privilege" },
      { region: "Middle East", meaning: "Wealth, virtue" }
    ]
  },
  {
    name: "Pink",
    hueRange: [301, 330],
    emotions: ["Compassion", "Sweetness", "Playful", "Romance", "Nurturing"],
    branding: {
      industries: ["Beauty", "Sweets", "Kids", "Fashion"],
      personality: "Feminine, Youthful, Caring",
      impact: "Communicates softness and accessibility.",
      cta: "Works well for female-oriented marketing."
    },
    culture: [
      { region: "Western", meaning: "Femininity, love, childhood" },
      { region: "Eastern", meaning: "Marriage, trust" },
      { region: "Middle East", meaning: "Hospitality, kindness" }
    ]
  },
  {
    name: "Magenta/Red-Pink",
    hueRange: [331, 359],
    emotions: ["Boldness", "Innovation", "Harmonious", "Balance", "Self-respect"],
    branding: {
      industries: ["Technology", "Modern Design", "Media", "Fashion"],
      personality: "Innovative, Bold, Artistic",
      impact: "Stands out and shows a brand is forward-thinking.",
      cta: "Highly eye-catching for main interactions."
    },
    culture: [
      { region: "Western", meaning: "Innovation, non-conformity" },
      { region: "Eastern", meaning: "Luck, joy" },
      { region: "Middle East", meaning: "Strength" }
    ]
  }
];

export const grayScaleMeaning = {
  name: "Grayscale",
  emotions: ["Balance", "Neutrality", "Calm", "Formality", "Sophistication"],
  branding: {
    industries: ["Luxury", "Fashion", "Tech", "Photography"],
    personality: "Minimalist, Professional, Timeless",
    impact: "Creates a clean, high-end feel when used with enough contrast.",
    cta: "Best for secondary actions or minimalist designs."
  },
  culture: [
    { region: "Western", meaning: "Formal, sophisticated, mourning" },
    { region: "Eastern", meaning: "Balance, humility, mourning" },
    { region: "Middle East", meaning: "Dignity, wisdom" }
  ]
};
