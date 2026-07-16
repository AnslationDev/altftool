export const CATEGORIES = [
  { id: 'dairy', label: 'Dairy & Eggs', icon: 'Milk' },
  { id: 'baking', label: 'Baking Essentials', icon: 'Cake' },
  { id: 'sweeteners', label: 'Sweeteners', icon: 'Candy' },
  { id: 'oils', label: 'Oils & Fats', icon: 'Droplets' },
  { id: 'vegetables', label: 'Vegetables', icon: 'Carrot' },
  { id: 'protein', label: 'Protein', icon: 'Egg' },
  { id: 'spices', label: 'Spices & Herbs', icon: 'Leaf' },
  { id: 'liquids', label: 'Liquids & Sauces', icon: 'GlassWater' },
];

export const DIETARY_FILTERS = [
  { id: 'vegan', label: 'Vegan' },
  { id: 'vegetarian', label: 'Vegetarian' },
  { id: 'gluten-free', label: 'Gluten-Free' },
  { id: 'dairy-free', label: 'Dairy-Free' },
  { id: 'keto', label: 'Keto' },
  { id: 'nut-free', label: 'Nut-Free' },
  { id: 'sugar-free', label: 'Sugar-Free' },
];

export const COOKING_TYPES = [
  { id: 'baking', label: 'Baking' },
  { id: 'frying', label: 'Frying' },
  { id: 'desserts', label: 'Desserts' },
  { id: 'sauces', label: 'Sauces' },
  { id: 'drinks', label: 'Drinks' },
  { id: 'meal-prep', label: 'Meal Prep' },
  { id: 'boiling', label: 'Boiling' },
  { id: 'steaming', label: 'Steaming' },
  { id: 'roasting', label: 'Roasting' },
  { id: 'sauteing', label: 'Sautéing' },
  { id: 'slow-cooking', label: 'Slow Cooking' },
  { id: 'air-frying', label: 'Air Frying' },
];

export const INGREDIENTS = [
  {
    id: 'egg',
    name: 'Egg',
    category: 'protein',
    substitutes: [
      { name: 'Applesauce', ratio: '1/4 cup', similarity: 75, suitability: 'High', notes: 'Best for binding in sweet baking.', dietary: ['vegan', 'dairy-free', 'nut-free'], cookingType: ['baking', 'desserts', 'slow-cooking'] },
      { name: 'Flax Egg', ratio: '1 tbsp meal + 3 tbsp water', similarity: 80, suitability: 'High', notes: 'Let sit for 5 mins; great for nutty recipes.', dietary: ['vegan', 'dairy-free'], cookingType: ['baking', 'roasting', 'meal-prep', 'air-frying'] },
      { name: 'Aquafaba', ratio: '3 tbsp', similarity: 90, suitability: 'Very High', notes: 'Chickpea liquid; can be whipped for meringues.', dietary: ['vegan', 'dairy-free'], cookingType: ['baking', 'desserts', 'sauteing', 'steaming'] },
      { name: 'Silken Tofu', ratio: '1/4 cup blended', similarity: 80, suitability: 'Medium', notes: 'Makes results dense and moist.', dietary: ['vegan', 'dairy-free'], cookingType: ['baking', 'sauteing', 'frying', 'slow-cooking'] }
    ]
  },
  {
    id: 'flour-ap',
    name: 'All-Purpose Flour',
    category: 'baking',
    substitutes: [
      { name: 'Cake Flour', ratio: '1:1', similarity: 90, suitability: 'High', notes: 'Best for cakes; results in a lighter crumb.', dietary: ['vegetarian'], cookingType: ['baking', 'steaming', 'boiling'] },
      { name: 'Almond Flour', ratio: '1:1', similarity: 60, suitability: 'Low', notes: 'Gluten-free; lacks binding. Add extra egg.', dietary: ['gluten-free', 'keto', 'vegan'], cookingType: ['baking', 'air-frying', 'roasting'] },
      { name: 'Rice Flour', ratio: '1:1', similarity: 85, suitability: 'High', notes: 'Great for crispy coatings.', dietary: ['gluten-free', 'vegan'], cookingType: ['frying', 'sauteing', 'air-frying', 'steaming'] }
    ]
  },
  {
    id: 'sugar-white',
    name: 'Granulated Sugar',
    category: 'sweeteners',
    substitutes: [
      { name: 'Brown Sugar', ratio: '1:1', similarity: 95, suitability: 'Very High', notes: 'Adds moisture and molasses flavor.', dietary: ['vegan'], cookingType: ['baking', 'desserts', 'sauces', 'roasting', 'slow-cooking'] },
      { name: 'Honey', ratio: '3/4 : 1', similarity: 80, suitability: 'High', notes: 'Reduce liquid in recipe by 1/4 cup.', dietary: ['vegetarian'], cookingType: ['baking', 'drinks', 'sauces', 'sauteing', 'meal-prep'] },
      { name: 'Maple Syrup', ratio: '3/4 : 1', similarity: 85, suitability: 'High', notes: 'Distinct flavor; reduces liquid.', dietary: ['vegan'], cookingType: ['baking', 'desserts', 'sauces', 'drinks', 'roasting'] }
    ]
  },
  {
    id: 'butter-unsalted',
    name: 'Unsalted Butter',
    category: 'oils',
    substitutes: [
      { name: 'Coconut Oil', ratio: '1:1', similarity: 85, suitability: 'High', notes: 'Use solid oil for baking.', dietary: ['vegan', 'dairy-free'], cookingType: ['baking', 'frying', 'sauteing', 'roasting', 'slow-cooking', 'air-frying'] },
      { name: 'Olive Oil', ratio: '3/4 : 1', similarity: 75, suitability: 'Medium', notes: 'Best for savory dishes.', dietary: ['vegan', 'dairy-free'], cookingType: ['frying', 'sauces', 'sauteing', 'roasting', 'slow-cooking', 'meal-prep'] },
      { name: 'Ghee', ratio: '1:1', similarity: 95, suitability: 'Very High', notes: 'Higher smoke point; rich flavor.', dietary: ['keto', 'nut-free'], cookingType: ['frying', 'sauteing', 'boiling', 'slow-cooking', 'roasting', 'air-frying'] }
    ]
  },
  {
    id: 'milk-whole',
    name: 'Whole Milk',
    category: 'dairy',
    substitutes: [
      { name: 'Oat Milk', ratio: '1:1', similarity: 90, suitability: 'Very High', notes: 'Creamy texture, neutral flavor.', dietary: ['vegan', 'dairy-free'], cookingType: ['baking', 'drinks', 'sauces', 'steaming', 'boiling', 'slow-cooking'] },
      { name: 'Coconut Milk', ratio: '1:1', similarity: 85, suitability: 'High', notes: 'Adds richness and distinct flavor.', dietary: ['vegan', 'dairy-free', 'keto'], cookingType: ['sauces', 'desserts', 'slow-cooking', 'boiling', 'drinks'] },
      { name: 'Almond Milk', ratio: '1:1', similarity: 80, suitability: 'High', notes: 'Thinner; slight nutty taste.', dietary: ['vegan', 'dairy-free', 'keto'], cookingType: ['baking', 'drinks', 'desserts', 'steaming'] }
    ]
  },
  {
    id: 'garlic-fresh',
    name: 'Garlic (Fresh)',
    category: 'spices',
    substitutes: [
      { name: 'Garlic Powder', ratio: '1/8 tsp = 1 clove', similarity: 85, suitability: 'High', notes: 'More concentrated flavor.', dietary: ['vegan', 'keto'], cookingType: ['sauces', 'meal-prep', 'roasting', 'slow-cooking', 'sauteing', 'air-frying'] },
      { name: 'Shallots', ratio: '1 tbsp minced', similarity: 75, suitability: 'Medium', notes: 'Sweeter and milder.', dietary: ['vegan', 'keto'], cookingType: ['frying', 'sauteing', 'roasting', 'steaming', 'meal-prep', 'slow-cooking'] }
    ]
  },
  {
    id: 'onion-yellow',
    name: 'Yellow Onion',
    category: 'vegetables',
    substitutes: [
      { name: 'Shallots', ratio: '1:1', similarity: 90, suitability: 'High', notes: 'Milder and more delicate.', dietary: ['vegan', 'keto'], cookingType: ['sauteing', 'roasting', 'slow-cooking', 'steaming', 'meal-prep', 'frying'] },
      { name: 'Leeks', ratio: '1:1', similarity: 80, suitability: 'High', notes: 'Use white and light green parts only.', dietary: ['vegan', 'vegetarian'], cookingType: ['boiling', 'steaming', 'sauteing', 'slow-cooking', 'meal-prep'] }
    ]
  },
  {
    id: 'oil-veg',
    name: 'Vegetable Oil',
    category: 'oils',
    substitutes: [
      { name: 'Canola Oil', ratio: '1:1', similarity: 100, suitability: 'Very High', notes: 'Neutral flavor, same smoke point.', dietary: ['vegan'], cookingType: ['frying', 'sauteing', 'baking', 'air-frying', 'roasting'] },
      { name: 'Avocado Oil', ratio: '1:1', similarity: 95, suitability: 'Very High', notes: 'High smoke point; very healthy.', dietary: ['vegan', 'keto', 'paleo'], cookingType: ['frying', 'sauteing', 'roasting', 'air-frying', 'slow-cooking'] }
    ]
  },
  {
    id: 'salt-kosher',
    name: 'Kosher Salt',
    category: 'spices',
    substitutes: [
      { name: 'Sea Salt', ratio: '1:1', similarity: 95, suitability: 'Very High', notes: 'Similar grain size; pure flavor.', dietary: ['vegan', 'keto'], cookingType: ['boiling', 'steaming', 'roasting', 'sauteing', 'frying', 'slow-cooking', 'air-frying', 'meal-prep', 'baking'] },
      { name: 'Soy Sauce', ratio: '1 tbsp = 1/2 tsp salt', similarity: 70, suitability: 'Medium', notes: 'Adds umami and liquid.', dietary: ['vegan'], cookingType: ['sauces', 'sauteing', 'slow-cooking', 'boiling', 'meal-prep'] }
    ]
  },
  {
    id: 'pepper-black',
    name: 'Black Pepper',
    category: 'spices',
    substitutes: [
      { name: 'White Pepper', ratio: '1:1', similarity: 85, suitability: 'High', notes: 'Milder; good for light-colored sauces.', dietary: ['vegan', 'keto'], cookingType: ['sauces', 'boiling', 'steaming', 'sauteing', 'roasting', 'meal-prep'] },
      { name: 'Lemon Pepper', ratio: '1:1', similarity: 75, suitability: 'Medium', notes: 'Adds citrus notes.', dietary: ['vegan'], cookingType: ['roasting', 'steaming', 'sauteing', 'air-frying', 'frying'] }
    ]
  },
  {
    id: 'chicken-stock',
    name: 'Chicken Stock',
    category: 'liquids',
    substitutes: [
      { name: 'Vegetable Stock', ratio: '1:1', similarity: 90, suitability: 'Very High', notes: 'Best vegetarian alternative.', dietary: ['vegetarian', 'vegan'], cookingType: ['boiling', 'sauces', 'slow-cooking', 'steaming', 'sauteing', 'meal-prep'] },
      { name: 'Miso Paste + Water', ratio: '1 tbsp : 1 cup', similarity: 85, suitability: 'High', notes: 'Rich umami flavor.', dietary: ['vegan'], cookingType: ['boiling', 'sauces', 'slow-cooking', 'sauteing', 'steaming', 'drinks'] }
    ]
  },
  {
    id: 'ginger-fresh',
    name: 'Fresh Ginger',
    category: 'spices',
    substitutes: [
      { name: 'Ground Ginger', ratio: '1/4 tsp = 1 tbsp fresh', similarity: 75, suitability: 'High', notes: 'More concentrated and less fibrous.', dietary: ['vegan', 'keto'], cookingType: ['baking', 'sauces', 'drinks', 'sauteing', 'steaming', 'meal-prep'] },
      { name: 'Galangal', ratio: '1:1', similarity: 80, suitability: 'Medium', notes: 'Sharper, citrusy flavor.', dietary: ['vegan', 'keto'], cookingType: ['sauces', 'steaming', 'boiling', 'slow-cooking'] }
    ]
  },
  {
    id: 'lemon-juice',
    name: 'Lemon Juice',
    category: 'liquids',
    substitutes: [
      { name: 'Lime Juice', ratio: '1:1', similarity: 95, suitability: 'Very High', notes: 'Same acidity, different flavor.', dietary: ['vegan', 'keto'], cookingType: ['drinks', 'sauces', 'desserts', 'sauteing', 'steaming', 'meal-prep'] },
      { name: 'Apple Cider Vinegar', ratio: '1/2 : 1', similarity: 80, suitability: 'High', notes: 'Good acidity profile.', dietary: ['vegan'], cookingType: ['sauces', 'meal-prep', 'boiling', 'slow-cooking'] }
    ]
  }
];
