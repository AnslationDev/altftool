export const POPULAR_NAMES = [
  { rank: 1, name: "John", origin: "England", meaning: "God is gracious" },
  { rank: 2, name: "Mary", origin: "England", meaning: "Beloved / Star of the sea" },
  { rank: 3, name: "William", origin: "England", meaning: "Resolute protector" },
  { rank: 4, name: "James", origin: "England", meaning: "Supplanter" },
  { rank: 5, name: "Robert", origin: "England", meaning: "Bright fame" },
];

export const COUNTRY_MAPPING = {
  US: "American / English", GB: "British / English", IN: "Indian",
  DE: "German", FR: "French", IT: "Italian", ES: "Spanish",
  IE: "Irish", AU: "Australian", CA: "Canadian",
  NZ: "New Zealand", ZA: "South African", MX: "Mexican",
  BR: "Brazilian", CN: "Chinese", JP: "Japanese", KR: "Korean",
  RU: "Russian", NG: "Nigerian", EG: "Egyptian",
  SE: "Swedish", NO: "Norwegian", DK: "Danish", FI: "Finnish",
  NL: "Dutch", PL: "Polish", CH: "Swiss", AT: "Austrian",
  BE: "Belgian", GR: "Greek", PT: "Portuguese", AR: "Argentinian",
  CL: "Chilean", CO: "Colombian", PE: "Peruvian", TR: "Turkish",
  PH: "Filipino", MY: "Malaysian", TH: "Thai", ID: "Indonesian",
  PK: "Pakistani", BD: "Bangladeshi", VN: "Vietnamese", UA: "Ukrainian",
  CZ: "Czech", HU: "Hungarian", RO: "Romanian", BG: "Bulgarian",
  HR: "Croatian", RS: "Serbian", SK: "Slovak", SI: "Slovenian",
  IL: "Israeli", SA: "Saudi", AE: "Emirati", IR: "Iranian",
};

// Country centroid coordinates for Mapbox [lng, lat]
export const COUNTRY_CENTROIDS = {
  US: [-95.7, 37.1], GB: [-3.4, 55.4], IN: [78.9, 20.6],
  DE: [10.5, 51.2], FR: [2.2, 46.2], IT: [12.6, 42.8],
  ES: [-3.7, 40.4], IE: [-8.2, 53.4], AU: [133.8, -25.3],
  CA: [-106.3, 56.1], NZ: [174.9, -40.9], ZA: [25.1, -29.0],
  MX: [-102.5, 23.6], BR: [-51.9, -14.2], CN: [104.2, 35.9],
  JP: [138.3, 36.2], KR: [127.8, 36.0], RU: [105.3, 61.5],
  NG: [8.7, 9.1], EG: [30.8, 26.8], SE: [18.6, 60.1],
  NO: [8.5, 60.5], DK: [9.5, 56.3], FI: [25.7, 61.9],
  NL: [5.3, 52.1], PL: [19.1, 52.1], CH: [8.2, 46.8],
  AT: [14.6, 47.7], BE: [4.5, 50.5], GR: [21.8, 39.1],
  PT: [-8.2, 39.4], AR: [-63.6, -38.4], TR: [35.2, 38.9],
  PH: [121.8, 12.9], ID: [117.9, -0.8], PK: [69.3, 30.4],
  VN: [108.3, 14.1], UA: [31.2, 48.4], SA: [45.1, 24.2],
};

export const COUNTRY_NAMES = {
  US: "United States", GB: "United Kingdom", IN: "India",
  DE: "Germany", FR: "France", IT: "Italy", ES: "Spain",
  IE: "Ireland", AU: "Australia", CA: "Canada",
  NZ: "New Zealand", ZA: "South Africa", MX: "Mexico",
  BR: "Brazil", CN: "China", JP: "Japan", KR: "South Korea",
  RU: "Russia", NG: "Nigeria", EG: "Egypt",
  SE: "Sweden", NO: "Norway", DK: "Denmark", FI: "Finland",
  NL: "Netherlands", PL: "Poland", CH: "Switzerland",
  AT: "Austria", BE: "Belgium", GR: "Greece", PT: "Portugal",
  AR: "Argentina", TR: "Turkey", PH: "Philippines",
  ID: "Indonesia", PK: "Pakistan", VN: "Vietnam",
  UA: "Ukraine", SA: "Saudi Arabia", AE: "UAE", IR: "Iran",
};

export const FAQ_ITEMS = [
  {
    question: "What is a first name?",
    answer: "A first name, also known as a given name or forename, is the name given to a person at birth or christening that precedes the family surname. It is used to identify an individual within a family and social group, and often carries cultural, religious, or familial significance chosen by parents."
  },
  {
    question: "Where does first name meaning and origin information come from?",
    answer: "Name meaning and origin information is drawn from historical linguistics, etymology, ancient texts, religious scriptures, and centuries of recorded family history. Databases compiled from census records, baptismal registers, and genealogical archives across dozens of countries help establish how names have been used across time."
  },
  {
    question: "Where do first names come from?",
    answer: "First names have origins across virtually every human culture and language. Many English names derive from Hebrew (through the Bible), Latin (through the Roman Empire and the Church), and Germanic languages (through the Anglo-Saxons and Normans). Others come from Celtic, Greek, Arabic, Sanskrit, and countless other traditions."
  },
  {
    question: "When did people start using last names?",
    answer: "Surnames were not commonly used in England and much of Western Europe until the 11th to 14th centuries. Before that, people were typically identified by their first name alone, or with a description such as 'John the Smith' or 'William of York.' As populations grew, fixed family names became necessary for legal and administrative purposes."
  },
  {
    question: "What is a surname?",
    answer: "A surname, also called a family name or last name, is the hereditary portion of a person's name that identifies them as belonging to a particular family lineage. Surnames were typically adopted or assigned based on a family's occupation, location, a father's name (patronymic), or a physical characteristic of an ancestor."
  },
  {
    question: "Where does last name origin information come from?",
    answer: "Surname origin information is derived from historical documents including tax records, court rolls, parish registers, and census data going back centuries. Linguistic analysis of how surnames changed in spelling and pronunciation across generations also helps trace their earliest forms and meanings."
  },
  {
    question: "Where do last names come from?",
    answer: "Last names developed from several main sources: occupational names (Smith, Miller, Cooper), location names (Hill, Brook, London), patronymic names (Johnson meaning 'son of John'), and descriptive nicknames. In different cultures, naming conventions varied significantly — Scandinavian patronymics, Spanish double surnames, and Chinese family names each have distinct origins and traditions."
  },
  {
    question: "When did people start using last names?",
    answer: "The adoption of fixed hereditary surnames occurred at different times in different regions. In China, family names were used as early as 2852 BCE. In England, the practice became widespread after the Norman Conquest of 1066. In some Scandinavian countries, fixed hereditary surnames were not legally required until the 19th or even early 20th century."
  }
];

export const DAILY_FIRST_NAMES = [
  "Arthur", "Eleanor", "Theodore", "Hazel", "Julian", "Florence",
  "Cora", "Edmund", "Harriet", "Clement", "Rosalind", "Barnaby",
  "Winifred", "Rufus", "Cecily", "Alastair", "Dorothea", "Herbert",
  "Millicent", "Reginald", "Eugenia", "Cornelius", "Lavinia", "Archibald"
];

export const DAILY_SURNAMES = [
  "Harrison", "Bennett", "Fletcher", "Montgomery", "Sterling",
  "Hayes", "Caldwell", "Whitmore", "Ashford", "Pemberton",
  "Blackwood", "Fairfax", "Cromwell", "Grenville", "Wyndham"
];
