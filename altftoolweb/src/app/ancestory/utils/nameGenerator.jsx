// [file name]: nameGenerator.jsx
import { COUNTRY_MAPPING } from "./constants.jsx";

const NAME_DATABASE = {
  "rahul": { origin: "Indian (Sanskrit)", meaning: "Efficient, capable, conqueror of miseries", variations: ["Rahula", "Rahuesh", "Rahulesh"] },
  "manoj": { origin: "Indian (Sanskrit)", meaning: "Born of the mind, god of love", variations: ["Manuj", "Mano", "Manav"] },
  "seema": { origin: "Indian (Sanskrit)", meaning: "Boundary, limit, precious stone", variations: ["Sima", "Seemala", "Simmi"] },
  "priya": { origin: "Indian (Sanskrit)", meaning: "Beloved, dear one, favorite", variations: ["Priyanka", "Priyala", "Preeti"] },
  "aman": { origin: "Arabic/Indian", meaning: "Peace, comfort, security", variations: ["Amaan", "Amani", "Amand"] },
  "deepak": { origin: "Indian (Sanskrit)", meaning: "Lamp, light, radiator of glow", variations: ["Deep", "Dipak", "Deepan"] },
  "anjali": { origin: "Indian (Sanskrit)", meaning: "Divine offering, tribute", variations: ["Anjalika", "Anju", "Anjali-priya"] },
  "amit": { origin: "Indian (Sanskrit)", meaning: "Infinite, boundless, immeasurable", variations: ["Amith", "Amitesh", "Amrit"] },
  "john": { origin: "Hebrew", meaning: "God is gracious", variations: ["Jonathan", "Johnny", "Ian"] },
  "sarah": { origin: "Hebrew", meaning: "Princess, noblewoman", variations: ["Sara", "Sari", "Sarita"] },
  "mohammad": { origin: "Arabic", meaning: "Praiseworthy, commended", variations: ["Mohammed", "Muhammad", "Mahmud"] },
  "sneha": { origin: "Indian (Sanskrit)", meaning: "Affection, love, friendship", variations: ["Snehal", "Sneh", "Snehi"] },
  "rohit": { origin: "Indian (Sanskrit)", meaning: "Red, first rays of sun", variations: ["Roheet", "Rohith", "Rohan"] },
  "ritik": { origin: "Indian (Sanskrit)", meaning: "Truth, rhythmic, seasonal", variations: ["Ritika", "Ritiesh", "Ritikesh"] },
  "vikas": { origin: "Indian (Sanskrit)", meaning: "Development, progress, expansion", variations: ["Vikash", "Vicky", "Vikram"] },
  "saurabh": { origin: "Indian (Sanskrit)", meaning: "Fragrance, scent, golden", variations: ["Sourabh", "Saurab", "Saurav"] },
};

function getOverride(name) {
  if (!name) return null;
  return NAME_DATABASE[name.toLowerCase()] || null;
}

function hashOf(text) {
  return Array.from((text || "").toLowerCase()).reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
}

// ============================================
// ORIGIN - Multiple sources with fallback
// ============================================
export const getTopOrigin = (data) => {
  if (!data) return "Unknown";

  // 1. BehindTheName origin (most accurate)
  if (data.nameInfo?.origin) return data.nameInfo.origin;

  // 2. Nationality API - top country
  const topCountry = data.nationality?.country?.[0];
  if (topCountry?.country_id) {
    return COUNTRY_MAPPING[topCountry.country_id] || topCountry.country_id;
  }

  return "Unknown";
};

export const getOriginLabel = (name, data) => {
  const override = getOverride(name);
  if (override?.origin) return override.origin;
  return getTopOrigin(data);
};

// ============================================
// MEANING - Multiple sources with fallback
// ============================================
export const getMeaning = (name, data) => {
  const override = getOverride(name);
  if (override?.meaning) return override.meaning;

  if (!data) return "Meaning not available";

  // 1. BehindTheName meaning
  if (data.nameInfo?.meaning && data.nameInfo.meaning.length > 3) {
    return data.nameInfo.meaning;
  }

  // 2. Wikipedia first sentence
  if (data.nameInfo?.description && data.nameInfo.description.includes("means")) {
    const match = data.nameInfo.description.match(/means\s+"([^"]+)"/i);
    if (match) return match[1];
  }

  // 3. Generate from origin + gender
  const origin = getOriginLabel(name, data);
  const gender = data.gender?.gender;

  if (origin === "Indian" || origin === "Sanskrit" || origin === "Hindi") {
    if (gender === "male") return "Strength, wisdom, and divine blessing";
    if (gender === "female") return "Grace, beauty, and prosperity";
    return "Blessed and auspicious";
  }

  if (origin === "Japanese") {
    if (gender === "male") return "Noble, prosperous, and harmonious";
    if (gender === "female") return "Beautiful, elegant, and pure";
    return "Harmony and peace";
  }

  if (origin === "American" || origin === "British" || origin === "English") {
    if (gender === "male") return "Strong, noble, and courageous";
    if (gender === "female") return "Pure, graceful, and beloved";
    return "Noble and dignified";
  }

  if (gender === "male") return "Strength and leadership";
  if (gender === "female") return "Grace and beauty";

  return "A name with rich cultural heritage";
};

// ============================================
// VARIATIONS - Generate from name patterns
// ============================================
export const getVariations = (name, data) => {
  if (!name) return [];

  const override = getOverride(name);
  if (override?.variations?.length) return override.variations.slice(0, 4);

  // Use API variations if available
  if (Array.isArray(data?.nameInfo?.variations) && data.nameInfo.variations.length > 0) {
    return data.nameInfo.variations
      .map((v) => String(v || "").trim())
      .filter(Boolean)
      .slice(0, 4);
  }

  // Generate variations from name patterns
  const n = name.toLowerCase();
  const variations = new Set();

  // Add the original name
  variations.add(name);

  // Common Indian name patterns
  if (n.endsWith('un')) {
    variations.add(name + 'a');
    variations.add(name.slice(0, -2) + 'an');
    variations.add(name.slice(0, -1) + 'esh');
  } else if (n.endsWith('ar')) {
    variations.add(name + 'a');
    variations.add(name.slice(0, -2) + 'esh');
    variations.add(name + 'i');
  } else if (n.endsWith('a')) {
    variations.add(name.slice(0, -1));
    variations.add(name + 'h');
    variations.add(name.slice(0, -1) + 'esh');
  } else if (n.endsWith('i')) {
    variations.add(name.slice(0, -1));
    variations.add(name + 'a');
    variations.add(name + 'ka');
  } else if (n.endsWith('u')) {
    variations.add(name + 'a');
    variations.add(name.slice(0, -1) + 'i');
    variations.add(name + 'kumar');
  }

  // Common suffixes
  if (!n.endsWith('a')) variations.add(name + 'a');
  if (!n.endsWith('esh')) variations.add(name.slice(0, -1) + 'esh');
  if (!n.endsWith('esh')) variations.add(name + 'esh');

  // Add common variations
  variations.add(name + 'ji');

  // Filter to max 4 unique variations
  return Array.from(variations)
    .filter(v => v !== name)
    .slice(0, 3);
};

// ============================================
// DESCRIPTION - 8+ paragraphs
// ============================================
export const getDescription = (name, data) => {
  const override = getOverride(name);
  if (override?.description) return override.description;

  if (!data) return "No description available.";

  if (data.nameInfo?.description && data.nameInfo.description.length > 200) {
    return data.nameInfo.description;
  }

  if (data.nameInfo?.etymology && data.nameInfo.etymology.length > 100) {
    return data.nameInfo.etymology;
  }

  const origin = data.nameInfo?.origin || getOriginLabel(name, data) || "various";
  const meaning = data.nameInfo?.meaning || getMeaning(name, data) || null;
  const gender = data.gender?.gender || "unisex";
  const age = data.age?.age || null;
  const peakYear = age ? 2024 - age : null;
  const countries = data.nationality?.country || [];
  const sources = data.nameInfo?.sources || [];
  const confidence = data.quality?.confidence || "medium";

  const countryNames = {
    IN: "India", US: "the United States", GB: "the United Kingdom",
    NG: "Nigeria", AE: "the UAE", TZ: "Tanzania", KE: "Kenya",
    DE: "Germany", FR: "France", IT: "Italy", ES: "Spain",
    JP: "Japan", CN: "China", KR: "South Korea", RU: "Russia",
    BR: "Brazil", MX: "Mexico", CA: "Canada", AU: "Australia"
  };

  let desc = "";

  desc += `${name} is a distinctive and meaningful ${gender} name`;
  if (origin !== "various" && origin !== "Unknown") {
    desc += ` with roots in ${origin} tradition`;
  }
  desc += `. `;

  if (meaning && meaning.length > 3 && !meaning.includes("not found")) {
    desc += `The name carries the beautiful meaning of "${meaning}", reflecting qualities that parents have valued across generations. `;
  }

  desc += `\n\n`;
  desc += `Names like ${name} serve as powerful markers of cultural identity and family heritage. Throughout history, given names have been carefully chosen to honor ancestors, express religious devotion, or capture aspirations that parents hold for their children. The tradition of naming carries deep significance across all cultures, connecting each new generation to those who came before. `;

  if (countries.length > 0) {
    desc += `\n\n`;
    desc += `Geographic distribution data reveals that ${name} is most commonly found in `;

    const topThree = countries.slice(0, 3);
    const countryList = topThree.map(c => {
      const cName = countryNames[c.country_id] || c.country_id;
      const prob = Math.round((c.probability || 0) * 100);
      return `${cName} (${prob}%)`;
    });

    desc += countryList.join(', ');

    if (countries.length > 3) {
      desc += `, with additional presence in other regions`;
    }
    desc += `. `;

    desc += `This distribution pattern reflects historical migration trends and the spread of cultural traditions across borders. As families moved and communities grew, names like ${name} traveled with them, adapting to new languages while preserving their essential character. `;
  }

  if (age) {
    desc += `\n\n`;
    desc += `Statistical analysis of name records indicates that the average age of individuals named ${name} is approximately ${age} years, suggesting that the name experienced peak popularity around ${peakYear}. `;

    if (age > 60) {
      desc += `This places ${name} in a mid-20th century context, connecting it to the cultural and historical moments of that transformative era. Names from this period often reflect traditional values and family continuity. `;
    } else if (age > 30) {
      desc += `This suggests ${name} gained popularity during the late 20th century, a time of increasing cultural exchange and global awareness. The name bridges traditional roots with contemporary usage. `;
    } else {
      desc += `This indicates ${name} is a more contemporary choice, reflecting modern naming trends while maintaining cultural connections. `;
    }
  }

  desc += `\n\n`;
  desc += `Like all names, ${name} has evolved through time, with variations in spelling and pronunciation emerging across different regions and languages. These variations, while distinct, share a common heritage and contribute to the rich tapestry of naming traditions worldwide. The way a name is spelled or pronounced can reveal fascinating insights about migration patterns, linguistic influences, and cultural adaptation. `;

  desc += `\n\n`;
  desc += `For individuals named ${name}, this name represents more than just a label — it is an integral part of their personal identity and story. A name accompanies a person throughout their life journey, from childhood through adulthood, shaping first impressions and carrying personal history. Many people feel a deep connection to their name, viewing it as a link to their family's past and a gift that will continue into the future. `;

  desc += `\n\n`;
  desc += `In today's interconnected world, names like ${name} continue to be chosen by parents who value their sound, meaning, or cultural significance. Modern naming practices have become increasingly diverse, with parents drawing inspiration from multiple cultures and traditions. Despite changing trends, classic names with deep roots and meaningful origins maintain their appeal across generations. `;

  desc += `\n\n`;
  if (sources.length > 0) {
    desc += `This information has been compiled from ${sources.length} trusted source${sources.length > 1 ? 's' : ''} including ${sources.slice(0, 3).join(', ')}. `;
  }

  if (confidence === "high") {
    desc += `The data confidence level is high, indicating strong corroboration across multiple authoritative sources. `;
  } else if (confidence === "medium") {
    desc += `While the available data provides meaningful insights, consulting additional genealogical and linguistic resources may reveal further details about the name's history. `;
  }

  desc += `For the most comprehensive understanding of ${name}'s origins and cultural significance, historical name dictionaries, academic linguistic studies, and genealogical records provide valuable additional context.`;

  return desc.trim();
};

// ============================================
// OTHER FUNCTIONS
// ============================================
export const getCommonSurname = (name, data) => {
  const topCountry = data?.nationality?.country?.[0]?.country_id;
  const countrySurnames = {
    IN: ["Sharma", "Singh", "Patel", "Kumar", "Gupta"],
    US: ["Smith", "Johnson", "Williams", "Brown", "Jones"],
    GB: ["Smith", "Jones", "Taylor", "Brown", "Wilson"],
    DE: ["Mueller", "Schmidt", "Fischer", "Weber", "Meyer"],
    FR: ["Martin", "Bernard", "Thomas", "Dubois", "Robert"],
    IT: ["Rossi", "Russo", "Ferrari", "Bianchi", "Romano"],
    ES: ["Garcia", "Fernandez", "Lopez", "Martinez", "Sanchez"],
    JP: ["Sato", "Suzuki", "Takahashi", "Tanaka", "Watanabe"],
    CN: ["Wang", "Li", "Zhang", "Liu", "Chen"],
  };
  const list = countrySurnames[topCountry] || ["Smith", "Khan", "Garcia", "Kumar", "Lee"];
  return list[hashOf(name) % list.length];
};

export const getPartnerName = (name, data) => {
  const gender = data?.gender?.gender;
  const femaleNames = ["Aarohi", "Priya", "Ananya", "Sara", "Meera", "Riya"];
  const maleNames = ["Arjun", "Rahul", "Aman", "Rohan", "Dev", "Karan"];
  const neutralNames = ["Alex", "Sam", "Jordan", "Avery", "Taylor", "Casey"];
  const list = gender === "male" ? femaleNames : gender === "female" ? maleNames : neutralNames;
  return list[hashOf(name) % list.length];
};

export const getFunFact = (name, data) => {
  if (data.nameInfo?.isLiveData && data.nameInfo?.sources?.length > 0) {
    return `Name data sourced from ${data.nameInfo.sources.join(" and ")}`;
  }
  return `Explore the history of ${name}`;
};

export const getPeakYear = (data) => {
  return data?.age?.age ? 2024 - data.age.age : 1971;
};