export const RDA = { kcal: 2000, protein: 50, carbs: 275, fat: 78, fiber: 28 };

export const GROUPS = [
  { id: "grains", label: "Grains & Flours" },
  { id: "pulses", label: "Dals & Pulses" },
  { id: "dairy", label: "Dairy" },
  { id: "protein", label: "Eggs, Meat & Fish" },
  { id: "fats", label: "Oils & Fats" },
  { id: "vegetables", label: "Vegetables" },
  { id: "fruits", label: "Fruits" },
  { id: "nuts", label: "Nuts & Seeds" },
  { id: "sweet", label: "Sugars & Sweeteners" },
  { id: "spices", label: "Spices & Masala" },
  { id: "other", label: "Other" },
];

const MEASURE_SETS = {
  fat: [
    ["1 tsp", 4.5],
    ["1 tbsp", 13],
    ["1/4 katori", 40],
  ],
  flour: [
    ["1 tbsp", 8],
    ["1 katori", 80],
    ["1 cup", 120],
  ],
  grain: [
    ["1 tbsp", 12],
    ["1 katori raw", 90],
    ["1 cup raw", 180],
  ],
  cookedGrain: [
    ["1 serving spoon", 60],
    ["1 katori", 150],
    ["1 cup", 195],
  ],
  pulse: [
    ["1 tbsp", 12],
    ["1 katori raw", 100],
    ["1 cup raw", 200],
  ],
  liquid: [
    ["1 tsp", 5],
    ["1 tbsp", 15],
    ["1 katori", 150],
    ["1 glass", 200],
  ],
  thickDairy: [
    ["1 tbsp", 15],
    ["1 katori", 120],
    ["1 cup", 240],
  ],
  veg: [
    ["1 tbsp chopped", 10],
    ["1 small", 60],
    ["1 medium", 100],
    ["1 katori chopped", 100],
  ],
  leafy: [
    ["1 handful", 20],
    ["1 katori chopped", 40],
    ["1 bunch", 100],
  ],
  fruit: [
    ["1 small", 80],
    ["1 medium", 120],
    ["1 large", 180],
  ],
  spice: [
    ["1 pinch", 0.3],
    ["1 tsp", 2.5],
    ["1 tbsp", 7],
  ],
  nut: [
    ["1 tbsp", 9],
    ["1 handful", 25],
    ["1 katori", 60],
  ],
  sugar: [
    ["1 tsp", 5],
    ["1 tbsp", 14],
    ["1 katori", 150],
  ],
  paneer: [
    ["1 cube", 15],
    ["1 katori cubed", 100],
  ],
  egg: [
    ["1 egg", 50],
    ["1 yolk", 17],
    ["1 white", 33],
  ],
  meat: [
    ["1 piece", 60],
    ["1 katori", 120],
    ["1 cup", 140],
  ],
  cheese: [
    ["1 tbsp grated", 8],
    ["1 cube", 15],
    ["1 slice", 20],
  ],
  base: [
    ["1 tsp", 5],
    ["1 tbsp", 15],
    ["1 katori", 100],
  ],
};

export function measuresFor(ingredient) {
  const set = MEASURE_SETS[ingredient?.type] || MEASURE_SETS.base;
  return set.map(([label, grams]) => ({ label, grams }));
}

const DEFAULT_GRAMS = {
  fat: 13,
  flour: 80,
  grain: 90,
  cookedGrain: 150,
  pulse: 100,
  liquid: 150,
  thickDairy: 100,
  veg: 100,
  leafy: 40,
  fruit: 120,
  spice: 2.5,
  nut: 25,
  sugar: 14,
  paneer: 100,
  egg: 50,
  meat: 120,
  cheese: 20,
  base: 50,
};

export function defaultGramsFor(ingredient) {
  return DEFAULT_GRAMS[ingredient?.type] ?? 50;
}

export const INGREDIENTS = [
  { id: "atta", name: "Atta (whole wheat flour)", group: "grains", type: "flour", kcal: 340, protein: 12.1, carbs: 71.2, fat: 1.7, fiber: 10.7 },
  { id: "maida", name: "Maida (refined flour)", group: "grains", type: "flour", kcal: 348, protein: 11, carbs: 74, fat: 1, fiber: 2.7 },
  { id: "besan", name: "Besan (gram flour)", group: "grains", type: "flour", kcal: 387, protein: 22.4, carbs: 57.8, fat: 6.7, fiber: 10.8 },
  { id: "suji", name: "Suji / rava (semolina)", group: "grains", type: "flour", kcal: 348, protein: 10.4, carbs: 74, fat: 1, fiber: 3.9 },
  { id: "cornflour", name: "Cornflour", group: "grains", type: "flour", kcal: 381, protein: 0.3, carbs: 91.3, fat: 0.1, fiber: 0.9 },
  { id: "makki-atta", name: "Makki atta (maize flour)", group: "grains", type: "flour", kcal: 361, protein: 6.9, carbs: 76.9, fat: 3.9, fiber: 7.3 },
  { id: "bajra", name: "Bajra (pearl millet)", group: "grains", type: "flour", kcal: 361, protein: 11.6, carbs: 67, fat: 5, fiber: 11.5 },
  { id: "jowar", name: "Jowar (sorghum)", group: "grains", type: "flour", kcal: 349, protein: 10.4, carbs: 72.6, fat: 1.9, fiber: 9.7 },
  { id: "ragi", name: "Ragi (finger millet)", group: "grains", type: "flour", kcal: 328, protein: 7.3, carbs: 72, fat: 1.3, fiber: 11.2 },
  { id: "rice-raw", name: "Rice, white (raw)", group: "grains", type: "grain", kcal: 345, protein: 6.8, carbs: 78.2, fat: 0.5, fiber: 0.6 },
  { id: "basmati-raw", name: "Basmati rice (raw)", group: "grains", type: "grain", kcal: 349, protein: 8.2, carbs: 77, fat: 0.6, fiber: 1 },
  { id: "brown-rice", name: "Brown rice (raw)", group: "grains", type: "grain", kcal: 362, protein: 7.5, carbs: 76, fat: 2.7, fiber: 3.4 },
  { id: "rice-cooked", name: "Rice, white (cooked)", group: "grains", type: "cookedGrain", kcal: 130, protein: 2.7, carbs: 28, fat: 0.3, fiber: 0.4 },
  { id: "poha", name: "Poha (flattened rice)", group: "grains", type: "grain", kcal: 346, protein: 6.6, carbs: 77, fat: 1.2, fiber: 1 },
  { id: "sabudana", name: "Sabudana (sago)", group: "grains", type: "grain", kcal: 358, protein: 0.2, carbs: 87, fat: 0.1, fiber: 0.9 },
  { id: "oats", name: "Oats (rolled)", group: "grains", type: "flour", kcal: 389, protein: 16.9, carbs: 66.3, fat: 6.9, fiber: 10.6 },
  { id: "quinoa", name: "Quinoa (raw)", group: "grains", type: "grain", kcal: 368, protein: 14.1, carbs: 64.2, fat: 6.1, fiber: 7 },
  { id: "pasta-dry", name: "Pasta / macaroni (dry)", group: "grains", type: "grain", kcal: 371, protein: 13, carbs: 75, fat: 1.5, fiber: 3.2 },
  { id: "vermicelli", name: "Vermicelli / sewai", group: "grains", type: "grain", kcal: 348, protein: 10, carbs: 75, fat: 1, fiber: 2 },
  { id: "noodles-instant", name: "Instant noodles (dry cake)", group: "grains", type: "grain", kcal: 448, protein: 9.4, carbs: 62, fat: 18, fiber: 3 },
  { id: "bread-white", name: "Bread, white", group: "grains", type: "base", kcal: 265, protein: 9, carbs: 49, fat: 3.2, fiber: 2.7 },
  { id: "bread-brown", name: "Bread, whole wheat", group: "grains", type: "base", kcal: 247, protein: 13, carbs: 41, fat: 3.4, fiber: 6.8 },
  { id: "breadcrumbs", name: "Breadcrumbs", group: "grains", type: "flour", kcal: 395, protein: 13.4, carbs: 71.9, fat: 5.3, fiber: 4.5 },
  { id: "cornflakes", name: "Cornflakes", group: "grains", type: "base", kcal: 357, protein: 7.5, carbs: 84, fat: 0.4, fiber: 3.3 },
  { id: "dalia", name: "Dalia (broken wheat)", group: "grains", type: "grain", kcal: 342, protein: 12.5, carbs: 75.9, fat: 1.3, fiber: 12.5 },

  { id: "toor-dal", name: "Toor / arhar dal (raw)", group: "pulses", type: "pulse", kcal: 335, protein: 22.3, carbs: 57.6, fat: 1.7, fiber: 15.5 },
  { id: "moong-dal", name: "Moong dal (raw)", group: "pulses", type: "pulse", kcal: 348, protein: 24.5, carbs: 59.9, fat: 1.2, fiber: 16.3 },
  { id: "masoor-dal", name: "Masoor dal (raw)", group: "pulses", type: "pulse", kcal: 343, protein: 25.1, carbs: 59, fat: 1.1, fiber: 10.8 },
  { id: "chana-dal", name: "Chana dal (raw)", group: "pulses", type: "pulse", kcal: 360, protein: 20.8, carbs: 60, fat: 5.6, fiber: 12.5 },
  { id: "urad-dal", name: "Urad dal (raw)", group: "pulses", type: "pulse", kcal: 341, protein: 25.2, carbs: 58.9, fat: 1.6, fiber: 18.3 },
  { id: "moong-whole", name: "Green moong, whole (raw)", group: "pulses", type: "pulse", kcal: 347, protein: 24, carbs: 63, fat: 1.2, fiber: 16.3 },
  { id: "rajma", name: "Rajma (raw)", group: "pulses", type: "pulse", kcal: 333, protein: 22.9, carbs: 60, fat: 1.1, fiber: 15.2 },
  { id: "kabuli-chana", name: "Kabuli chana / chickpea (raw)", group: "pulses", type: "pulse", kcal: 364, protein: 19.3, carbs: 61, fat: 6, fiber: 17.4 },
  { id: "kala-chana", name: "Kala chana (raw)", group: "pulses", type: "pulse", kcal: 360, protein: 17.1, carbs: 60.9, fat: 5.3, fiber: 12.7 },
  { id: "lobia", name: "Lobia / black-eyed peas (raw)", group: "pulses", type: "pulse", kcal: 336, protein: 23.5, carbs: 60, fat: 1.3, fiber: 10.6 },
  { id: "soya-chunks", name: "Soya chunks (dry)", group: "pulses", type: "pulse", kcal: 345, protein: 52, carbs: 33, fat: 0.5, fiber: 13 },
  { id: "dal-cooked", name: "Dal, cooked (tadka)", group: "pulses", type: "cookedGrain", kcal: 116, protein: 6.3, carbs: 13.5, fat: 4, fiber: 3.5 },
  { id: "sprouts", name: "Moong sprouts", group: "pulses", type: "veg", kcal: 30, protein: 3, carbs: 5.9, fat: 0.2, fiber: 1.8 },

  { id: "milk-whole", name: "Milk, whole (cow)", group: "dairy", type: "liquid", kcal: 61, protein: 3.2, carbs: 4.8, fat: 3.3, fiber: 0 },
  { id: "milk-toned", name: "Milk, toned", group: "dairy", type: "liquid", kcal: 58, protein: 3.1, carbs: 4.7, fat: 3, fiber: 0 },
  { id: "milk-double-toned", name: "Milk, double toned", group: "dairy", type: "liquid", kcal: 45, protein: 3.2, carbs: 4.8, fat: 1.5, fiber: 0 },
  { id: "milk-buffalo", name: "Milk, buffalo", group: "dairy", type: "liquid", kcal: 97, protein: 3.8, carbs: 5.2, fat: 6.9, fiber: 0 },
  { id: "curd", name: "Curd / dahi (whole milk)", group: "dairy", type: "thickDairy", kcal: 61, protein: 3.5, carbs: 4.7, fat: 3.3, fiber: 0 },
  { id: "curd-low-fat", name: "Curd, low fat", group: "dairy", type: "thickDairy", kcal: 46, protein: 3.8, carbs: 4.9, fat: 1.2, fiber: 0 },
  { id: "greek-yogurt", name: "Greek yogurt (plain)", group: "dairy", type: "thickDairy", kcal: 59, protein: 10, carbs: 3.6, fat: 0.4, fiber: 0 },
  { id: "paneer", name: "Paneer (full fat)", group: "dairy", type: "paneer", kcal: 296, protein: 18.3, carbs: 3.6, fat: 23, fiber: 0 },
  { id: "paneer-low-fat", name: "Paneer (low fat)", group: "dairy", type: "paneer", kcal: 206, protein: 24, carbs: 3.5, fat: 11, fiber: 0 },
  { id: "tofu", name: "Tofu", group: "dairy", type: "paneer", kcal: 76, protein: 8.1, carbs: 1.9, fat: 4.8, fiber: 0.3 },
  { id: "cheese", name: "Cheese, cheddar / processed", group: "dairy", type: "cheese", kcal: 402, protein: 25, carbs: 1.3, fat: 33, fiber: 0 },
  { id: "mozzarella", name: "Mozzarella", group: "dairy", type: "cheese", kcal: 300, protein: 22, carbs: 2.2, fat: 22, fiber: 0 },
  { id: "cream", name: "Fresh cream (25% fat)", group: "dairy", type: "thickDairy", kcal: 245, protein: 2.5, carbs: 3, fat: 25, fiber: 0 },
  { id: "malai", name: "Malai (thick cream)", group: "dairy", type: "thickDairy", kcal: 292, protein: 2.1, carbs: 2.8, fat: 30, fiber: 0 },
  { id: "khoya", name: "Khoya / mawa", group: "dairy", type: "thickDairy", kcal: 421, protein: 14.6, carbs: 25, fat: 31, fiber: 0 },
  { id: "condensed-milk", name: "Condensed milk (sweetened)", group: "dairy", type: "thickDairy", kcal: 321, protein: 7.9, carbs: 54.4, fat: 8.7, fiber: 0 },
  { id: "milk-powder", name: "Milk powder (whole)", group: "dairy", type: "flour", kcal: 496, protein: 26.3, carbs: 38.4, fat: 26.7, fiber: 0 },
  { id: "buttermilk", name: "Buttermilk / chaas", group: "dairy", type: "liquid", kcal: 40, protein: 3.3, carbs: 4.8, fat: 0.9, fiber: 0 },

  { id: "egg", name: "Egg, whole (raw)", group: "protein", type: "egg", kcal: 143, protein: 12.6, carbs: 0.7, fat: 9.5, fiber: 0 },
  { id: "egg-white", name: "Egg white", group: "protein", type: "egg", kcal: 52, protein: 10.9, carbs: 0.7, fat: 0.2, fiber: 0 },
  { id: "egg-yolk", name: "Egg yolk", group: "protein", type: "egg", kcal: 322, protein: 15.9, carbs: 3.6, fat: 26.5, fiber: 0 },
  { id: "chicken-breast", name: "Chicken breast (raw, skinless)", group: "protein", type: "meat", kcal: 120, protein: 22.5, carbs: 0, fat: 2.6, fiber: 0 },
  { id: "chicken-thigh", name: "Chicken thigh (raw, skinless)", group: "protein", type: "meat", kcal: 121, protein: 19.7, carbs: 0, fat: 4.1, fiber: 0 },
  { id: "chicken-curry-cut", name: "Chicken, curry cut with skin (raw)", group: "protein", type: "meat", kcal: 215, protein: 18.6, carbs: 0, fat: 15.1, fiber: 0 },
  { id: "mutton", name: "Mutton / goat, lean (raw)", group: "protein", type: "meat", kcal: 109, protein: 20.6, carbs: 0, fat: 2.3, fiber: 0 },
  { id: "mutton-keema", name: "Mutton keema (raw)", group: "protein", type: "meat", kcal: 194, protein: 18.5, carbs: 0, fat: 13.3, fiber: 0 },
  { id: "fish-rohu", name: "Fish, rohu (raw)", group: "protein", type: "meat", kcal: 97, protein: 16.6, carbs: 0, fat: 1.4, fiber: 0 },
  { id: "fish-pomfret", name: "Fish, pomfret (raw)", group: "protein", type: "meat", kcal: 87, protein: 18.2, carbs: 0, fat: 1.3, fiber: 0 },
  { id: "salmon", name: "Salmon (raw)", group: "protein", type: "meat", kcal: 208, protein: 20.4, carbs: 0, fat: 13.4, fiber: 0 },
  { id: "prawns", name: "Prawns (raw)", group: "protein", type: "meat", kcal: 89, protein: 20.3, carbs: 0.9, fat: 0.5, fiber: 0 },
  { id: "tuna-canned", name: "Tuna, canned in water", group: "protein", type: "meat", kcal: 116, protein: 25.5, carbs: 0, fat: 0.8, fiber: 0 },

  { id: "oil", name: "Cooking oil (sunflower / refined)", group: "fats", type: "fat", kcal: 884, protein: 0, carbs: 0, fat: 100, fiber: 0 },
  { id: "mustard-oil", name: "Mustard oil", group: "fats", type: "fat", kcal: 884, protein: 0, carbs: 0, fat: 100, fiber: 0 },
  { id: "olive-oil", name: "Olive oil", group: "fats", type: "fat", kcal: 884, protein: 0, carbs: 0, fat: 100, fiber: 0 },
  { id: "coconut-oil", name: "Coconut oil", group: "fats", type: "fat", kcal: 862, protein: 0, carbs: 0, fat: 100, fiber: 0 },
  { id: "ghee", name: "Ghee", group: "fats", type: "fat", kcal: 900, protein: 0, carbs: 0, fat: 100, fiber: 0 },
  { id: "butter", name: "Butter", group: "fats", type: "fat", kcal: 717, protein: 0.9, carbs: 0.1, fat: 81, fiber: 0 },
  { id: "vanaspati", name: "Vanaspati / dalda", group: "fats", type: "fat", kcal: 900, protein: 0, carbs: 0, fat: 100, fiber: 0 },
  { id: "mayonnaise", name: "Mayonnaise", group: "fats", type: "base", kcal: 680, protein: 1, carbs: 0.6, fat: 75, fiber: 0 },

  { id: "onion", name: "Onion", group: "vegetables", type: "veg", kcal: 40, protein: 1.1, carbs: 9.3, fat: 0.1, fiber: 1.7 },
  { id: "tomato", name: "Tomato", group: "vegetables", type: "veg", kcal: 18, protein: 0.9, carbs: 3.9, fat: 0.2, fiber: 1.2 },
  { id: "potato", name: "Potato", group: "vegetables", type: "veg", kcal: 77, protein: 2, carbs: 17.5, fat: 0.1, fiber: 2.1 },
  { id: "garlic", name: "Garlic", group: "vegetables", type: "spice", kcal: 149, protein: 6.4, carbs: 33, fat: 0.5, fiber: 2.1 },
  { id: "ginger", name: "Ginger", group: "vegetables", type: "spice", kcal: 80, protein: 1.8, carbs: 17.8, fat: 0.8, fiber: 2 },
  { id: "green-chilli", name: "Green chilli", group: "vegetables", type: "spice", kcal: 40, protein: 1.9, carbs: 8.8, fat: 0.4, fiber: 1.5 },
  { id: "capsicum", name: "Capsicum", group: "vegetables", type: "veg", kcal: 26, protein: 1, carbs: 6, fat: 0.3, fiber: 2.1 },
  { id: "carrot", name: "Carrot", group: "vegetables", type: "veg", kcal: 41, protein: 0.9, carbs: 9.6, fat: 0.2, fiber: 2.8 },
  { id: "cauliflower", name: "Cauliflower", group: "vegetables", type: "veg", kcal: 25, protein: 1.9, carbs: 5, fat: 0.3, fiber: 2 },
  { id: "cabbage", name: "Cabbage", group: "vegetables", type: "veg", kcal: 25, protein: 1.3, carbs: 5.8, fat: 0.1, fiber: 2.5 },
  { id: "brinjal", name: "Brinjal", group: "vegetables", type: "veg", kcal: 25, protein: 1, carbs: 5.9, fat: 0.2, fiber: 3 },
  { id: "bhindi", name: "Bhindi (okra)", group: "vegetables", type: "veg", kcal: 33, protein: 1.9, carbs: 7.5, fat: 0.2, fiber: 3.2 },
  { id: "lauki", name: "Lauki (bottle gourd)", group: "vegetables", type: "veg", kcal: 14, protein: 0.6, carbs: 3.4, fat: 0.1, fiber: 0.5 },
  { id: "spinach", name: "Palak (spinach)", group: "vegetables", type: "leafy", kcal: 23, protein: 2.9, carbs: 3.6, fat: 0.4, fiber: 2.2 },
  { id: "methi-leaves", name: "Methi leaves", group: "vegetables", type: "leafy", kcal: 49, protein: 4.4, carbs: 6, fat: 0.9, fiber: 1.1 },
  { id: "coriander-leaves", name: "Coriander leaves", group: "vegetables", type: "leafy", kcal: 23, protein: 2.1, carbs: 3.7, fat: 0.5, fiber: 2.8 },
  { id: "green-peas", name: "Green peas", group: "vegetables", type: "veg", kcal: 81, protein: 5.4, carbs: 14.5, fat: 0.4, fiber: 5.1 },
  { id: "french-beans", name: "French beans", group: "vegetables", type: "veg", kcal: 31, protein: 1.8, carbs: 7, fat: 0.1, fiber: 3.4 },
  { id: "pumpkin", name: "Pumpkin", group: "vegetables", type: "veg", kcal: 26, protein: 1, carbs: 6.5, fat: 0.1, fiber: 0.5 },
  { id: "cucumber", name: "Cucumber", group: "vegetables", type: "veg", kcal: 15, protein: 0.7, carbs: 3.6, fat: 0.1, fiber: 0.5 },
  { id: "mushroom", name: "Mushroom", group: "vegetables", type: "veg", kcal: 22, protein: 3.1, carbs: 3.3, fat: 0.3, fiber: 1 },
  { id: "beetroot", name: "Beetroot", group: "vegetables", type: "veg", kcal: 43, protein: 1.6, carbs: 9.6, fat: 0.2, fiber: 2.8 },
  { id: "radish", name: "Radish (mooli)", group: "vegetables", type: "veg", kcal: 16, protein: 0.7, carbs: 3.4, fat: 0.1, fiber: 1.6 },
  { id: "broccoli", name: "Broccoli", group: "vegetables", type: "veg", kcal: 34, protein: 2.8, carbs: 6.6, fat: 0.4, fiber: 2.6 },
  { id: "sweet-corn", name: "Sweet corn", group: "vegetables", type: "veg", kcal: 86, protein: 3.3, carbs: 19, fat: 1.2, fiber: 2 },
  { id: "sweet-potato", name: "Sweet potato", group: "vegetables", type: "veg", kcal: 86, protein: 1.6, carbs: 20.1, fat: 0.1, fiber: 3 },

  { id: "banana", name: "Banana", group: "fruits", type: "fruit", kcal: 89, protein: 1.1, carbs: 22.8, fat: 0.3, fiber: 2.6 },
  { id: "apple", name: "Apple", group: "fruits", type: "fruit", kcal: 52, protein: 0.3, carbs: 13.8, fat: 0.2, fiber: 2.4 },
  { id: "mango", name: "Mango", group: "fruits", type: "fruit", kcal: 60, protein: 0.8, carbs: 15, fat: 0.4, fiber: 1.6 },
  { id: "orange", name: "Orange", group: "fruits", type: "fruit", kcal: 47, protein: 0.9, carbs: 11.8, fat: 0.1, fiber: 2.4 },
  { id: "grapes", name: "Grapes", group: "fruits", type: "fruit", kcal: 69, protein: 0.7, carbs: 18.1, fat: 0.2, fiber: 0.9 },
  { id: "papaya", name: "Papaya", group: "fruits", type: "fruit", kcal: 43, protein: 0.5, carbs: 10.8, fat: 0.3, fiber: 1.7 },
  { id: "pomegranate", name: "Pomegranate", group: "fruits", type: "fruit", kcal: 83, protein: 1.7, carbs: 18.7, fat: 1.2, fiber: 4 },
  { id: "watermelon", name: "Watermelon", group: "fruits", type: "fruit", kcal: 30, protein: 0.6, carbs: 7.6, fat: 0.2, fiber: 0.4 },
  { id: "lemon-juice", name: "Lemon juice", group: "fruits", type: "liquid", kcal: 22, protein: 0.4, carbs: 6.9, fat: 0.2, fiber: 0.3 },
  { id: "coconut-fresh", name: "Coconut, fresh grated", group: "fruits", type: "nut", kcal: 354, protein: 3.3, carbs: 15.2, fat: 33.5, fiber: 9 },
  { id: "coconut-milk", name: "Coconut milk", group: "fruits", type: "liquid", kcal: 230, protein: 2.3, carbs: 5.5, fat: 23.8, fiber: 2.2 },
  { id: "dates", name: "Dates (khajur)", group: "fruits", type: "nut", kcal: 277, protein: 1.8, carbs: 75, fat: 0.2, fiber: 6.7 },

  { id: "almonds", name: "Almonds", group: "nuts", type: "nut", kcal: 579, protein: 21.2, carbs: 21.6, fat: 49.9, fiber: 12.5 },
  { id: "cashew", name: "Cashew", group: "nuts", type: "nut", kcal: 553, protein: 18.2, carbs: 30.2, fat: 43.9, fiber: 3.3 },
  { id: "walnut", name: "Walnut", group: "nuts", type: "nut", kcal: 654, protein: 15.2, carbs: 13.7, fat: 65.2, fiber: 6.7 },
  { id: "pista", name: "Pistachio", group: "nuts", type: "nut", kcal: 560, protein: 20.2, carbs: 27.2, fat: 45.3, fiber: 10.6 },
  { id: "peanuts", name: "Peanuts", group: "nuts", type: "nut", kcal: 567, protein: 25.8, carbs: 16.1, fat: 49.2, fiber: 8.5 },
  { id: "raisins", name: "Raisins (kishmish)", group: "nuts", type: "nut", kcal: 299, protein: 3.1, carbs: 79.2, fat: 0.5, fiber: 3.7 },
  { id: "sesame", name: "Sesame seeds (til)", group: "nuts", type: "nut", kcal: 573, protein: 17.7, carbs: 23.4, fat: 49.7, fiber: 11.8 },
  { id: "flax", name: "Flax seeds", group: "nuts", type: "nut", kcal: 534, protein: 18.3, carbs: 28.9, fat: 42.2, fiber: 27.3 },
  { id: "chia", name: "Chia seeds", group: "nuts", type: "nut", kcal: 486, protein: 16.5, carbs: 42.1, fat: 30.7, fiber: 34.4 },
  { id: "khus-khus", name: "Poppy seeds (khus khus)", group: "nuts", type: "nut", kcal: 525, protein: 18, carbs: 28.1, fat: 41.6, fiber: 19.5 },
  { id: "makhana", name: "Makhana (fox nuts)", group: "nuts", type: "nut", kcal: 347, protein: 9.7, carbs: 76.9, fat: 0.1, fiber: 14.5 },
  { id: "peanut-butter", name: "Peanut butter", group: "nuts", type: "base", kcal: 588, protein: 25.1, carbs: 20, fat: 50.4, fiber: 6 },

  { id: "sugar", name: "Sugar", group: "sweet", type: "sugar", kcal: 387, protein: 0, carbs: 100, fat: 0, fiber: 0 },
  { id: "jaggery", name: "Jaggery (gud)", group: "sweet", type: "sugar", kcal: 383, protein: 0.4, carbs: 97.5, fat: 0.1, fiber: 0 },
  { id: "honey", name: "Honey", group: "sweet", type: "sugar", kcal: 304, protein: 0.3, carbs: 82.4, fat: 0, fiber: 0.2 },
  { id: "dark-chocolate", name: "Dark chocolate (70%)", group: "sweet", type: "base", kcal: 546, protein: 4.9, carbs: 61.2, fat: 31.3, fiber: 7 },
  { id: "cocoa-powder", name: "Cocoa powder (unsweetened)", group: "sweet", type: "flour", kcal: 228, protein: 19.6, carbs: 57.9, fat: 13.7, fiber: 33.2 },

  { id: "turmeric", name: "Turmeric (haldi)", group: "spices", type: "spice", kcal: 354, protein: 7.8, carbs: 64.9, fat: 9.9, fiber: 21.1 },
  { id: "chilli-powder", name: "Red chilli powder", group: "spices", type: "spice", kcal: 282, protein: 13.5, carbs: 49.7, fat: 14.3, fiber: 34.8 },
  { id: "coriander-powder", name: "Coriander powder (dhania)", group: "spices", type: "spice", kcal: 298, protein: 12.4, carbs: 55, fat: 17.8, fiber: 41.9 },
  { id: "cumin", name: "Cumin seeds (jeera)", group: "spices", type: "spice", kcal: 375, protein: 17.8, carbs: 44.2, fat: 22.3, fiber: 10.5 },
  { id: "garam-masala", name: "Garam masala", group: "spices", type: "spice", kcal: 379, protein: 14, carbs: 45, fat: 15, fiber: 25 },
  { id: "hing", name: "Hing (asafoetida)", group: "spices", type: "spice", kcal: 297, protein: 4, carbs: 68, fat: 1.1, fiber: 4 },
  { id: "black-pepper", name: "Black pepper", group: "spices", type: "spice", kcal: 251, protein: 10.4, carbs: 63.9, fat: 3.3, fiber: 25.3 },
  { id: "mustard-seeds", name: "Mustard seeds (rai)", group: "spices", type: "spice", kcal: 508, protein: 26.1, carbs: 28.1, fat: 36.2, fiber: 12.2 },
  { id: "salt", name: "Salt", group: "spices", type: "spice", kcal: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },

  { id: "water", name: "Water", group: "other", type: "liquid", kcal: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
  { id: "ketchup", name: "Tomato ketchup", group: "other", type: "base", kcal: 101, protein: 1, carbs: 25, fat: 0.1, fiber: 0.3 },
  { id: "soy-sauce", name: "Soy sauce", group: "other", type: "base", kcal: 53, protein: 8.1, carbs: 4.9, fat: 0.6, fiber: 0.8 },
  { id: "tamarind", name: "Tamarind pulp", group: "other", type: "base", kcal: 239, protein: 2.8, carbs: 62.5, fat: 0.6, fiber: 5.1 },
  { id: "baking-powder", name: "Baking powder", group: "other", type: "spice", kcal: 53, protein: 0, carbs: 27.7, fat: 0, fiber: 0.2 },
  { id: "yeast", name: "Yeast (dry)", group: "other", type: "spice", kcal: 325, protein: 40.4, carbs: 41.2, fat: 7.6, fiber: 26.9 },
];

export const INGREDIENT_BY_ID = INGREDIENTS.reduce((map, ingredient) => {
  map[ingredient.id] = ingredient;
  return map;
}, {});

export const SWAPS = {
  ghee: [
    { label: "Use half the ghee", detail: "Most Indian recipes taste the same with 50% less. A tbsp saved is 117 kcal gone." },
    { label: "Finish with ghee instead of cooking in it", detail: "Cook in 1 tsp oil and add 1/2 tsp raw ghee at the end — you get the whole aroma for a third of the fat." },
  ],
  butter: [
    { label: "Swap for olive oil", detail: "Same richness, roughly the same calories but far less saturated fat." },
    { label: "Use a brushing, not a slab", detail: "Brushing a roti with butter uses about 2 g instead of the 10 g a knife spreads." },
  ],
  oil: [
    { label: "Measure it, do not pour it", detail: "A free pour is usually 3-4 tbsp. Measuring 1 tbsp saves 350+ kcal per dish." },
    { label: "Use a non-stick pan or air fryer", detail: "Cuts the oil a bhuna needs by half or more without changing the masala." },
  ],
  "mustard-oil": [
    { label: "Measure it, do not pour it", detail: "Mustard oil is 884 kcal per 100 g — the same as any other oil. Only the smoke point differs." },
  ],
  "coconut-oil": [
    { label: "Measure it, do not pour it", detail: "Coconut oil is not a low-calorie fat. It is 862 kcal per 100 g and mostly saturated." },
  ],
  vanaspati: [
    { label: "Replace with any liquid oil", detail: "Same calories, but you drop the trans fats entirely." },
  ],
  cream: [
    { label: "Swap for thick curd or Greek yogurt", detail: "Cream is 245 kcal/100 g, hung curd is about 60. Whisk it and add off the heat so it does not split." },
    { label: "Blend cashews instead", detail: "Fewer calories than cream for the same silk, and it adds protein." },
  ],
  malai: [
    { label: "Swap for milk plus a cashew paste", detail: "Malai is 292 kcal/100 g. A tbsp of cashew paste in milk gives the same body for far less." },
  ],
  cheese: [
    { label: "Grate it instead of slicing", detail: "Grated cheese covers three times the surface, so half the quantity tastes like twice as much." },
    { label: "Swap for mozzarella", detail: "About 100 kcal less per 100 g with a better melt." },
  ],
  paneer: [
    { label: "Use low-fat paneer", detail: "Saves 90 kcal per 100 g and actually adds protein — 24 g instead of 18 g." },
    { label: "Half paneer, half tofu", detail: "Tofu is 76 kcal/100 g against 296. Cut the cubes the same size and few people notice in a gravy." },
  ],
  cashew: [
    { label: "Swap half for melon seeds (magaz)", detail: "Similar creaminess in a gravy for fewer calories." },
    { label: "Soak and blend rather than fry", detail: "Frying cashews before grinding adds oil you do not need." },
  ],
  "coconut-fresh": [
    { label: "Use half coconut, half curd", detail: "In a chutney, half the coconut and a spoon of curd keeps the texture and halves the fat." },
  ],
  "coconut-milk": [
    { label: "Thin it with stock", detail: "Half coconut milk, half vegetable stock keeps the flavour at half the fat." },
  ],
  sugar: [
    { label: "Cut it by a third", detail: "In kheer, halwa and chai, a third less sugar is almost never noticed after two days." },
    { label: "Use dates or raisins", detail: "Sweetness plus fibre, and they hit the tongue slower." },
  ],
  jaggery: [
    { label: "Treat it like sugar", detail: "Jaggery is 383 kcal/100 g against sugar's 387. The mineral content is real but the calories are the same." },
  ],
  "condensed-milk": [
    { label: "Swap for milk reduced with less sugar", detail: "Condensed milk is 54 g of sugar per 100 g. Reducing plain milk gives you control." },
  ],
  khoya: [
    { label: "Swap for milk powder plus milk", detail: "Fewer calories per spoon and much easier to measure." },
  ],
  mayonnaise: [
    { label: "Swap for hung curd with mustard", detail: "680 kcal/100 g down to about 60, with the same tang." },
  ],
  maida: [
    { label: "Swap for atta", detail: "Atta has 10.7 g fibre per 100 g against maida's 2.7 — nearly the same calories, far better satiety." },
  ],
  "rice-raw": [
    { label: "Swap a third for dal or vegetables", detail: "Same katori, more protein and fibre, fewer calories." },
    { label: "Try brown rice or millets", detail: "Similar calories but three to five times the fibre." },
  ],
  potato: [
    { label: "Swap half for cauliflower", detail: "77 kcal down to 25 per 100 g. In a gravy sabzi almost nobody notices." },
  ],
  peanuts: [
    { label: "Roast, do not fry", detail: "Fried peanuts soak up oil. Dry roasting keeps the crunch and skips the extra fat." },
  ],
  "peanut-butter": [
    { label: "Level the spoon", detail: "A heaped tbsp is nearly 2 tbsp — about 180 kcal. Level it and halve the damage." },
  ],
  "noodles-instant": [
    { label: "Skip the tastemaker oil, add vegetables", detail: "The fried cake is already 18 g fat per 100 g. Bulk it with vegetables instead of a second packet." },
  ],
  "dark-chocolate": [
    { label: "Two squares, not the bar", detail: "20 g is about 110 kcal. The bar is 550." },
  ],
  walnut: [
    { label: "Keep it to a handful", detail: "Walnuts are the most calorie-dense food in this database at 654 kcal/100 g. The fats are good ones — the portion still matters." },
  ],
  almonds: [
    { label: "Count them out", detail: "10 almonds is about 70 kcal. A loose handful is often 25 nuts and 175 kcal." },
  ],
};

export const STARTER_RECIPE = {
  name: "Dal Tadka (family serving)",
  servings: 4,
  rows: [
    { id: "r1", ingredientId: "toor-dal", grams: 200 },
    { id: "r2", ingredientId: "onion", grams: 100 },
    { id: "r3", ingredientId: "tomato", grams: 120 },
    { id: "r4", ingredientId: "ghee", grams: 26 },
    { id: "r5", ingredientId: "garlic", grams: 12 },
    { id: "r6", ingredientId: "ginger", grams: 10 },
    { id: "r7", ingredientId: "cumin", grams: 2.5 },
    { id: "r8", ingredientId: "turmeric", grams: 2.5 },
    { id: "r9", ingredientId: "chilli-powder", grams: 2.5 },
    { id: "r10", ingredientId: "coriander-leaves", grams: 15 },
    { id: "r11", ingredientId: "salt", grams: 5 },
    { id: "r12", ingredientId: "water", grams: 800 },
  ],
};
