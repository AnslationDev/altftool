// Word bank for the hangman game. Every word is uppercase A-Z only (no
// spaces, hyphens or accents) so it maps 1:1 onto the letter keyboard.

export const CATEGORIES = [
  {
    id: "animals",
    label: "Animals",
    words: [
      "ELEPHANT", "GIRAFFE", "KANGAROO", "DOLPHIN", "PENGUIN", "CHEETAH",
      "LEOPARD", "RACCOON", "SQUIRREL", "HEDGEHOG", "OCTOPUS", "JELLYFISH",
      "CROCODILE", "ALLIGATOR", "FLAMINGO", "PELICAN", "OSTRICH", "PEACOCK",
      "BUFFALO", "ANTELOPE", "GAZELLE", "HAMSTER", "RABBIT", "TORTOISE",
      "WALRUS", "BEAVER", "BADGER", "FERRET", "WEASEL", "OTTER",
      "MONKEY", "GORILLA", "CHIMPANZEE", "BABOON", "JAGUAR", "PANTHER",
      "HYENA", "JACKAL", "COYOTE", "MOOSE", "REINDEER", "DONKEY",
      "ZEBRA", "HIPPOPOTAMUS", "RHINOCEROS", "PORCUPINE", "ARMADILLO", "SLOTH",
      "KOALA", "PANDA", "LEMUR", "MEERKAT", "MONGOOSE", "VULTURE",
      "FALCON", "SPARROW", "SWALLOW", "TOUCAN", "IGUANA", "SALAMANDER",
    ],
  },
  {
    id: "countries",
    label: "Countries",
    words: [
      "BRAZIL", "CANADA", "FRANCE", "GERMANY", "ITALY", "SPAIN",
      "PORTUGAL", "GREECE", "TURKEY", "EGYPT", "MOROCCO", "NIGERIA",
      "KENYA", "ETHIOPIA", "GHANA", "SENEGAL", "ALGERIA", "TUNISIA",
      "INDIA", "PAKISTAN", "NEPAL", "BHUTAN", "THAILAND", "VIETNAM",
      "MALAYSIA", "SINGAPORE", "INDONESIA", "PHILIPPINES", "JAPAN", "CHINA",
      "MONGOLIA", "AUSTRALIA", "ARGENTINA", "CHILE", "PERU", "COLOMBIA",
      "ECUADOR", "BOLIVIA", "URUGUAY", "PARAGUAY", "VENEZUELA", "MEXICO",
      "CUBA", "JAMAICA", "PANAMA", "HONDURAS", "GUATEMALA", "NICARAGUA",
      "NORWAY", "SWEDEN", "FINLAND", "DENMARK", "ICELAND", "IRELAND",
      "POLAND", "AUSTRIA", "HUNGARY", "ROMANIA", "BULGARIA", "CROATIA",
    ],
  },
  {
    id: "food",
    label: "Fruits & Food",
    words: [
      "MANGO", "BANANA", "ORANGE", "PAPAYA", "GUAVA", "LYCHEE",
      "CHERRY", "PEACH", "APRICOT", "GRAPE", "MELON", "WATERMELON",
      "PINEAPPLE", "COCONUT", "AVOCADO", "RASPBERRY", "BLUEBERRY", "STRAWBERRY",
      "BLACKBERRY", "CRANBERRY", "POMEGRANATE", "LEMON", "OLIVE", "TOMATO",
      "POTATO", "CARROT", "SPINACH", "BROCCOLI", "CUCUMBER", "PUMPKIN",
      "ONION", "GARLIC", "GINGER", "PEPPER", "LETTUCE", "PIZZA",
      "BURGER", "SANDWICH", "NOODLES", "PASTA", "LASAGNA", "RISOTTO",
      "OMELETTE", "PANCAKE", "WAFFLE", "MUFFIN", "DONUT", "BROWNIE",
      "CUPCAKE", "PRETZEL", "POPCORN", "YOGURT", "CHEESE", "BISCUIT",
      "CHOCOLATE", "KETCHUP", "MUSTARD", "HONEY", "BUTTER", "DUMPLING",
    ],
  },
  {
    id: "technology",
    label: "Technology",
    words: [
      "COMPUTER", "LAPTOP", "KEYBOARD", "MONITOR", "PRINTER", "SCANNER",
      "ROUTER", "MODEM", "SERVER", "DATABASE", "BROWSER", "WEBSITE",
      "INTERNET", "NETWORK", "WIRELESS", "BLUETOOTH", "SATELLITE", "PROCESSOR",
      "MEMORY", "STORAGE", "PIXEL", "SCREEN", "TABLET", "SMARTPHONE",
      "HEADPHONES", "MICROPHONE", "SPEAKER", "CAMERA", "DRONE", "ROBOT",
      "ALGORITHM", "PROGRAM", "SOFTWARE", "HARDWARE", "FIRMWARE", "COMPILER",
      "DEBUGGER", "ENCRYPTION", "PASSWORD", "FIREWALL", "CLOUD", "STREAMING",
      "PODCAST", "EMAIL", "EMOJI", "AVATAR", "CURSOR", "DESKTOP",
      "FOLDER", "DOWNLOAD", "UPLOAD", "BANDWIDTH", "ETHERNET", "JOYSTICK",
      "CONSOLE", "CHARGER", "BATTERY", "CIRCUIT", "SENSOR", "GADGET",
    ],
  },
];

export const ALL_CATEGORY_ID = "all";

const categoryById = new Map(CATEGORIES.map((category) => [category.id, category]));

function getWordPool(categoryId) {
  if (categoryId === ALL_CATEGORY_ID) {
    return CATEGORIES.flatMap((category) => category.words);
  }
  return categoryById.get(categoryId)?.words ?? [];
}

/**
 * Pick a random word from a category, avoiding words in `recent` when the
 * pool allows it. Returns { word, categoryLabel } (the real category, useful
 * when playing "all categories").
 */
export function pickWord(categoryId, recent = []) {
  const pool = getWordPool(categoryId);
  const recentSet = new Set(recent);
  const fresh = pool.filter((word) => !recentSet.has(word));
  const candidates = fresh.length > 0 ? fresh : pool;
  const word = candidates[Math.floor(Math.random() * candidates.length)];
  const source = CATEGORIES.find((category) => category.words.includes(word));
  return { word, categoryLabel: source?.label ?? "Mystery" };
}
