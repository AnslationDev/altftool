export const KSD_TYPES = [
  { id: 0,  name: "Anant",       house: "1st House",     meaning: "Endless",           rashi: "Mesha (Aries)",        effect: "Health issues, impulsiveness, financial instability" },
  { id: 1,  name: "Kulik",       house: "2nd House",     meaning: "Poisonous",         rashi: "Vrishabha (Taurus)",   effect: "Family disputes, speech problems, money troubles" },
  { id: 2,  name: "Vasuki",      house: "3rd House",     meaning: "Serpent King",      rashi: "Mithuna (Gemini)",     effect: "Relationship with siblings, courage, communication" },
  { id: 3,  name: "Shankhpal",   house: "4th House",     meaning: "Conch Protector",   rashi: "Karka (Cancer)",       effect: "Property issues, maternal concerns, peace of mind" },
  { id: 4,  name: "Padmak",      house: "5th House",     meaning: "Lotus",             rashi: "Simha (Leo)",          effect: "Creativity blocked, education delays, children" },
  { id: 5,  name: "Mahapadmak",  house: "6th House",     meaning: "Great Lotus",       rashi: "Kanya (Virgo)",        effect: "Debt, diseases, enemies, legal challenges" },
  { id: 6,  name: "Takshak",     house: "7th House",     meaning: "Woodcutter",        rashi: "Tula (Libra)",         effect: "Marital problems, business partnership issues" },
  { id: 7,  name: "Karkotak",    house: "8th House",     meaning: "Crab",              rashi: "Vrishchika (Scorpio)", effect: "Longevity concerns, inheritance, occult" },
  { id: 8,  name: "Shankhchood", house: "9th House",     meaning: "Conch Bangle",      rashi: "Dhanu (Sagittarius)",  effect: "Luck, father relationship, spiritual growth" },
  { id: 9,  name: "Ghatak",      house: "10th House",    meaning: "Deadly",            rashi: "Makara (Capricorn)",   effect: "Career obstacles, social status, authority" },
  { id: 10, name: "Vishdhar",    house: "11th House",    meaning: "Poison Bearer",     rashi: "Kumbha (Aquarius)",    effect: "Income problems, unfulfilled desires" },
  { id: 11, name: "Sheshnag",    house: "12th House",    meaning: "Celestial Serpent", rashi: "Meena (Pisces)",       effect: "Expenses, foreign travel, isolation" },
];

export const PLANET_NAMES = {
  sun: "Sun (Surya)", moon: "Moon (Chandra)", mars: "Mars (Mangal)",
  mercury: "Mercury (Budha)", venus: "Venus (Shukra)",
  jupiter: "Jupiter (Guru)", saturn: "Saturn (Shani)",
  rahu: "Rahu", ketu: "Ketu",
};

export const PLANET_COLORS = {
  sun: { bg: "bg-orange-500/10", text: "text-orange-600", dot: "bg-orange-500" },
  moon: { bg: "bg-blue-500/10", text: "text-blue-600", dot: "bg-blue-500" },
  mars: { bg: "bg-red-500/10", text: "text-red-600", dot: "bg-red-500" },
  mercury: { bg: "bg-green-500/10", text: "text-green-600", dot: "bg-green-500" },
  venus: { bg: "bg-pink-500/10", text: "text-pink-600", dot: "bg-pink-500" },
  jupiter: { bg: "bg-yellow-500/10", text: "text-yellow-600", dot: "bg-yellow-500" },
  saturn: { bg: "bg-gray-500/10", text: "text-gray-600", dot: "bg-gray-500" },
  rahu: { bg: "bg-purple-500/10", text: "text-purple-600", dot: "bg-purple-500" },
  ketu: { bg: "bg-violet-500/10", text: "text-violet-600", dot: "bg-violet-500" },
};

export const RASHI_NAMES = [
  "Mesha", "Vrishabha", "Mithuna", "Karka",
  "Simha", "Kanya", "Tula", "Vrishchika",
  "Dhanu", "Makara", "Kumbha", "Meena",
];

export const REMEDIES = [
  { title: "Snake God Worship (Nag Puja)", desc: "Offer milk, turmeric, and flowers at a snake temple or ant hill on Nag Panchami." },
  { title: "Rahu-Ketu Mantras", desc: "Chant 'Om Rahave Namah' 108 times daily and 'Om Ketave Namah' 108 times, especially during Rahu Kaal." },
  { title: "Kaal Sarp Shanti Puja", desc: "Perform a specialized Kaal Sarp Shanti havan at a sacred river bank (Trimbakeshwar, Nashik is most recommended)." },
  { title: "Abhishekam", desc: "Perform Rudra Abhishekam on Mondays to Lord Shiva, who is associated with serpent energy." },
  { title: "Donations", desc: "Donate black items (black sesame seeds, black cloth, iron objects) on Saturdays to pacify Rahu-Ketu." },
  { title: "Wear Snake Stone", desc: "Wear a Gomedh (Hessonite) and/or a Cat's Eye (Lehsunia) gemstone after consulting an astrologer." },
  { title: "Fasting", desc: "Fast on Saturdays (for Rahu) and Tuesdays (for Ketu) — consume only one meal without salt." },
  { title: "Charity", desc: "Feed snakes (or their representations) with milk on Saturdays. Also feed birds and animals." },
];
