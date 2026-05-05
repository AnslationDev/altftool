// The default TLDs (fallback)
const DEFAULT_TLDS = [
  ".com",
  ".net",
  ".io",
  ".in",
  ".org",
  ".app",
  ".tech",
  ".blog",
  ".cloud",
  ".space",
  ".co.in",
  ".fun",
  ".co",
  ".info",
  ".ai",
];

export const fetchWordSuggestions = async (query, filters = {}) => {
  if (!query.trim()) return [];

  const keyword = query
    .trim()
    .toLowerCase()
    .split(/\s+/)[0]
    .replace(/[^a-z0-9]/g, "");

  const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${keyword}`;

  let suggestedWords = new Set([keyword]);
  let domainSuggestions = [];

  // ✅ Apply TLD filter
  const TLD_EXTENSIONS =
    filters?.tlds && filters.tlds.length > 0 && filters.tlds[0] !== ""
      ? filters.tlds.map((t) => (t.startsWith(".") ? t : `.${t}`))
      : DEFAULT_TLDS;

  try {
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();

      if (Array.isArray(data) && data.length > 0) {
        data.forEach((entry) => {
          entry.meanings?.forEach((meaning) => {
            meaning.definitions?.forEach((def) => {
              def.synonyms?.forEach((syn) =>
                suggestedWords.add(
                  syn.toLowerCase().replace(/[^a-z0-9]/g, "")
                )
              );
            });
          });
        });
      }
    }
  } catch (error) {
    console.warn("Words API failed, fallback to keyword only.", error);
  }

  // --- CATEGORY TEMPLATE POOL ---
  const CATEGORY_POOL = [
    "tech",
    "startup",
    "ai",
    "brandable",
    "seo",
  ];

  // Helper: assign random category
  const getRandomCategory = () => {
    return CATEGORY_POOL[
      Math.floor(Math.random() * CATEGORY_POOL.length)
    ];
  };

  // Helper: normalize domain object
  const createDomainObject = (fullDomain) => {
    const parts = fullDomain.split(".");
    return {
      name: fullDomain,
      domain: fullDomain,
      tld: parts.slice(1).join("."),
      category: getRandomCategory(), // 🔥 RANDOM CATEGORY
      status: "suggestion",
    };
  };

  // --- CATEGORY FILTER LOGIC (for generation only) ---
  const categoryPrefixMap = {
    startup: ["get", "try", "build", "launch"],
    tech: ["tech", "dev", "code", "stack"],
    ai: ["ai", "ml", "bot", "neural"],
    brandable: ["ly", "io", "ify"],
    seo: ["best", "top", "pro"],
    short: [],
    all: [],
  };

  const categoryWords =
    categoryPrefixMap[filters?.category] || [];

  // --- DOMAIN GENERATION ---

  // Base keyword
  TLD_EXTENSIONS.forEach((ext) => {
    domainSuggestions.push(createDomainObject(`${keyword}${ext}`));
  });

  // Synonym combinations
  suggestedWords.forEach((word) => {
    if (word !== keyword && word.length > 2 && word.length < 10) {
      TLD_EXTENSIONS.forEach((ext) => {
        domainSuggestions.push(
          createDomainObject(`${word}${keyword}${ext}`)
        );

        domainSuggestions.push(
          createDomainObject(`${keyword}${word}${ext}`)
        );
      });
    }
  });

  // Category-based additions
  categoryWords.forEach((prefix) => {
    TLD_EXTENSIONS.forEach((ext) => {
      domainSuggestions.push(
        createDomainObject(`${prefix}${keyword}${ext}`)
      );
    });
  });

  // --- LENGTH FILTER ---
  const applyLengthFilter = (domain) => {
    const name = domain.split(".")[0];

    switch (filters?.length) {
      case "short":
        return name.length >= 3 && name.length <= 6;
      case "medium":
        return name.length > 6 && name.length <= 10;
      case "long":
        return name.length > 10;
      default:
        return true;
    }
  };

  // Remove duplicates
  let uniqueDomains = Array.from(
    new Set(domainSuggestions.map((d) => JSON.stringify(d)))
  ).map((s) => JSON.parse(s));

  // Apply length filter
  uniqueDomains = uniqueDomains.filter((d) =>
    applyLengthFilter(d.name)
  );

  return uniqueDomains.slice(0, 20);
};