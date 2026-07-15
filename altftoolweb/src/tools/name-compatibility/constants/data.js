export const zodiacCompatibility = {
  Aries: { best: ["Leo", "Sagittarius", "Gemini"], good: ["Aquarius", "Libra"], avoid: ["Cancer", "Capricorn"] },
  Taurus: { best: ["Virgo", "Capricorn", "Cancer"], good: ["Pisces", "Scorpio"], avoid: ["Leo", "Aquarius"] },
  Gemini: { best: ["Libra", "Aquarius", "Aries"], good: ["Leo", "Sagittarius"], avoid: ["Virgo", "Pisces"] },
  Cancer: { best: ["Scorpio", "Pisces", "Taurus"], good: ["Virgo", "Capricorn"], avoid: ["Aries", "Libra"] },
  Leo: { best: ["Aries", "Sagittarius", "Gemini"], good: ["Libra", "Aquarius"], avoid: ["Taurus", "Scorpio"] },
  Virgo: { best: ["Taurus", "Capricorn", "Cancer"], good: ["Scorpio", "Pisces"], avoid: ["Gemini", "Sagittarius"] },
  Libra: { best: ["Gemini", "Aquarius", "Leo"], good: ["Sagittarius", "Aries"], avoid: ["Cancer", "Capricorn"] },
  Scorpio: { best: ["Cancer", "Pisces", "Virgo"], good: ["Capricorn", "Taurus"], avoid: ["Leo", "Aquarius"] },
  Sagittarius: { best: ["Aries", "Leo", "Aquarius"], good: ["Gemini", "Libra"], avoid: ["Virgo", "Pisces"] },
  Capricorn: { best: ["Taurus", "Virgo", "Scorpio"], good: ["Pisces", "Cancer"], avoid: ["Aries", "Libra"] },
  Aquarius: { best: ["Gemini", "Libra", "Sagittarius"], good: ["Aries", "Leo"], avoid: ["Taurus", "Scorpio"] },
  Pisces: { best: ["Cancer", "Scorpio", "Taurus"], good: ["Capricorn", "Virgo"], avoid: ["Gemini", "Sagittarius"] },
};

export const numerologyMeanings = {
  1: { trait: "Independent Leader", description: "Strong-willed, ambitious, and natural-born leaders. They inspire others with their confidence." },
  2: { trait: "Sensitive Peacemaker", description: "Diplomatic, intuitive, and cooperative. They bring harmony and balance to relationships." },
  3: { trait: "Creative Expressive", description: "Artistic, charming, and communicative. They light up any room with their creativity." },
  4: { trait: "Stable Builder", description: "Practical, reliable, and hardworking. They create strong foundations in life." },
  5: { trait: "Adventurous Free Spirit", description: "Versatile, curious, and freedom-loving. They bring excitement and change." },
  6: { trait: "Nurturing Harmonizer", description: "Caring, responsible, and family-oriented. They create warmth and comfort." },
  7: { trait: "Analytical Thinker", description: "Introspective, wise, and spiritual. They seek truth and deeper meaning." },
  8: { trait: "Ambitious Achiever", description: "Authoritative, successful, and materialistic. They manifest abundance." },
  9: { trait: "Compassionate Humanitarian", description: "Generous, idealistic, and empathetic. They make the world a better place." },
  11: { trait: "Intuitive Visionary", description: "Spiritual, inspiring, and gifted. They carry heightened awareness and intuition." },
  22: { trait: "Master Builder", description: "Visionary, powerful, and disciplined. They turn grand dreams into reality." },
  33: { trait: "Master Teacher", description: "Compassionate, uplifting, and selfless. They guide humanity with love." },
};

export const relationshipTypes = [
  {
    id: "love",
    label: "Love Compatibility",
    icon: "Heart",
    description: "Romantic relationship potential",
    color: "text-rose-500",
  },
  {
    id: "friendship",
    label: "Friendship Compatibility",
    icon: "Users",
    description: "Best friends or casual friends",
    color: "text-blue-500",
  },
  {
    id: "soulmate",
    label: "Soulmate Connection",
    icon: "Sparkles",
    description: "Deep spiritual bond",
    color: "text-purple-500",
  },
  {
    id: "business",
    label: "Business Compatibility",
    icon: "Briefcase",
    description: "Professional partnership potential",
    color: "text-emerald-500",
  },
];

export const compatibilityMessages = {
  excellent: [
    "Your names vibrate at an incredibly harmonious frequency!",
    "The universe conspired to bring these two names together!",
    "This is a once-in-a-lifetime cosmic connection!",
    "Stars are aligned for an extraordinary bond!",
  ],
  veryGood: [
    "There's a powerful magnetic pull between these names!",
    "A beautiful symphony of energies awaits!",
    "These names create a wonderful harmony!",
    "The celestial connection is strong and promising!",
  ],
  good: [
    "A solid and promising connection with room to grow!",
    "These names have natural chemistry!",
    "A warm and supportive bond is forming!",
    "There's genuine potential for a meaningful connection!",
  ],
  average: [
    "An interesting mix with unique dynamics!",
    "These names create an intriguing balance!",
    "There's potential here with some effort!",
    "A connection that can blossom with understanding!",
  ],
  challenging: [
    "This pairing faces some challenges, but growth is possible!",
    "An opposites-attract dynamic with lessons to learn!",
    "These names create tension, but also passion!",
    "With effort, this can become a transformative bond!",
  ],
};

export const nameQualities = {
  vowel: ["A", "E", "I", "O", "U"],
  consonants: "BCDFGHJKLMNPQRSTVWXYZ",
};
