/**
 * Christian baby name finder — pure logic, no React and no DOM.
 *
 * Every row records the language the name actually comes from (most biblical
 * names are Hebrew, Aramaic, Greek or Latin), the literal sense of the root
 * word, the person or idea the name is attached to, and where that person
 * appears: the Hebrew Bible / Old Testament, the New Testament, later saints
 * and church tradition, or the virtue-name tradition (Faith, Grace, Hope).
 *
 * Meanings are given as the conventional scholarly gloss of the root. Several
 * biblical names have contested etymologies — where a name is disputed the
 * gloss lists the main readings rather than picking one.
 *
 * Nothing here reads the clock or the network.
 */

/** The four scriptural / traditional sources a name is tagged with. */
export const SOURCES = [
  { id: "any", label: "Any source" },
  { id: "old", label: "Old Testament" },
  { id: "new", label: "New Testament" },
  { id: "saint", label: "Saints & tradition" },
  { id: "virtue", label: "Virtue name" },
];

export const GENDERS = [
  { id: "any", label: "Any" },
  { id: "boy", label: "Boy" },
  { id: "girl", label: "Girl" },
];

/** Row format: [name, gender, origin language, meaning, figure, source id] */
const ROWS = [
  ["Aaron", "boy", "Hebrew", "Exalted; mountain of strength", "Aaron, brother of Moses", "old"],
  ["Abel", "boy", "Hebrew", "Breath, vapour", "Abel, second son of Adam", "old"],
  ["Abigail", "girl", "Hebrew", "My father is joy", "Abigail, wife of David", "old"],
  ["Adam", "boy", "Hebrew", "Man; formed of the earth", "Adam, the first man", "old"],
  ["Amos", "boy", "Hebrew", "Carried, borne by God", "The prophet Amos", "old"],
  ["Andrew", "boy", "Greek", "Manly, courageous", "Apostle Andrew", "new"],
  ["Angela", "girl", "Greek", "Messenger, angel", "Angelic tradition", "saint"],
  ["Anna", "girl", "Hebrew", "Grace, favour", "Anna the prophetess in the Temple", "new"],
  ["Anthony", "boy", "Latin", "Of the Antonius family; priceless", "St Anthony of Padua", "saint"],
  ["Aquila", "boy", "Latin", "Eagle", "Aquila, tentmaker and co-worker of Paul", "new"],
  ["Augustine", "boy", "Latin", "Venerable, revered", "St Augustine of Hippo", "saint"],
  ["Barnabas", "boy", "Aramaic", "Son of encouragement", "Barnabas, companion of Paul", "new"],
  ["Bartholomew", "boy", "Aramaic", "Son of Talmai", "Apostle Bartholomew", "new"],
  ["Benedict", "boy", "Latin", "Blessed, well spoken of", "St Benedict of Nursia", "saint"],
  ["Benjamin", "boy", "Hebrew", "Son of the right hand", "Benjamin, youngest son of Jacob", "old"],
  ["Bernadette", "girl", "Germanic", "Brave as a bear", "St Bernadette of Lourdes", "saint"],
  ["Bethany", "girl", "Aramaic", "House of figs", "Bethany, village near Jerusalem", "new"],
  ["Caleb", "boy", "Hebrew", "Wholehearted; dog, faithful one", "Caleb, spy sent into Canaan", "old"],
  ["Cecilia", "girl", "Latin", "Of the Caecilius family; blind", "St Cecilia, patron of music", "saint"],
  ["Charity", "girl", "Latin", "Selfless love (caritas)", "The greatest of the three theological virtues", "virtue"],
  ["Christian", "boy", "Latin", "Follower of Christ", "The name first given at Antioch", "saint"],
  ["Christopher", "boy", "Greek", "Bearing Christ", "St Christopher", "saint"],
  ["Clare", "girl", "Latin", "Bright, clear", "St Clare of Assisi", "saint"],
  ["Clement", "boy", "Latin", "Merciful, gentle", "Clement of Rome", "saint"],
  ["Damaris", "girl", "Greek", "Gentle; heifer", "Damaris, Athenian convert of Paul", "new"],
  ["Daniel", "boy", "Hebrew", "God is my judge", "The prophet Daniel", "old"],
  ["David", "boy", "Hebrew", "Beloved", "King David", "old"],
  ["Deborah", "girl", "Hebrew", "Bee", "Deborah, judge and prophetess", "old"],
  ["Dominic", "boy", "Latin", "Belonging to the Lord", "St Dominic", "saint"],
  ["Elijah", "boy", "Hebrew", "The Lord is my God", "The prophet Elijah", "old"],
  ["Elizabeth", "girl", "Hebrew", "My God is an oath; God's abundance", "Elizabeth, mother of John the Baptist", "new"],
  ["Emmanuel", "boy", "Hebrew", "God with us", "The sign named in Isaiah 7:14", "old"],
  ["Esther", "girl", "Hebrew", "Star; hidden one", "Queen Esther", "old"],
  ["Eve", "girl", "Hebrew", "Life, living one", "Eve, the first woman", "old"],
  ["Ezekiel", "boy", "Hebrew", "God strengthens", "The prophet Ezekiel", "old"],
  ["Faith", "girl", "Latin", "Trust, fidelity (fides)", "First of the three theological virtues", "virtue"],
  ["Felicity", "girl", "Latin", "Happiness, good fortune", "St Felicity, martyr", "saint"],
  ["Francis", "boy", "Latin", "Frenchman, free one", "St Francis of Assisi", "saint"],
  ["Gabriel", "boy", "Hebrew", "God is my strength", "The archangel Gabriel", "old"],
  ["Genevieve", "girl", "Germanic", "Woman of the people", "St Genevieve of Paris", "saint"],
  ["Grace", "girl", "Latin", "Divine favour freely given (gratia)", "The doctrine of grace", "virtue"],
  ["Gregory", "boy", "Greek", "Watchful, vigilant", "Pope St Gregory the Great", "saint"],
  ["Hannah", "girl", "Hebrew", "Grace, favour", "Hannah, mother of Samuel", "old"],
  ["Helena", "girl", "Greek", "Torch, shining light", "St Helena", "saint"],
  ["Hope", "girl", "English", "Expectation, trust in what is promised", "Second of the three theological virtues", "virtue"],
  ["Ignatius", "boy", "Latin", "Fiery one", "St Ignatius of Loyola", "saint"],
  ["Isaac", "boy", "Hebrew", "He laughs", "Isaac, son of Abraham", "old"],
  ["Isaiah", "boy", "Hebrew", "The Lord is salvation", "The prophet Isaiah", "old"],
  ["Jacob", "boy", "Hebrew", "Holder of the heel; supplanter", "Jacob, father of the twelve tribes", "old"],
  ["James", "boy", "Hebrew", "Holder of the heel; supplanter", "Apostle James, son of Zebedee", "new"],
  ["Jason", "boy", "Greek", "Healer", "Jason, host of Paul at Thessalonica", "new"],
  ["Jerome", "boy", "Greek", "Sacred name", "St Jerome, translator of the Vulgate", "saint"],
  ["Jesse", "boy", "Hebrew", "Gift; the Lord exists", "Jesse, father of David", "old"],
  ["Joanna", "girl", "Hebrew", "The Lord is gracious", "Joanna, follower of Jesus", "new"],
  ["Job", "boy", "Hebrew", "Persecuted, tried one", "Job, the patient sufferer", "old"],
  ["Joel", "boy", "Hebrew", "The Lord is God", "The prophet Joel", "old"],
  ["John", "boy", "Hebrew", "The Lord is gracious", "John the Baptist; Apostle John", "new"],
  ["Jonathan", "boy", "Hebrew", "The Lord has given", "Jonathan, friend of David", "old"],
  ["Joseph", "boy", "Hebrew", "He will add, increase", "Joseph, son of Jacob", "old"],
  ["Joshua", "boy", "Hebrew", "The Lord is salvation", "Joshua, successor of Moses", "old"],
  ["Josiah", "boy", "Hebrew", "The Lord supports, heals", "King Josiah of Judah", "old"],
  ["Judith", "girl", "Hebrew", "Woman of Judea", "Judith of the deuterocanonical book", "old"],
  ["Julia", "girl", "Latin", "Of the Julian house; youthful", "Julia, greeted by Paul in Romans 16", "new"],
  ["Leah", "girl", "Hebrew", "Weary one; wild cow", "Leah, wife of Jacob", "old"],
  ["Levi", "boy", "Hebrew", "Joined, attached", "Levi, son of Jacob", "old"],
  ["Lois", "girl", "Greek", "More desirable, better", "Lois, grandmother of Timothy", "new"],
  ["Lucy", "girl", "Latin", "Light", "St Lucy of Syracuse", "saint"],
  ["Luke", "boy", "Latin", "Of Lucania; light-bringer", "Luke the Evangelist", "new"],
  ["Lydia", "girl", "Greek", "Woman of Lydia", "Lydia, seller of purple and first European convert", "new"],
  ["Magdalene", "girl", "Hebrew", "Of Magdala", "Mary Magdalene", "new"],
  ["Malachi", "boy", "Hebrew", "My messenger", "The prophet Malachi", "old"],
  ["Mark", "boy", "Latin", "Of Mars; warlike", "Mark the Evangelist", "new"],
  ["Martha", "girl", "Aramaic", "Lady, mistress of the house", "Martha of Bethany", "new"],
  ["Mary", "girl", "Hebrew", "Wished-for child; bitter; beloved", "Mary, mother of Jesus", "new"],
  ["Matthew", "boy", "Hebrew", "Gift of the Lord", "Matthew the Evangelist", "new"],
  ["Micah", "boy", "Hebrew", "Who is like the Lord", "The prophet Micah", "old"],
  ["Michael", "boy", "Hebrew", "Who is like God", "The archangel Michael", "old"],
  ["Miriam", "girl", "Hebrew", "Wished-for child; bitter", "Miriam, sister of Moses", "old"],
  ["Monica", "girl", "Latin", "Advisor; of uncertain North African root", "St Monica, mother of Augustine", "saint"],
  ["Naomi", "girl", "Hebrew", "Pleasantness, sweetness", "Naomi in the Book of Ruth", "old"],
  ["Nathan", "boy", "Hebrew", "He gave", "The prophet Nathan", "old"],
  ["Nathanael", "boy", "Hebrew", "Gift of God", "Nathanael, called by Philip", "new"],
  ["Nicholas", "boy", "Greek", "Victory of the people", "St Nicholas of Myra", "saint"],
  ["Noah", "boy", "Hebrew", "Rest, comfort", "Noah of the ark", "old"],
  ["Patrick", "boy", "Latin", "Nobleman, of patrician rank", "St Patrick of Ireland", "saint"],
  ["Paul", "boy", "Latin", "Small, humble", "Apostle Paul", "new"],
  ["Peter", "boy", "Greek", "Rock, stone", "Apostle Peter", "new"],
  ["Philip", "boy", "Greek", "Lover of horses", "Apostle Philip", "new"],
  ["Phoebe", "girl", "Greek", "Bright, radiant", "Phoebe, deacon of the church at Cenchreae", "new"],
  ["Priscilla", "girl", "Latin", "Ancient, venerable", "Priscilla, co-worker of Paul", "new"],
  ["Rachel", "girl", "Hebrew", "Ewe", "Rachel, wife of Jacob", "old"],
  ["Rebecca", "girl", "Hebrew", "To bind, to tie firmly", "Rebecca, wife of Isaac", "old"],
  ["Reuben", "boy", "Hebrew", "Behold, a son", "Reuben, firstborn of Jacob", "old"],
  ["Rose", "girl", "Latin", "Rose, the flower", "St Rose of Lima", "saint"],
  ["Ruth", "girl", "Hebrew", "Friend, companion", "Ruth the Moabite", "old"],
  ["Samuel", "boy", "Hebrew", "God has heard", "The prophet Samuel", "old"],
  ["Sarah", "girl", "Hebrew", "Princess, noblewoman", "Sarah, wife of Abraham", "old"],
  ["Sebastian", "boy", "Greek", "From Sebaste; venerable", "St Sebastian", "saint"],
  ["Seth", "boy", "Hebrew", "Appointed, placed", "Seth, third son of Adam", "old"],
  ["Silas", "boy", "Aramaic", "Asked for; of the forest", "Silas, companion of Paul", "new"],
  ["Simeon", "boy", "Hebrew", "He has heard", "Simeon, who blessed the infant Jesus", "new"],
  ["Simon", "boy", "Hebrew", "He has heard", "Simon Peter; Simon the Zealot", "new"],
  ["Solomon", "boy", "Hebrew", "Peace, wholeness", "King Solomon", "old"],
  ["Stephen", "boy", "Greek", "Crown, garland", "Stephen, the first martyr", "new"],
  ["Susanna", "girl", "Hebrew", "Lily, lotus", "Susanna, who supported Jesus's ministry", "new"],
  ["Tabitha", "girl", "Aramaic", "Gazelle", "Tabitha of Joppa, raised by Peter", "new"],
  ["Teresa", "girl", "Greek", "Harvester; of Therasia", "St Teresa of Avila", "saint"],
  ["Theodore", "boy", "Greek", "Gift of God", "St Theodore of Amasea", "saint"],
  ["Thomas", "boy", "Aramaic", "Twin", "Apostle Thomas", "new"],
  ["Timothy", "boy", "Greek", "Honouring God", "Timothy, companion of Paul", "new"],
  ["Titus", "boy", "Latin", "Of honour; of uncertain Roman root", "Titus, sent by Paul to Crete", "new"],
  ["Tobias", "boy", "Hebrew", "The Lord is good", "Tobias of the Book of Tobit", "old"],
  ["Veronica", "girl", "Latin", "True image", "St Veronica", "saint"],
  ["Vincent", "boy", "Latin", "Conquering, prevailing", "St Vincent de Paul", "saint"],
  ["Xavier", "boy", "Basque", "New house", "St Francis Xavier", "saint"],
  ["Zachary", "boy", "Hebrew", "The Lord remembers", "Zechariah, father of John the Baptist", "new"],
];

export const NAMES = ROWS.map(([name, gender, origin, meaning, figure, source]) => ({
  name,
  gender,
  origin,
  meaning,
  figure,
  source,
  sourceLabel: SOURCES.find((s) => s.id === source)?.label ?? source,
  initial: name.charAt(0).toUpperCase(),
}));

/** Every origin language present in the list, sorted. */
export const ORIGINS = Array.from(new Set(NAMES.map((n) => n.origin))).sort();

/** Distinct starting letters actually present, so the UI never offers a dead key. */
export const INITIALS = Array.from(new Set(NAMES.map((n) => n.initial))).sort();

/**
 * Filter the Christian name list.
 *
 * @param {object} options
 * @param {string} [options.letter]  a single A-Z letter, or "any"
 * @param {string} [options.gender]  "any" | "boy" | "girl"
 * @param {string} [options.origin]  an exact origin language, or "any"
 * @param {string} [options.source]  "any" | "old" | "new" | "saint" | "virtue"
 * @param {string} [options.meaning] substring matched against meaning and figure
 * @returns {{names: object[], matched: number, total: number, bySource: object}|{error: string}}
 */
export function findNames({
  letter = "any",
  gender = "any",
  origin = "any",
  source = "any",
  meaning = "",
} = {}) {
  if (!GENDERS.some((g) => g.id === gender)) {
    return { error: "Choose Any, Boy or Girl for gender." };
  }
  if (!SOURCES.some((s) => s.id === source)) {
    return { error: "Choose a source from the list." };
  }
  if (origin !== "any" && !ORIGINS.includes(origin)) {
    return { error: "Choose an origin language from the list." };
  }

  const wanted = typeof letter === "string" ? letter.trim().toUpperCase() : "";
  const useLetter = wanted.length === 1 && /^[A-Z]$/.test(wanted);
  if (wanted && wanted !== "ANY" && !useLetter) {
    return { error: "Pick a single starting letter from A to Z." };
  }

  const needle = typeof meaning === "string" ? meaning.trim().toLowerCase() : "";

  const names = NAMES.filter((entry) => {
    if (useLetter && entry.initial !== wanted) return false;
    if (gender !== "any" && entry.gender !== gender) return false;
    if (origin !== "any" && entry.origin !== origin) return false;
    if (source !== "any" && entry.source !== source) return false;
    if (
      needle &&
      !entry.meaning.toLowerCase().includes(needle) &&
      !entry.figure.toLowerCase().includes(needle)
    ) {
      return false;
    }
    return true;
  }).sort((a, b) => a.name.localeCompare(b.name, "en"));

  const bySource = {};
  for (const item of SOURCES) {
    if (item.id === "any") continue;
    bySource[item.id] = names.filter((n) => n.source === item.id).length;
  }

  return { names, matched: names.length, total: NAMES.length, bySource };
}
