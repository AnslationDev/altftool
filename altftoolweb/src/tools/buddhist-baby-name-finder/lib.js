/**
 * Buddhist baby name data and pure filtering helpers.
 *
 * Every entry records the literal sense of the Pali, Sanskrit or Tibetan word the
 * name is built from, plus the canonical person or doctrinal term the name points
 * at where one exists (a disciple, a brahmavihara, a paramita, a bodhisattva).
 * Where the same word exists in both Pali and Sanskrit, both spellings are listed
 * separately because families usually pick one tradition's spelling.
 */

/** Source languages represented in the dataset. */
export const ORIGINS = ["Pali", "Sanskrit", "Tibetan"];

/** Gender buckets used in the dataset. "unisex" names are shown under every filter. */
export const GENDERS = ["boy", "girl", "unisex"];

/** Practical floor for a usable given name (two-letter names exist, one-letter ones do not). */
export const MIN_NAME_LENGTH = 2;

/** Practical ceiling; the longest classical name in this dataset is 13 letters. */
export const MAX_NAME_LENGTH = 20;

/** A search box longer than this is almost certainly pasted text, not a name query. */
export const MAX_QUERY_LENGTH = 40;

export const NAMES = [
  // ---- Pali ----
  { name: "Ananda", gender: "boy", origin: "Pali", meaning: "Bliss, joy", note: "The Buddha's cousin and personal attendant for the last 25 years of his life." },
  { name: "Anuruddha", gender: "boy", origin: "Pali", meaning: "Unobstructed, unhindered", note: "The disciple declared foremost in the divine eye." },
  { name: "Ariya", gender: "unisex", origin: "Pali", meaning: "Noble", note: "As in the Ariya Sacca, the Four Noble Truths." },
  { name: "Bhadda", gender: "girl", origin: "Pali", meaning: "Auspicious, fortunate", note: "Borne by several eminent nuns, including Bhadda Kundalakesa." },
  { name: "Bodhi", gender: "unisex", origin: "Pali", meaning: "Awakening, enlightenment", note: "The state realised under the Bodhi tree at Bodh Gaya." },
  { name: "Dhamma", gender: "boy", origin: "Pali", meaning: "The teaching; the way things are", note: "Second of the Three Jewels." },
  { name: "Dhammadinna", gender: "girl", origin: "Pali", meaning: "Given by the Dhamma", note: "The nun the Buddha named foremost among women teachers of the doctrine." },
  { name: "Dipa", gender: "girl", origin: "Pali", meaning: "Lamp; island", note: "From the instruction to be a lamp and an island unto oneself." },
  { name: "Gotama", gender: "boy", origin: "Pali", meaning: "Of the Gotama clan", note: "The Buddha's family name in Pali." },
  { name: "Gotami", gender: "girl", origin: "Pali", meaning: "Woman of the Gotama clan", note: "Mahapajapati Gotami, the Buddha's foster mother and the first ordained nun." },
  { name: "Karuna", gender: "girl", origin: "Pali", meaning: "Compassion", note: "The second of the four brahmaviharas." },
  { name: "Kassapa", gender: "boy", origin: "Pali", meaning: "Of the Kassapa brahmin clan", note: "Mahakassapa convened the First Council after the Buddha's passing." },
  { name: "Khema", gender: "unisex", origin: "Pali", meaning: "Safety, security, peace", note: "Khema was the nun foremost in wisdom." },
  { name: "Mahinda", gender: "boy", origin: "Pali", meaning: "Great Indra", note: "Emperor Ashoka's son, who carried the teaching to Sri Lanka." },
  { name: "Metta", gender: "girl", origin: "Pali", meaning: "Loving-kindness", note: "The first brahmavihara and the subject of the Metta Sutta." },
  { name: "Metteyya", gender: "boy", origin: "Pali", meaning: "The loving one", note: "The Buddha of the future age." },
  { name: "Moggallana", gender: "boy", origin: "Pali", meaning: "Of the Moggallana clan", note: "Chief disciple, foremost in psychic power." },
  { name: "Mudita", gender: "girl", origin: "Pali", meaning: "Sympathetic joy", note: "The third brahmavihara: gladness at another's good fortune." },
  { name: "Nanda", gender: "boy", origin: "Pali", meaning: "Joy, delight", note: "The Buddha's half-brother, who became an arahant." },
  { name: "Panna", gender: "girl", origin: "Pali", meaning: "Wisdom, discernment", note: "The third division of the Noble Eightfold Path training." },
  { name: "Punna", gender: "boy", origin: "Pali", meaning: "Full, complete", note: "Punna Mantaniputta, the disciple foremost as a teacher." },
  { name: "Rahula", gender: "boy", origin: "Pali", meaning: "Fetter, bond", note: "The Buddha's son and the first novice in the Sangha." },
  { name: "Ratana", gender: "unisex", origin: "Pali", meaning: "Jewel, treasure", note: "As in Tiratana, the Three Jewels." },
  { name: "Sacca", gender: "unisex", origin: "Pali", meaning: "Truth", note: "The seventh of the ten paramis." },
  { name: "Saddha", gender: "girl", origin: "Pali", meaning: "Confidence, trust", note: "The first of the five spiritual faculties." },
  { name: "Samadhi", gender: "unisex", origin: "Pali", meaning: "Collectedness, meditative concentration", note: "The second division of the threefold training." },
  { name: "Sangha", gender: "boy", origin: "Pali", meaning: "Community of practitioners", note: "Third of the Three Jewels." },
  { name: "Sanghamitta", gender: "girl", origin: "Pali", meaning: "Friend of the Sangha", note: "Ashoka's daughter, who took a Bodhi tree sapling to Sri Lanka." },
  { name: "Santi", gender: "girl", origin: "Pali", meaning: "Peace, stilling", note: "Used of the stilling of craving." },
  { name: "Sariputta", gender: "boy", origin: "Pali", meaning: "Son of Sari", note: "Chief disciple, foremost in wisdom." },
  { name: "Sati", gender: "girl", origin: "Pali", meaning: "Mindfulness, recollection", note: "The heart of satipatthana practice." },
  { name: "Siddhattha", gender: "boy", origin: "Pali", meaning: "One who has accomplished his aim", note: "The Buddha's given name in Pali." },
  { name: "Sila", gender: "girl", origin: "Pali", meaning: "Virtue, ethical conduct", note: "The first division of the threefold training." },
  { name: "Sona", gender: "unisex", origin: "Pali", meaning: "Gold", note: "Sona Kolivisa received the famous lute-string simile on balanced effort." },
  { name: "Sujata", gender: "girl", origin: "Pali", meaning: "Well-born, of good birth", note: "The village woman whose milk-rice ended the Buddha's extreme fasting." },
  { name: "Sumana", gender: "unisex", origin: "Pali", meaning: "Glad-minded; jasmine", note: "A common name in the early Sangha." },
  { name: "Sumedha", gender: "unisex", origin: "Pali", meaning: "Very wise", note: "The ascetic whose vow set the Buddha-to-be on his path." },
  { name: "Sukha", gender: "unisex", origin: "Pali", meaning: "Ease, happiness", note: "The pleasant feeling cultivated in the jhanas." },
  { name: "Tissa", gender: "boy", origin: "Pali", meaning: "Of the Tissa constellation", note: "One of the most common monastic names in early texts." },
  { name: "Upali", gender: "boy", origin: "Pali", meaning: "One who draws near", note: "The barber who became the disciple foremost in monastic discipline." },
  { name: "Upekkha", gender: "girl", origin: "Pali", meaning: "Equanimity", note: "The fourth brahmavihara." },
  { name: "Uppalavanna", gender: "girl", origin: "Pali", meaning: "Colour of the blue lotus", note: "Chief nun, foremost in psychic power." },
  { name: "Vipassana", gender: "girl", origin: "Pali", meaning: "Clear seeing, insight", note: "Insight into impermanence, unsatisfactoriness and not-self." },
  { name: "Viriya", gender: "boy", origin: "Pali", meaning: "Energy, persistent effort", note: "The fourth parami." },
  { name: "Visakha", gender: "girl", origin: "Pali", meaning: "Of the Visakha constellation", note: "The Buddha's foremost female lay supporter." },

  // ---- Sanskrit ----
  { name: "Amara", gender: "unisex", origin: "Sanskrit", meaning: "Deathless, undying", note: "Echoes amata, the deathless state." },
  { name: "Amitabha", gender: "boy", origin: "Sanskrit", meaning: "Infinite light", note: "The Buddha of the Western Pure Land." },
  { name: "Ananta", gender: "boy", origin: "Sanskrit", meaning: "Endless, boundless" },
  { name: "Arya", gender: "unisex", origin: "Sanskrit", meaning: "Noble", note: "As in the Four Noble Truths and the Noble Eightfold Path." },
  { name: "Asanga", gender: "boy", origin: "Sanskrit", meaning: "Unattached, free of clinging", note: "The master who systematised the Yogachara school." },
  { name: "Avalokita", gender: "boy", origin: "Sanskrit", meaning: "The one who looks down", note: "Short form of Avalokiteshvara, bodhisattva of compassion." },
  { name: "Buddhi", gender: "girl", origin: "Sanskrit", meaning: "Intelligence, discerning mind" },
  { name: "Chandra", gender: "unisex", origin: "Sanskrit", meaning: "Moon", note: "A standing image for a cooled, untroubled mind." },
  { name: "Dharma", gender: "boy", origin: "Sanskrit", meaning: "The teaching; natural law" },
  { name: "Dipankara", gender: "boy", origin: "Sanskrit", meaning: "Lamp-bearer", note: "The Buddha of a past age who predicted Gautama's awakening." },
  { name: "Gautama", gender: "boy", origin: "Sanskrit", meaning: "Of the Gautama clan", note: "The Buddha's family name in Sanskrit." },
  { name: "Jina", gender: "boy", origin: "Sanskrit", meaning: "Conqueror, victor", note: "An epithet of a fully awakened Buddha." },
  { name: "Kalyani", gender: "girl", origin: "Sanskrit", meaning: "Auspicious, beautiful", note: "From kalyana-mitra, the good spiritual friend." },
  { name: "Maitreya", gender: "boy", origin: "Sanskrit", meaning: "The loving one", note: "The Buddha of the coming age." },
  { name: "Maitri", gender: "girl", origin: "Sanskrit", meaning: "Loving-kindness" },
  { name: "Manjushri", gender: "boy", origin: "Sanskrit", meaning: "Gentle glory", note: "The bodhisattva of wisdom, shown with a sword and a text." },
  { name: "Muni", gender: "unisex", origin: "Sanskrit", meaning: "Sage, silent one", note: "As in Shakyamuni, sage of the Shakyas." },
  { name: "Nagarjuna", gender: "boy", origin: "Sanskrit", meaning: "Naga and arjuna tree", note: "Founder of the Madhyamaka school of emptiness." },
  { name: "Nandini", gender: "girl", origin: "Sanskrit", meaning: "Delighting, joyful one" },
  { name: "Padma", gender: "unisex", origin: "Sanskrit", meaning: "Lotus", note: "Rooted in mud, unstained by it: the classic image of awakening." },
  { name: "Prajna", gender: "girl", origin: "Sanskrit", meaning: "Wisdom, insight", note: "The perfection at the centre of the Heart Sutra." },
  { name: "Purna", gender: "boy", origin: "Sanskrit", meaning: "Full, complete" },
  { name: "Ratna", gender: "unisex", origin: "Sanskrit", meaning: "Jewel", note: "As in Triratna, the Three Jewels." },
  { name: "Sadhana", gender: "girl", origin: "Sanskrit", meaning: "Practice, means of accomplishment" },
  { name: "Satya", gender: "unisex", origin: "Sanskrit", meaning: "Truth" },
  { name: "Shanti", gender: "girl", origin: "Sanskrit", meaning: "Peace, tranquillity" },
  { name: "Shantideva", gender: "boy", origin: "Sanskrit", meaning: "God of peace", note: "Author of the Bodhicharyavatara." },
  { name: "Shariputra", gender: "boy", origin: "Sanskrit", meaning: "Son of Sari", note: "Chief disciple, addressed throughout the Heart Sutra." },
  { name: "Shila", gender: "girl", origin: "Sanskrit", meaning: "Virtue, moral conduct" },
  { name: "Shraddha", gender: "girl", origin: "Sanskrit", meaning: "Confidence, faith" },
  { name: "Siddhartha", gender: "boy", origin: "Sanskrit", meaning: "One who has accomplished his aim", note: "The Buddha's given name in Sanskrit." },
  { name: "Smriti", gender: "girl", origin: "Sanskrit", meaning: "Mindfulness, recollection" },
  { name: "Subhuti", gender: "boy", origin: "Sanskrit", meaning: "Good existence, well-being", note: "The disciple the Buddha addresses in the Diamond Sutra." },
  { name: "Sunita", gender: "girl", origin: "Sanskrit", meaning: "Well-conducted, well-led" },
  { name: "Tara", gender: "girl", origin: "Sanskrit", meaning: "Star; she who ferries across", note: "The bodhisattva of swift compassion in Vajrayana." },
  { name: "Upeksha", gender: "girl", origin: "Sanskrit", meaning: "Equanimity" },
  { name: "Vajra", gender: "unisex", origin: "Sanskrit", meaning: "Diamond, thunderbolt", note: "The indestructible, from which Vajrayana takes its name." },
  { name: "Vasubandhu", gender: "boy", origin: "Sanskrit", meaning: "Kinsman of wealth", note: "Yogachara master and brother of Asanga." },
  { name: "Vijaya", gender: "boy", origin: "Sanskrit", meaning: "Victory" },
  { name: "Virya", gender: "boy", origin: "Sanskrit", meaning: "Energy, vigour", note: "The fourth of the six paramitas." },
  { name: "Yasodhara", gender: "girl", origin: "Sanskrit", meaning: "Bearer of glory", note: "Siddhartha's wife, later an eminent nun." },

  // ---- Tibetan ----
  { name: "Chodron", gender: "girl", origin: "Tibetan", meaning: "Lamp of the Dharma" },
  { name: "Choden", gender: "girl", origin: "Tibetan", meaning: "One who holds the Dharma; devout" },
  { name: "Dawa", gender: "unisex", origin: "Tibetan", meaning: "Moon; Monday" },
  { name: "Dechen", gender: "girl", origin: "Tibetan", meaning: "Great bliss" },
  { name: "Dekyi", gender: "girl", origin: "Tibetan", meaning: "Happiness and well-being" },
  { name: "Dolkar", gender: "girl", origin: "Tibetan", meaning: "White Tara" },
  { name: "Dolma", gender: "girl", origin: "Tibetan", meaning: "Tara, the liberator" },
  { name: "Dorje", gender: "boy", origin: "Tibetan", meaning: "Vajra, indestructible" },
  { name: "Gyatso", gender: "boy", origin: "Tibetan", meaning: "Ocean" },
  { name: "Jampa", gender: "boy", origin: "Tibetan", meaning: "Loving-kindness", note: "The Tibetan name of Maitreya." },
  { name: "Jamyang", gender: "boy", origin: "Tibetan", meaning: "Gentle melody", note: "The Tibetan name of Manjushri." },
  { name: "Karma", gender: "unisex", origin: "Tibetan", meaning: "Action and its result" },
  { name: "Kelsang", gender: "unisex", origin: "Tibetan", meaning: "Good fortune, excellent age" },
  { name: "Kunga", gender: "unisex", origin: "Tibetan", meaning: "Joyful to all" },
  { name: "Lhamo", gender: "girl", origin: "Tibetan", meaning: "Goddess" },
  { name: "Lobsang", gender: "boy", origin: "Tibetan", meaning: "Noble-minded, excellent intellect" },
  { name: "Namgyal", gender: "boy", origin: "Tibetan", meaning: "Victorious" },
  { name: "Norbu", gender: "boy", origin: "Tibetan", meaning: "Jewel" },
  { name: "Nyima", gender: "unisex", origin: "Tibetan", meaning: "Sun; Sunday" },
  { name: "Palden", gender: "boy", origin: "Tibetan", meaning: "Glorious, possessing splendour" },
  { name: "Pasang", gender: "unisex", origin: "Tibetan", meaning: "Venus; Friday" },
  { name: "Pema", gender: "girl", origin: "Tibetan", meaning: "Lotus", note: "The Tibetan form of Padma." },
  { name: "Rinchen", gender: "unisex", origin: "Tibetan", meaning: "Precious one, jewel" },
  { name: "Sangye", gender: "boy", origin: "Tibetan", meaning: "Buddha; purified and expanded" },
  { name: "Sonam", gender: "unisex", origin: "Tibetan", meaning: "Merit, good fortune" },
  { name: "Tashi", gender: "unisex", origin: "Tibetan", meaning: "Auspicious, good fortune" },
  { name: "Tenpa", gender: "boy", origin: "Tibetan", meaning: "The doctrine, the teaching" },
  { name: "Tenzin", gender: "unisex", origin: "Tibetan", meaning: "Holder of the teachings" },
  { name: "Thupten", gender: "boy", origin: "Tibetan", meaning: "Teaching of the Buddha" },
  { name: "Tsering", gender: "unisex", origin: "Tibetan", meaning: "Long life" },
  { name: "Wangchuk", gender: "boy", origin: "Tibetan", meaning: "Mighty lord, powerful one" },
  { name: "Yangchen", gender: "girl", origin: "Tibetan", meaning: "Melodious one", note: "The Tibetan name of Saraswati." },
  { name: "Yeshe", gender: "unisex", origin: "Tibetan", meaning: "Primordial wisdom", note: "The Tibetan rendering of jnana." },
];

/** Vowel clusters in a romanised name — a close proxy for spoken syllables. */
export function estimateSyllables(name) {
  if (typeof name !== "string") return 0;
  const groups = name.toLowerCase().match(/[aeiouāīūēō]+/g);
  return groups ? groups.length : 0;
}

/**
 * Filter the name list.
 * Returns { error } for unusable filter values so the UI can blank its figures.
 */
export function filterNames({
  gender = "any",
  origin = "any",
  startsWith = "",
  maxLength = MAX_NAME_LENGTH,
  query = "",
} = {}) {
  const letter = String(startsWith || "").trim();
  if (letter.length > 1) {
    return { error: "Pick a single starting letter, or leave it on Any." };
  }
  const text = String(query || "").trim();
  if (text.length > MAX_QUERY_LENGTH) {
    return { error: `Keep the search under ${MAX_QUERY_LENGTH} characters.` };
  }
  const cap = Number(maxLength);
  if (!Number.isFinite(cap) || cap < MIN_NAME_LENGTH || cap > MAX_NAME_LENGTH) {
    return {
      error: `Maximum length must be between ${MIN_NAME_LENGTH} and ${MAX_NAME_LENGTH} letters.`,
    };
  }
  if (gender !== "any" && !GENDERS.includes(gender)) {
    return { error: "Unknown gender filter." };
  }
  if (origin !== "any" && !ORIGINS.includes(origin)) {
    return { error: "Unknown origin filter." };
  }

  const lowerLetter = letter.toLowerCase();
  const lowerText = text.toLowerCase();

  const names = NAMES.filter((entry) => {
    if (gender !== "any" && entry.gender !== gender && entry.gender !== "unisex") return false;
    if (origin !== "any" && entry.origin !== origin) return false;
    if (lowerLetter && !entry.name.toLowerCase().startsWith(lowerLetter)) return false;
    if (entry.name.length > cap) return false;
    if (lowerText) {
      const haystack = `${entry.name} ${entry.meaning} ${entry.note || ""}`.toLowerCase();
      if (!haystack.includes(lowerText)) return false;
    }
    return true;
  }).map((entry) => ({ ...entry, letters: entry.name.length, syllables: estimateSyllables(entry.name) }));

  return {
    names,
    total: names.length,
    libraryTotal: NAMES.length,
    byOrigin: ORIGINS.map((source) => [source, names.filter((n) => n.origin === source).length]),
    shortest: names.reduce((best, n) => (best === null || n.letters < best.letters ? n : best), null),
  };
}

/** Distinct first letters present in the library, for the letter picker. */
export function availableLetters() {
  const set = new Set(NAMES.map((entry) => entry.name[0].toUpperCase()));
  return Array.from(set).sort();
}
