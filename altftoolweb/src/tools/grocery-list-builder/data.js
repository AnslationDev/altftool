export const UNITS = ["kg", "g", "L", "ml", "pcs", "pack", "packet", "dozen", "bunch", "bottle"];

export const CATEGORIES = [
  {
    id: "produce",
    label: "Fruits & Vegetables",
    aisle: "Fresh aisle",
    defaultUnit: "kg",
    keywords: [
      "onion", "pyaz", "potato", "aloo", "tomato", "tamatar", "garlic", "lehsun", "ginger", "adrak",
      "green chilli", "chilli", "chili", "mirchi", "capsicum", "bell pepper", "shimla mirch", "carrot", "gajar",
      "beans", "french beans", "peas", "matar", "cauliflower", "gobi", "cabbage", "patta gobi", "brinjal",
      "baingan", "eggplant", "bhindi", "okra", "lady finger", "lauki", "bottle gourd", "tinda", "turai",
      "karela", "bitter gourd", "spinach", "palak", "methi", "fenugreek leaves", "coriander", "dhania",
      "cilantro", "mint", "pudina", "curry leaves", "kadi patta", "lemon", "nimbu", "lime", "cucumber",
      "kheera", "beetroot", "chukandar", "radish", "mooli", "pumpkin", "kaddu", "drumstick", "sahjan",
      "sweet potato", "shakarkandi", "spring onion", "celery", "broccoli", "zucchini", "avocado", "lettuce",
      "mushroom", "sweet corn", "bhutta", "apple", "seb", "banana", "kela", "mango", "aam", "orange",
      "santra", "mosambi", "grapes", "angoor", "papaya", "papita", "pomegranate", "anar", "watermelon",
      "tarbooj", "muskmelon", "guava", "amrud", "pear", "nashpati", "kiwi", "pineapple", "ananas",
      "strawberry", "chikoo", "sapota", "litchi", "custard apple", "sitaphal", "plum", "peach", "apricot",
      "fresh coconut", "nariyal", "vegetables", "sabzi", "fruits", "salad",
    ],
    common: [
      { name: "Onion", qty: 2, unit: "kg" },
      { name: "Potato", qty: 2, unit: "kg" },
      { name: "Tomato", qty: 1, unit: "kg" },
      { name: "Ginger", qty: 100, unit: "g" },
      { name: "Garlic", qty: 250, unit: "g" },
      { name: "Green Chilli", qty: 100, unit: "g" },
      { name: "Coriander Leaves", qty: 1, unit: "bunch" },
      { name: "Lemon", qty: 6, unit: "pcs" },
      { name: "Capsicum", qty: 250, unit: "g" },
      { name: "Cauliflower", qty: 1, unit: "pcs" },
      { name: "Spinach", qty: 1, unit: "bunch" },
      { name: "Carrot", qty: 500, unit: "g" },
      { name: "Banana", qty: 1, unit: "dozen" },
      { name: "Apple", qty: 1, unit: "kg" },
      { name: "Cucumber", qty: 500, unit: "g" },
    ],
  },
  {
    id: "dairy",
    label: "Dairy & Eggs",
    aisle: "Chiller",
    defaultUnit: "pcs",
    keywords: [
      "milk", "doodh", "toned milk", "full cream milk", "curd", "dahi", "yogurt", "yoghurt", "greek yogurt",
      "paneer", "cottage cheese", "cheese", "cheese slices", "cheese cubes", "mozzarella", "butter", "makhan",
      "amul butter", "ghee", "clarified butter", "cream", "fresh cream", "malai", "buttermilk", "chaas",
      "lassi", "khoya", "mawa", "condensed milk", "milk powder", "tofu", "egg", "eggs", "anda", "egg tray",
      "flavoured milk", "curd cup", "shrikhand", "cheese spread", "whipping cream",
    ],
    common: [
      { name: "Milk", qty: 2, unit: "L" },
      { name: "Curd", qty: 500, unit: "g" },
      { name: "Paneer", qty: 200, unit: "g" },
      { name: "Butter", qty: 100, unit: "g" },
      { name: "Ghee", qty: 500, unit: "ml" },
      { name: "Cheese Slices", qty: 1, unit: "pack" },
      { name: "Eggs", qty: 1, unit: "dozen" },
      { name: "Fresh Cream", qty: 200, unit: "ml" },
    ],
  },
  {
    id: "staples",
    label: "Atta, Dal & Rice",
    aisle: "Staples aisle",
    defaultUnit: "kg",
    keywords: [
      "atta", "wheat flour", "flour", "maida", "besan", "gram flour", "suji", "sooji", "rava", "semolina",
      "cornflour", "corn flour", "rice", "chawal", "basmati", "brown rice", "poha", "flattened rice", "murmura",
      "dalia", "sabudana", "sago", "vermicelli", "sewai", "pasta", "macaroni", "noodles", "maggi", "oats",
      "cornflakes", "muesli", "quinoa", "bajra", "jowar", "ragi", "millet", "dal", "daal", "toor dal",
      "arhar dal", "moong dal", "masoor dal", "chana dal", "urad dal", "rajma", "chole", "kabuli chana",
      "black chana", "lobia", "soya chunks", "soyabean", "lentils", "pulses", "sugar", "cheeni", "jaggery",
      "gud", "salt", "namak", "rock salt", "sendha namak", "oil", "cooking oil", "sunflower oil", "mustard oil",
      "sarso oil", "refined oil", "olive oil", "rice bran oil", "groundnut oil", "tea", "chai", "tea leaves",
      "green tea", "coffee", "honey", "shahad", "bread", "brown bread", "pav", "bun", "yeast", "baking powder",
      "baking soda", "cocoa powder", "custard powder", "papad", "vinegar",
    ],
    common: [
      { name: "Atta", qty: 5, unit: "kg" },
      { name: "Rice", qty: 5, unit: "kg" },
      { name: "Toor Dal", qty: 1, unit: "kg" },
      { name: "Moong Dal", qty: 500, unit: "g" },
      { name: "Chana Dal", qty: 500, unit: "g" },
      { name: "Rajma", qty: 500, unit: "g" },
      { name: "Sugar", qty: 1, unit: "kg" },
      { name: "Salt", qty: 1, unit: "kg" },
      { name: "Cooking Oil", qty: 1, unit: "L" },
      { name: "Besan", qty: 500, unit: "g" },
      { name: "Poha", qty: 500, unit: "g" },
      { name: "Tea Leaves", qty: 250, unit: "g" },
      { name: "Bread", qty: 1, unit: "pack" },
      { name: "Oats", qty: 1, unit: "pack" },
    ],
  },
  {
    id: "spices",
    label: "Spices & Masala",
    aisle: "Masala aisle",
    defaultUnit: "g",
    keywords: [
      "turmeric", "haldi", "chilli powder", "red chilli powder", "lal mirch", "coriander powder",
      "dhania powder", "cumin", "jeera", "cumin powder", "mustard seeds", "rai", "sarso seeds", "garam masala",
      "hing", "asafoetida", "ajwain", "carom seeds", "saunf", "fennel", "methi seeds", "fenugreek seeds",
      "kalonji", "nigella", "elaichi", "cardamom", "clove", "laung", "cinnamon", "dalchini", "bay leaf",
      "tej patta", "black pepper", "kali mirch", "pepper", "peppercorn", "chaat masala", "sambar powder",
      "rasam powder", "kitchen king", "biryani masala", "pav bhaji masala", "chole masala", "kasuri methi",
      "star anise", "javitri", "mace", "nutmeg", "jaiphal", "saffron", "kesar", "tamarind", "imli", "amchur",
      "dry mango powder", "poppy seeds", "khus khus", "sesame seeds", "til", "dry red chilli", "masala",
      "spices", "spice",
    ],
    common: [
      { name: "Turmeric Powder", qty: 100, unit: "g" },
      { name: "Red Chilli Powder", qty: 100, unit: "g" },
      { name: "Coriander Powder", qty: 200, unit: "g" },
      { name: "Cumin Seeds", qty: 100, unit: "g" },
      { name: "Garam Masala", qty: 50, unit: "g" },
      { name: "Mustard Seeds", qty: 100, unit: "g" },
      { name: "Hing", qty: 25, unit: "g" },
      { name: "Black Pepper", qty: 50, unit: "g" },
      { name: "Kasuri Methi", qty: 25, unit: "g" },
      { name: "Chaat Masala", qty: 50, unit: "g" },
    ],
  },
  {
    id: "snacks",
    label: "Snacks & Beverages",
    aisle: "Snacks aisle",
    defaultUnit: "pack",
    keywords: [
      "biscuit", "biscuits", "cookies", "parle", "britannia", "oreo", "marie", "rusk", "khari", "chips",
      "lays", "kurkure", "namkeen", "bhujia", "sev", "mixture", "chivda", "moong dal namkeen", "wafer",
      "popcorn", "chocolate", "dairy milk", "candy", "toffee", "cake", "muffin", "pastry", "peanuts",
      "mungfali", "almonds", "badam", "cashew", "kaju", "raisins", "kishmish", "walnut", "akhrot", "pista",
      "pistachio", "dry fruits", "makhana", "fox nuts", "dates", "khajur", "anjeer", "fig", "juice",
      "fruit juice", "soft drink", "cold drink", "cola", "pepsi", "coke", "sprite", "soda", "energy drink",
      "sports drink", "iced tea", "mineral water", "water bottle", "protein bar", "granola bar", "jam",
      "peanut butter", "nutella", "chocolate spread", "instant coffee",
    ],
    common: [
      { name: "Biscuits", qty: 2, unit: "pack" },
      { name: "Namkeen", qty: 1, unit: "pack" },
      { name: "Chips", qty: 2, unit: "pack" },
      { name: "Almonds", qty: 250, unit: "g" },
      { name: "Cashew", qty: 250, unit: "g" },
      { name: "Raisins", qty: 200, unit: "g" },
      { name: "Chocolate", qty: 2, unit: "pcs" },
      { name: "Fruit Juice", qty: 1, unit: "L" },
      { name: "Soft Drink", qty: 2, unit: "bottle" },
      { name: "Peanut Butter", qty: 1, unit: "bottle" },
    ],
  },
  {
    id: "frozen",
    label: "Frozen & Chilled",
    aisle: "Freezer",
    defaultUnit: "pack",
    keywords: [
      "frozen", "frozen peas", "frozen corn", "frozen mixed veg", "ice cream", "kulfi", "ice", "ice cubes",
      "frozen paratha", "frozen roti", "french fries", "potato wedges", "nuggets", "fish fingers",
      "chicken nuggets", "momos", "spring roll", "samosa frozen", "ready to eat", "ready to cook",
      "frozen pizza", "pizza base", "chicken", "murgi", "chicken breast", "keema", "mutton", "goat meat",
      "fish", "machli", "rohu", "pomfret", "surmai", "prawns", "jhinga", "salmon", "tuna", "sausage",
      "salami", "ham", "bacon", "cold cuts", "seekh kebab", "whipped topping",
    ],
    common: [
      { name: "Frozen Peas", qty: 500, unit: "g" },
      { name: "Ice Cream", qty: 1, unit: "pack" },
      { name: "French Fries", qty: 1, unit: "pack" },
      { name: "Frozen Paratha", qty: 1, unit: "pack" },
      { name: "Chicken", qty: 1, unit: "kg" },
      { name: "Fish", qty: 500, unit: "g" },
      { name: "Prawns", qty: 500, unit: "g" },
      { name: "Chicken Nuggets", qty: 1, unit: "pack" },
    ],
  },
  {
    id: "household",
    label: "Household & Cleaning",
    aisle: "Home care",
    defaultUnit: "pcs",
    keywords: [
      "detergent", "washing powder", "surf", "ariel", "rin", "tide", "liquid detergent", "fabric softener",
      "comfort", "dishwash", "dish wash", "vim", "pril", "scrubber", "sponge", "steel scrub", "phenyl",
      "floor cleaner", "lizol", "harpic", "toilet cleaner", "colin", "glass cleaner", "bleach", "acid",
      "garbage bags", "dustbin bags", "trash bags", "aluminium foil", "foil", "cling film", "butter paper",
      "tissue", "tissue paper", "paper towel", "kitchen roll", "napkins", "matchbox", "lighter", "candle",
      "mosquito", "all out", "good knight", "hit spray", "cockroach", "naphthalene", "agarbatti", "incense",
      "camphor", "kapoor", "room freshener", "air freshener", "broom", "jhadu", "mop", "wiper", "duster",
      "bulb", "led bulb", "battery", "cells", "clothes pegs", "hanger", "bucket", "mug", "storage box",
      "zip lock", "toilet paper", "shoe polish",
    ],
    common: [
      { name: "Detergent Powder", qty: 1, unit: "kg" },
      { name: "Dishwash Liquid", qty: 1, unit: "bottle" },
      { name: "Floor Cleaner", qty: 1, unit: "bottle" },
      { name: "Toilet Cleaner", qty: 1, unit: "bottle" },
      { name: "Garbage Bags", qty: 1, unit: "pack" },
      { name: "Tissue Paper", qty: 1, unit: "pack" },
      { name: "Aluminium Foil", qty: 1, unit: "pcs" },
      { name: "Scrubber", qty: 2, unit: "pcs" },
      { name: "Mosquito Repellent", qty: 1, unit: "pcs" },
      { name: "Agarbatti", qty: 1, unit: "pack" },
    ],
  },
  {
    id: "personal",
    label: "Personal Care",
    aisle: "Personal care",
    defaultUnit: "pcs",
    keywords: [
      "soap", "sabun", "bathing bar", "body wash", "shower gel", "shampoo", "conditioner", "hair oil",
      "hair colour", "hair gel", "toothpaste", "colgate", "toothbrush", "tongue cleaner", "mouthwash",
      "dental floss", "face wash", "face cream", "moisturizer", "moisturiser", "body lotion", "lotion",
      "cold cream", "sunscreen", "sunblock", "deodorant", "deo", "perfume", "razor", "shaving cream",
      "shaving gel", "after shave", "trimmer", "hair removal", "waxing", "comb", "hair brush",
      "sanitary pads", "whisper", "stayfree", "tampon", "menstrual cup", "diaper", "baby wipes", "wipes",
      "baby oil", "hand wash", "handwash", "sanitizer", "talcum powder", "talc", "nail cutter", "nail polish",
      "cotton", "ear buds", "band aid", "dettol", "savlon", "vaseline", "petroleum jelly", "lip balm",
      "kajal", "lipstick", "face pack", "shaving foam", "medicines", "first aid",
    ],
    common: [
      { name: "Bath Soap", qty: 3, unit: "pcs" },
      { name: "Shampoo", qty: 1, unit: "bottle" },
      { name: "Toothpaste", qty: 1, unit: "pcs" },
      { name: "Hand Wash", qty: 1, unit: "bottle" },
      { name: "Hair Oil", qty: 1, unit: "bottle" },
      { name: "Face Wash", qty: 1, unit: "pcs" },
      { name: "Deodorant", qty: 1, unit: "pcs" },
      { name: "Sanitary Pads", qty: 1, unit: "pack" },
      { name: "Shaving Cream", qty: 1, unit: "pcs" },
      { name: "Body Lotion", qty: 1, unit: "bottle" },
    ],
  },
];

export const OTHER_CATEGORY = { id: "other", label: "Other", aisle: "Anywhere", defaultUnit: "pcs" };

export const ALL_CATEGORIES = [...CATEGORIES, OTHER_CATEGORY];

export const CATEGORY_BY_ID = ALL_CATEGORIES.reduce((map, category) => {
  map[category.id] = category;
  return map;
}, {});

const normalize = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const singularize = (word) => {
  if (word.length > 4 && word.endsWith("ies")) return `${word.slice(0, -3)}y`;
  if (word.length > 4 && /(ch|sh|s|x|z)es$/.test(word)) return word.slice(0, -2);
  if (word.length > 3 && word.endsWith("s") && !word.endsWith("ss")) return word.slice(0, -1);
  return word;
};

export function detectCategory(name) {
  const normalized = normalize(name);
  if (!normalized) return null;

  const words = normalized.split(" ");
  const phrases = [` ${normalized} `, ` ${words.map(singularize).join(" ")} `];

  let match = null;
  for (const category of CATEGORIES) {
    for (const keyword of category.keywords) {
      const needle = ` ${keyword} `;
      if (!phrases.some((phrase) => phrase.includes(needle))) continue;
      if (!match || keyword.length > match.keyword.length) {
        match = { categoryId: category.id, keyword };
      }
    }
  }

  return match;
}

export const STARTER_LISTS = [
  {
    id: "list-weekly",
    name: "Weekly Groceries",
    items: [
      { id: "w1", name: "Onion", qty: 2, unit: "kg", categoryId: "produce", checked: false },
      { id: "w2", name: "Tomato", qty: 1, unit: "kg", categoryId: "produce", checked: false },
      { id: "w3", name: "Coriander Leaves", qty: 1, unit: "bunch", categoryId: "produce", checked: false },
      { id: "w4", name: "Banana", qty: 1, unit: "dozen", categoryId: "produce", checked: false },
      { id: "w5", name: "Milk", qty: 2, unit: "L", categoryId: "dairy", checked: false },
      { id: "w6", name: "Curd", qty: 500, unit: "g", categoryId: "dairy", checked: false },
      { id: "w7", name: "Paneer", qty: 200, unit: "g", categoryId: "dairy", checked: false },
      { id: "w8", name: "Atta", qty: 5, unit: "kg", categoryId: "staples", checked: false },
      { id: "w9", name: "Toor Dal", qty: 1, unit: "kg", categoryId: "staples", checked: false },
      { id: "w10", name: "Bread", qty: 1, unit: "pack", categoryId: "staples", checked: false },
      { id: "w11", name: "Garam Masala", qty: 50, unit: "g", categoryId: "spices", checked: false },
      { id: "w12", name: "Biscuits", qty: 2, unit: "pack", categoryId: "snacks", checked: false },
      { id: "w13", name: "Dishwash Liquid", qty: 1, unit: "bottle", categoryId: "household", checked: false },
      { id: "w14", name: "Bath Soap", qty: 3, unit: "pcs", categoryId: "personal", checked: false },
    ],
  },
  {
    id: "list-party",
    name: "Party Snacks",
    items: [
      { id: "p1", name: "Paneer", qty: 500, unit: "g", categoryId: "dairy", checked: false },
      { id: "p2", name: "Capsicum", qty: 250, unit: "g", categoryId: "produce", checked: false },
      { id: "p3", name: "Chips", qty: 4, unit: "pack", categoryId: "snacks", checked: false },
      { id: "p4", name: "Soft Drink", qty: 3, unit: "bottle", categoryId: "snacks", checked: false },
      { id: "p5", name: "Ice Cream", qty: 1, unit: "pack", categoryId: "frozen", checked: false },
      { id: "p6", name: "Tissue Paper", qty: 1, unit: "pack", categoryId: "household", checked: false },
    ],
  },
  {
    id: "list-monthly",
    name: "Monthly Staples",
    items: [
      { id: "m1", name: "Rice", qty: 10, unit: "kg", categoryId: "staples", checked: false },
      { id: "m2", name: "Sugar", qty: 2, unit: "kg", categoryId: "staples", checked: false },
      { id: "m3", name: "Cooking Oil", qty: 5, unit: "L", categoryId: "staples", checked: false },
      { id: "m4", name: "Ghee", qty: 1, unit: "L", categoryId: "dairy", checked: false },
      { id: "m5", name: "Tea Leaves", qty: 500, unit: "g", categoryId: "staples", checked: false },
      { id: "m6", name: "Detergent Powder", qty: 2, unit: "kg", categoryId: "household", checked: false },
      { id: "m7", name: "Toothpaste", qty: 2, unit: "pcs", categoryId: "personal", checked: false },
    ],
  },
];
