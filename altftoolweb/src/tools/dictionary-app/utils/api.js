const CACHE_KEY = "word_cache";
const MAX_CACHE = 50;

function getCache() {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(sessionStorage.getItem(CACHE_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveCache(cache) {
  if (typeof window === "undefined") return;
  try {
    const keys = Object.keys(cache);
    if (keys.length > MAX_CACHE) {
      delete cache[keys[0]];
    }
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // sessionStorage full — ignore
  }
}

export const fetchDictionaryData = async (searchWord) => {
  const word = searchWord.toLowerCase().trim();

  // ── Step 1: Cache check karo ──
  const cache = getCache();
  if (cache[word]) {
    console.log(`Cache hit: ${word}`);
    return cache[word];
  }

  // ── Step 2: Online fetch  ──
  const [dictResponse, synResponse, antResponse] = await Promise.all([
    fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`),
    fetch(`https://api.datamuse.com/words?rel_syn=${word}`),
    fetch(`https://api.datamuse.com/words?rel_ant=${word}`),
  ]);

  const dictData = await dictResponse.json();
  const synData = await synResponse.json();
  const antData = await antResponse.json();

  const data = {
    dict: dictData,
    syn: synData,
    ant: antData,
    cachedAt: new Date().toLocaleDateString("en-IN"),
  };

  // ── Step 3: Save in Cache  ──
  cache[word] = data;
  saveCache(cache);

  return data;
};