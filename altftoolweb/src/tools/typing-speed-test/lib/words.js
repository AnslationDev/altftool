// ~300 common English words used to build the random word stream.
const WORDS = [
  "the", "be", "of", "and", "a", "to", "in", "he", "have", "it",
  "that", "for", "they", "with", "as", "not", "on", "she", "at", "by",
  "this", "we", "you", "do", "but", "from", "or", "which", "one", "would",
  "all", "will", "there", "say", "who", "make", "when", "can", "more", "if",
  "no", "man", "out", "other", "so", "what", "time", "up", "go", "about",
  "than", "into", "could", "state", "only", "new", "year", "some", "take", "come",
  "these", "know", "see", "use", "get", "like", "then", "first", "any", "work",
  "now", "may", "such", "give", "over", "think", "most", "even", "find", "day",
  "also", "after", "way", "many", "must", "look", "before", "great", "back", "through",
  "long", "where", "much", "should", "well", "people", "down", "own", "just", "because",
  "good", "each", "those", "feel", "seem", "how", "high", "too", "place", "little",
  "world", "very", "still", "nation", "hand", "old", "life", "tell", "write", "become",
  "here", "show", "house", "both", "between", "need", "mean", "call", "develop", "under",
  "last", "right", "move", "thing", "general", "school", "never", "same", "another", "begin",
  "while", "number", "part", "turn", "real", "leave", "might", "want", "point", "form",
  "off", "child", "few", "small", "since", "against", "ask", "late", "home", "interest",
  "large", "person", "end", "open", "public", "follow", "during", "present", "without", "again",
  "hold", "govern", "around", "possible", "head", "consider", "word", "program", "problem", "however",
  "lead", "system", "set", "order", "eye", "plan", "run", "keep", "face", "fact",
  "group", "play", "stand", "increase", "early", "course", "change", "help", "line", "city",
  "put", "close", "case", "force", "meet", "once", "water", "upon", "war", "build",
  "hear", "light", "voice", "live", "every", "country", "bring", "center", "let", "side",
  "try", "provide", "continue", "name", "certain", "power", "pay", "result", "question", "study",
  "woman", "member", "until", "far", "night", "always", "service", "away", "report", "something",
  "company", "week", "church", "toward", "start", "social", "room", "figure", "kind", "often",
  "young", "national", "wear", "story", "mother", "book", "earth", "father", "hour", "better",
  "friend", "idea", "food", "body", "music", "market", "effect", "second", "street", "class",
  "color", "art", "care", "process", "whole", "though", "usual", "road", "half", "ten",
  "fish", "happen", "north", "south", "walk", "white", "sea", "morning", "listen", "learn",
  "table", "travel", "less", "month", "love", "animal", "family", "letter", "paper", "river",
];

/**
 * Returns `count` random words from the pool, avoiding immediate repeats so
 * the stream never shows the same word twice in a row.
 */
export function pickWords(count) {
  const picked = [];
  for (let i = 0; i < count; i += 1) {
    let word = WORDS[Math.floor(Math.random() * WORDS.length)];
    while (word === picked[picked.length - 1]) {
      word = WORDS[Math.floor(Math.random() * WORDS.length)];
    }
    picked.push(word);
  }
  return picked;
}

export default WORDS;
