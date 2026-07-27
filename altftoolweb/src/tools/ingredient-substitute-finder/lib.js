/**
 * Ingredient substitution database and quantity converter.
 *
 * How the numbers work
 * --------------------
 * Every substitute carries a `ratio`: the amount of replacement needed per 1 unit of the original,
 * in the SAME unit. So butter -> oil has ratio 0.75, meaning 1 cup of butter becomes 3/4 cup of
 * oil. That figure is not arbitrary: butter is roughly 80% fat and 16-18% water, oil is 100% fat,
 * so matching the fat means using about four fifths as much oil, and the standard kitchen rounding
 * of that is three quarters.
 *
 * The other ratios come from the same kind of reasoning, and each one is annotated below:
 *  - Dried herbs are about three times as concentrated as fresh, so the ratio is 1/3.
 *  - Salt substitutions are by crystal size, not by chemistry: a teaspoon of fine table salt weighs
 *    about 6 g, Morton kosher about 4.8 g and Diamond Crystal about 2.8 g, which is where the
 *    1 : 1.25 : 2 volume ratios come from.
 *  - Buttermilk, self-raising flour and cake flour are recipes, not swaps, so they carry a
 *    `preparation` string rather than a single ingredient name.
 *
 * Amounts are snapped to the fractions a measuring spoon can actually show (eighths, plus thirds),
 * because "0.417 cups" is not a usable instruction.
 *
 * Everything here is pure. No DOM, no React, no dates.
 */

/** Fractions a standard set of cups and spoons can measure. */
export const KITCHEN_FRACTIONS = [
  { value: 0, label: "" },
  { value: 1 / 8, label: "1/8" },
  { value: 1 / 4, label: "1/4" },
  { value: 1 / 3, label: "1/3" },
  { value: 3 / 8, label: "3/8" },
  { value: 1 / 2, label: "1/2" },
  { value: 5 / 8, label: "5/8" },
  { value: 2 / 3, label: "2/3" },
  { value: 3 / 4, label: "3/4" },
  { value: 7 / 8, label: "7/8" },
  { value: 1, label: "" },
];

/** Dietary filters a substitute can satisfy. */
export const DIET_FILTERS = [
  { id: "any", label: "No filter" },
  { id: "vegan", label: "Vegan" },
  { id: "dairy-free", label: "Dairy free" },
  { id: "egg-free", label: "Egg free" },
  { id: "gluten-free", label: "Gluten free" },
  { id: "nut-free", label: "Nut free" },
];

/**
 * The substitution table. `ratio` is replacement units per 1 unit of the original.
 * `tags` are the diets a substitute is compatible with. `bestFor` says where it holds up.
 */
export const SUBSTITUTIONS = [
  {
    id: "butter",
    ingredient: "Butter",
    aliases: ["unsalted butter", "salted butter"],
    defaultUnit: "cup",
    substitutes: [
      {
        name: "Neutral vegetable oil",
        ratio: 0.75,
        tags: ["vegan", "dairy-free", "egg-free", "gluten-free", "nut-free"],
        bestFor: ["Cakes", "Muffins", "Quick breads"],
        note: "Butter is about 80% fat and oil is 100%, so three quarters of the volume matches the fat. Do not use it where the butter has to be creamed with sugar.",
      },
      {
        name: "Solid coconut oil",
        ratio: 1,
        tags: ["vegan", "dairy-free", "egg-free", "gluten-free", "nut-free"],
        bestFor: ["Pastry", "Cookies", "Frosting"],
        note: "Solid at room temperature like butter, so it still creams. Refined coconut oil keeps the flavour neutral.",
      },
      {
        name: "Greek yogurt",
        ratio: 0.5,
        tags: ["vegetarian", "egg-free", "gluten-free", "nut-free"],
        bestFor: ["Muffins", "Cakes"],
        note: "Replace only half the butter — going further makes the crumb rubbery because you are removing fat and adding water.",
      },
    ],
  },
  {
    id: "egg",
    ingredient: "Egg",
    aliases: ["eggs", "whole egg", "large egg"],
    defaultUnit: "egg",
    substitutes: [
      {
        name: "Ground flaxseed + water",
        ratio: 1,
        preparation: "1 tbsp ground flaxseed whisked with 3 tbsp water per egg, left 5 minutes to gel",
        tags: ["vegan", "dairy-free", "egg-free", "gluten-free", "nut-free"],
        bestFor: ["Cookies", "Brownies", "Pancakes"],
        note: "Works as a binder, not as a leavener. Adds a faint nutty colour, so it suits darker bakes.",
      },
      {
        name: "Aquafaba (chickpea tin liquid)",
        ratio: 1,
        preparation: "3 tbsp aquafaba per whole egg, or 2 tbsp per egg white",
        tags: ["vegan", "dairy-free", "egg-free", "gluten-free", "nut-free"],
        bestFor: ["Meringue", "Mousse", "Macarons"],
        note: "The only common vegan swap that whips to stiff peaks, because the chickpea proteins and starches foam like albumen.",
      },
      {
        name: "Unsweetened applesauce",
        ratio: 1,
        preparation: "1/4 cup applesauce per egg",
        tags: ["vegan", "dairy-free", "egg-free", "gluten-free", "nut-free"],
        bestFor: ["Cakes", "Muffins"],
        note: "Adds moisture but no structure — do not use for more than two eggs in one recipe.",
      },
    ],
  },
  {
    id: "buttermilk",
    ingredient: "Buttermilk",
    aliases: ["cultured buttermilk"],
    defaultUnit: "cup",
    substitutes: [
      {
        name: "Milk soured with lemon juice",
        ratio: 1,
        preparation: "1 tbsp lemon juice or white vinegar topped up to 1 cup with milk, left 5 minutes to curdle",
        tags: ["vegetarian", "egg-free", "gluten-free", "nut-free"],
        bestFor: ["Pancakes", "Scones", "Soda bread"],
        note: "The acid is the point: it reacts with baking soda for lift and tenderises gluten.",
      },
      {
        name: "Plain yogurt thinned with milk",
        ratio: 1,
        preparation: "3/4 cup yogurt whisked with 1/4 cup milk per cup",
        tags: ["vegetarian", "egg-free", "gluten-free", "nut-free"],
        bestFor: ["Cakes", "Marinades"],
        note: "Similar acidity and thicker body, so batters hold air a little better.",
      },
      {
        name: "Soy milk soured with vinegar",
        ratio: 1,
        preparation: "1 tbsp cider vinegar topped up to 1 cup with unsweetened soy milk",
        tags: ["vegan", "dairy-free", "egg-free", "gluten-free", "nut-free"],
        bestFor: ["Pancakes", "Vegan cakes"],
        note: "Soy curdles more convincingly than oat or almond because of its protein content.",
      },
    ],
  },
  {
    id: "baking-powder",
    ingredient: "Baking powder",
    aliases: ["double acting baking powder"],
    defaultUnit: "tsp",
    substitutes: [
      {
        name: "Baking soda + cream of tartar",
        ratio: 1,
        preparation: "1/4 tsp baking soda plus 1/2 tsp cream of tartar per teaspoon",
        tags: ["vegan", "dairy-free", "egg-free", "gluten-free", "nut-free"],
        bestFor: ["Any bake"],
        note: "Baking powder is exactly this — an alkali plus a dry acid. Mix it in at the last moment because it is single acting and starts working on contact with liquid.",
      },
      {
        name: "Baking soda + buttermilk",
        ratio: 1,
        preparation: "1/4 tsp baking soda per teaspoon, replacing 1/2 cup of the recipe's liquid with buttermilk",
        tags: ["vegetarian", "egg-free", "gluten-free", "nut-free"],
        bestFor: ["Pancakes", "Muffins"],
        note: "You must reduce the other liquid by the same amount or the batter will be too loose.",
      },
    ],
  },
  {
    id: "self-raising-flour",
    ingredient: "Self-raising flour",
    aliases: ["self rising flour", "self-rising flour"],
    defaultUnit: "cup",
    substitutes: [
      {
        name: "Plain flour + baking powder + salt",
        ratio: 1,
        preparation: "1 cup plain flour plus 1 1/2 tsp baking powder plus 1/4 tsp salt",
        tags: ["vegan", "dairy-free", "egg-free", "nut-free"],
        bestFor: ["Scones", "Victoria sponge", "Pancakes"],
        note: "This is the commercial formula. Whisk it thoroughly or you will get bitter pockets of powder.",
      },
    ],
  },
  {
    id: "cake-flour",
    ingredient: "Cake flour",
    aliases: ["soft flour", "low protein flour"],
    defaultUnit: "cup",
    substitutes: [
      {
        name: "Plain flour + cornflour",
        ratio: 1,
        preparation: "Take 1 cup plain flour, remove 2 tbsp, add 2 tbsp cornflour, then sift twice",
        tags: ["vegan", "dairy-free", "egg-free", "nut-free"],
        bestFor: ["Sponge", "Chiffon cake", "Cupcakes"],
        note: "Cornflour is pure starch, so swapping 2 tbsp of it in drops the protein from about 11% to roughly 9%, which is what makes cake flour tender.",
      },
    ],
  },
  {
    id: "heavy-cream",
    ingredient: "Heavy cream",
    aliases: ["double cream", "whipping cream"],
    defaultUnit: "cup",
    substitutes: [
      {
        name: "Milk + melted butter",
        ratio: 1,
        preparation: "3/4 cup whole milk whisked into 1/3 cup melted butter",
        tags: ["vegetarian", "egg-free", "gluten-free", "nut-free"],
        bestFor: ["Sauces", "Soups", "Ganache"],
        note: "Matches the fat for cooking, but it will not whip — there is no intact fat globule structure to trap air.",
      },
      {
        name: "Full-fat coconut milk",
        ratio: 1,
        tags: ["vegan", "dairy-free", "egg-free", "gluten-free", "nut-free"],
        bestFor: ["Curries", "Vegan ganache", "Whipped topping"],
        note: "Chill the tin overnight and use only the solid cream on top if you need it to whip.",
      },
      {
        name: "Evaporated milk",
        ratio: 1,
        tags: ["vegetarian", "egg-free", "gluten-free", "nut-free"],
        bestFor: ["Soups", "Baked custards"],
        note: "Much lower fat, so sauces will be thinner and can split if boiled hard.",
      },
    ],
  },
  {
    id: "sour-cream",
    ingredient: "Sour cream",
    aliases: ["soured cream", "creme fraiche"],
    defaultUnit: "cup",
    substitutes: [
      {
        name: "Full-fat plain yogurt",
        ratio: 1,
        tags: ["vegetarian", "egg-free", "gluten-free", "nut-free"],
        bestFor: ["Baking", "Dips", "Toppings"],
        note: "Straight one-for-one. Use full fat — low-fat yogurt splits when heated.",
      },
      {
        name: "Blended cottage cheese + lemon juice",
        ratio: 1,
        preparation: "1 cup cottage cheese blended smooth with 1 tbsp lemon juice",
        tags: ["vegetarian", "egg-free", "gluten-free", "nut-free"],
        bestFor: ["Dips", "Cheesecake"],
        note: "Far higher in protein and lower in fat, so it browns faster.",
      },
    ],
  },
  {
    id: "cornflour",
    ingredient: "Cornflour",
    aliases: ["cornstarch", "corn starch"],
    defaultUnit: "tbsp",
    substitutes: [
      {
        name: "Plain flour",
        ratio: 2,
        tags: ["vegan", "dairy-free", "egg-free", "nut-free"],
        bestFor: ["Gravy", "Stews", "Pie fillings"],
        note: "Flour thickens at about half the strength of pure starch, so you need twice as much, and it must simmer a couple of minutes to lose the raw taste.",
      },
      {
        name: "Arrowroot",
        ratio: 1,
        tags: ["vegan", "dairy-free", "egg-free", "gluten-free", "nut-free"],
        bestFor: ["Clear glazes", "Acidic fruit fillings"],
        note: "One for one, sets clear rather than cloudy, and unlike cornflour it tolerates acid. Do not boil it hard or it thins out again.",
      },
      {
        name: "Tapioca starch",
        ratio: 1.5,
        tags: ["vegan", "dairy-free", "egg-free", "gluten-free", "nut-free"],
        bestFor: ["Fruit pies", "Freezer-bound sauces"],
        note: "Slightly weaker than cornflour and stays stable through freezing and thawing.",
      },
    ],
  },
  {
    id: "brown-sugar",
    ingredient: "Brown sugar",
    aliases: ["light brown sugar", "dark brown sugar", "muscovado"],
    defaultUnit: "cup",
    substitutes: [
      {
        name: "White sugar + molasses",
        ratio: 1,
        preparation: "1 cup granulated sugar mixed with 1 tbsp molasses for light, 2 tbsp for dark",
        tags: ["vegan", "dairy-free", "egg-free", "gluten-free", "nut-free"],
        bestFor: ["Cookies", "Sauces", "Marinades"],
        note: "This is literally how brown sugar is made commercially — refined sugar with molasses added back.",
      },
      {
        name: "Granulated white sugar",
        ratio: 1,
        tags: ["vegan", "dairy-free", "egg-free", "gluten-free", "nut-free"],
        bestFor: ["Cakes"],
        note: "Same sweetness, but you lose the molasses moisture, so cookies spread more and go crisper.",
      },
    ],
  },
  {
    id: "honey",
    ingredient: "Honey",
    aliases: ["runny honey"],
    defaultUnit: "cup",
    substitutes: [
      {
        name: "Maple syrup",
        ratio: 1,
        tags: ["vegan", "dairy-free", "egg-free", "gluten-free", "nut-free"],
        bestFor: ["Granola", "Dressings", "Cakes"],
        note: "One for one, slightly less sweet and thinner. Both are invert sugars, so browning behaves the same.",
      },
      {
        name: "Granulated sugar + water",
        ratio: 1.25,
        preparation: "1 1/4 cup sugar dissolved in 1/4 cup extra liquid per cup of honey",
        tags: ["vegan", "dairy-free", "egg-free", "gluten-free", "nut-free"],
        bestFor: ["Baking"],
        note: "Honey is about 17% water and sweeter than sucrose, so you add sugar and put the water back. Raise the oven temperature by about 15°C compared with a honey bake, which browns fast.",
      },
    ],
  },
  {
    id: "fresh-herbs",
    ingredient: "Fresh herbs",
    aliases: ["fresh basil", "fresh thyme", "fresh oregano", "fresh parsley"],
    defaultUnit: "tbsp",
    substitutes: [
      {
        name: "Dried herbs",
        ratio: 1 / 3,
        tags: ["vegan", "dairy-free", "egg-free", "gluten-free", "nut-free"],
        bestFor: ["Stews", "Braises", "Rubs"],
        note: "Drying concentrates the volatile oils about threefold, so use a third as much and add it early so it can rehydrate.",
      },
    ],
  },
  {
    id: "garlic-clove",
    ingredient: "Garlic clove",
    aliases: ["fresh garlic", "garlic"],
    defaultUnit: "clove",
    substitutes: [
      {
        name: "Garlic powder",
        ratio: 0.125,
        resultUnit: "tsp",
        tags: ["vegan", "dairy-free", "egg-free", "gluten-free", "nut-free"],
        bestFor: ["Rubs", "Dressings", "Soups"],
        note: "One clove is about 1/8 tsp of powder. Powder has no allicin bite, so it tastes rounder and less pungent.",
      },
      {
        name: "Granulated garlic",
        ratio: 0.25,
        resultUnit: "tsp",
        tags: ["vegan", "dairy-free", "egg-free", "gluten-free", "nut-free"],
        bestFor: ["Rubs", "Marinades"],
        note: "Coarser than powder, so it takes twice the volume for the same punch and disperses more slowly.",
      },
    ],
  },
  {
    id: "table-salt",
    ingredient: "Table salt",
    aliases: ["fine salt", "iodised salt"],
    defaultUnit: "tsp",
    substitutes: [
      {
        name: "Morton kosher salt",
        ratio: 1.25,
        tags: ["vegan", "dairy-free", "egg-free", "gluten-free", "nut-free"],
        bestFor: ["Seasoning", "Brines"],
        note: "A teaspoon of table salt weighs about 6 g against 4.8 g of Morton kosher, so you need a quarter more by volume for the same saltiness.",
      },
      {
        name: "Diamond Crystal kosher salt",
        ratio: 2,
        tags: ["vegan", "dairy-free", "egg-free", "gluten-free", "nut-free"],
        bestFor: ["Seasoning", "Curing"],
        note: "Its hollow flakes are far less dense — about 2.8 g per teaspoon — so it takes roughly double the volume.",
      },
    ],
  },
  {
    id: "soy-sauce",
    ingredient: "Soy sauce",
    aliases: ["light soy sauce", "shoyu"],
    defaultUnit: "tbsp",
    substitutes: [
      {
        name: "Tamari",
        ratio: 1,
        tags: ["vegan", "dairy-free", "egg-free", "gluten-free", "nut-free"],
        bestFor: ["Stir-fries", "Dipping sauces", "Marinades"],
        note: "Brewed with little or no wheat, so it is the direct gluten-free swap. Slightly rounder and less sharp.",
      },
      {
        name: "Coconut aminos",
        ratio: 1.5,
        tags: ["vegan", "dairy-free", "egg-free", "gluten-free", "nut-free"],
        bestFor: ["Dressings", "Glazes"],
        note: "Much less salty and noticeably sweeter, so use about half again as much and cut any added sugar.",
      },
    ],
  },
  {
    id: "breadcrumbs",
    ingredient: "Breadcrumbs",
    aliases: ["dried breadcrumbs", "panko"],
    defaultUnit: "cup",
    substitutes: [
      {
        name: "Rolled oats, pulsed",
        ratio: 1,
        tags: ["vegan", "dairy-free", "egg-free", "nut-free"],
        bestFor: ["Meatballs", "Meatloaf", "Burgers"],
        note: "Binds just as well inside a mixture. Use certified gluten-free oats if that matters.",
      },
      {
        name: "Crushed cornflakes",
        ratio: 1,
        tags: ["vegan", "dairy-free", "egg-free", "nut-free"],
        bestFor: ["Coatings", "Crumb toppings"],
        note: "Crisper and browns faster, so drop the oven by about 10°C when coating.",
      },
      {
        name: "Ground almonds",
        ratio: 1,
        tags: ["vegan", "dairy-free", "egg-free", "gluten-free"],
        bestFor: ["Low-carb coatings"],
        note: "Contains no gluten and no starch, so it browns quickly and will not crisp the same way.",
      },
    ],
  },
  {
    id: "milk",
    ingredient: "Milk",
    aliases: ["whole milk", "dairy milk"],
    defaultUnit: "cup",
    substitutes: [
      {
        name: "Unsweetened oat milk",
        ratio: 1,
        tags: ["vegan", "dairy-free", "egg-free", "nut-free"],
        bestFor: ["Baking", "Sauces", "Coffee"],
        note: "Closest body of the plant milks because of its dissolved starch. Check the label if you need gluten free.",
      },
      {
        name: "Unsweetened soy milk",
        ratio: 1,
        tags: ["vegan", "dairy-free", "egg-free", "gluten-free", "nut-free"],
        bestFor: ["Baking", "Custards"],
        note: "The highest protein plant milk, so it browns and sets more like dairy.",
      },
      {
        name: "Evaporated milk + water",
        ratio: 1,
        preparation: "1/2 cup evaporated milk plus 1/2 cup water per cup",
        tags: ["vegetarian", "egg-free", "gluten-free", "nut-free"],
        bestFor: ["Baking", "Sauces"],
        note: "Evaporated milk is milk with about 60% of the water removed, so diluting it half and half rebuilds ordinary milk.",
      },
    ],
  },
  {
    id: "mayonnaise",
    ingredient: "Mayonnaise",
    aliases: ["mayo"],
    defaultUnit: "cup",
    substitutes: [
      {
        name: "Greek yogurt",
        ratio: 1,
        tags: ["vegetarian", "egg-free", "gluten-free", "nut-free"],
        bestFor: ["Salad dressings", "Slaws", "Dips"],
        note: "Tangier and far lower in fat. Do not use it in anything that gets baked hot or it will split.",
      },
      {
        name: "Mashed avocado",
        ratio: 1,
        tags: ["vegan", "dairy-free", "egg-free", "gluten-free", "nut-free"],
        bestFor: ["Sandwiches", "Egg-free salads"],
        note: "Similar fat and creaminess. Add lemon juice or it browns within the hour.",
      },
    ],
  },
  {
    id: "wine",
    ingredient: "Wine for cooking",
    aliases: ["white wine", "red wine", "cooking wine"],
    defaultUnit: "cup",
    substitutes: [
      {
        name: "Stock + vinegar",
        ratio: 1,
        preparation: "1 cup stock plus 1 tbsp wine vinegar or lemon juice",
        tags: ["egg-free", "gluten-free", "nut-free"],
        bestFor: ["Deglazing", "Braises", "Risotto"],
        note: "Wine contributes acid and savoury depth, not alcohol flavour, so acid plus stock covers both.",
      },
      {
        name: "White grape juice + vinegar",
        ratio: 1,
        preparation: "1 cup unsweetened white grape juice plus 1 tbsp cider vinegar",
        tags: ["vegan", "dairy-free", "egg-free", "gluten-free", "nut-free"],
        bestFor: ["Pan sauces", "Poaching fruit"],
        note: "Sweeter than wine, so cut any other sugar in the recipe.",
      },
    ],
  },
  {
    id: "lemon-juice",
    ingredient: "Lemon juice",
    aliases: ["fresh lemon juice"],
    defaultUnit: "tbsp",
    substitutes: [
      {
        name: "White wine vinegar",
        ratio: 1,
        tags: ["vegan", "dairy-free", "egg-free", "gluten-free", "nut-free"],
        bestFor: ["Dressings", "Curdling milk", "Deglazing"],
        note: "Similar acidity — lemon juice runs about 5-6% citric acid, table vinegar about 5% acetic — so one for one works wherever the acid, not the citrus flavour, is the point.",
      },
      {
        name: "Lime juice",
        ratio: 1,
        tags: ["vegan", "dairy-free", "egg-free", "gluten-free", "nut-free"],
        bestFor: ["Marinades", "Dressings", "Drinks"],
        note: "Interchangeable acidity, more floral and bitter, which suits chilli and coriander dishes.",
      },
    ],
  },
  {
    id: "tomato-sauce",
    ingredient: "Tomato sauce",
    aliases: ["passata", "tomato puree"],
    defaultUnit: "cup",
    substitutes: [
      {
        name: "Tomato paste + water",
        ratio: 1,
        preparation: "1/2 cup tomato paste whisked with 1/2 cup water per cup",
        tags: ["vegan", "dairy-free", "egg-free", "gluten-free", "nut-free"],
        bestFor: ["Pasta sauce", "Stews", "Pizza base"],
        note: "Tomato paste is roughly double-strength sauce, so half paste and half water rebuilds it. Season it — paste has no salt or aromatics.",
      },
      {
        name: "Tinned chopped tomatoes, blended",
        ratio: 1,
        tags: ["vegan", "dairy-free", "egg-free", "gluten-free", "nut-free"],
        bestFor: ["Sauces", "Soups"],
        note: "Thinner and fresher tasting. Simmer 10 minutes to reduce it to sauce consistency.",
      },
    ],
  },
  {
    id: "vanilla-extract",
    ingredient: "Vanilla extract",
    aliases: ["vanilla essence"],
    defaultUnit: "tsp",
    substitutes: [
      {
        name: "Vanilla bean paste",
        ratio: 1,
        tags: ["vegan", "dairy-free", "egg-free", "gluten-free", "nut-free"],
        bestFor: ["Custards", "Ice cream", "Frosting"],
        note: "One for one and it brings visible seeds, which is why it suits pale desserts.",
      },
      {
        name: "Maple syrup",
        ratio: 1,
        tags: ["vegan", "dairy-free", "egg-free", "gluten-free", "nut-free"],
        bestFor: ["Cookies", "Oat bakes"],
        note: "Not a flavour match, but it fills the same warm, sweet role in a bake. Reduce the recipe's other liquid a touch.",
      },
    ],
  },
  {
    id: "plain-flour",
    ingredient: "Plain flour",
    aliases: ["all purpose flour", "all-purpose flour", "maida"],
    defaultUnit: "cup",
    substitutes: [
      {
        name: "Gluten-free 1:1 baking blend",
        ratio: 1,
        tags: ["vegan", "dairy-free", "egg-free", "gluten-free", "nut-free"],
        bestFor: ["Cakes", "Cookies", "Muffins"],
        note: "Only blends that already contain xanthan gum swap one for one. Without a binder the crumb falls apart.",
      },
      {
        name: "Wholemeal flour",
        ratio: 1,
        tags: ["vegan", "dairy-free", "egg-free", "nut-free"],
        bestFor: ["Breads", "Muffins"],
        note: "The bran soaks up more water, so add about 2 tsp extra liquid per cup and expect a denser crumb. Swapping half is safer than all.",
      },
    ],
  },
  {
    id: "ricotta",
    ingredient: "Ricotta",
    aliases: ["ricotta cheese"],
    defaultUnit: "cup",
    substitutes: [
      {
        name: "Blended cottage cheese",
        ratio: 1,
        tags: ["vegetarian", "egg-free", "gluten-free", "nut-free"],
        bestFor: ["Lasagne", "Stuffed pasta", "Cheesecake"],
        note: "Blend it smooth and drain it first — cottage cheese carries more free water than ricotta.",
      },
      {
        name: "Firm tofu, crumbled",
        ratio: 1,
        tags: ["vegan", "dairy-free", "egg-free", "gluten-free", "nut-free"],
        bestFor: ["Vegan lasagne", "Fillings"],
        note: "Press out the water, then mash with lemon juice, salt and a little nutritional yeast to get the tang.",
      },
    ],
  },
];

const isBadNumber = (value) => typeof value !== "number" || !Number.isFinite(value);

/**
 * Snap a decimal amount to something a measuring cup can show, e.g. 0.75 -> "3/4", 1.33 -> "1 1/3".
 * @param {number} value
 * @returns {string}
 */
export function toKitchenAmount(value) {
  if (isBadNumber(value) || value < 0) return "—";
  if (value === 0) return "0";
  if (value >= 10) return String(Math.round(value));

  const whole = Math.floor(value);
  const remainder = value - whole;
  let best = KITCHEN_FRACTIONS[0];
  let bestDistance = Infinity;
  for (const fraction of KITCHEN_FRACTIONS) {
    const distance = Math.abs(fraction.value - remainder);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = fraction;
    }
  }

  const carry = best.value === 1 ? 1 : 0;
  const wholePart = whole + carry;
  const fractionLabel = carry === 1 ? "" : best.label;

  if (wholePart === 0 && fractionLabel === "") return "a pinch";
  if (fractionLabel === "") return String(wholePart);
  if (wholePart === 0) return fractionLabel;
  return `${wholePart} ${fractionLabel}`;
}

/** Find ingredients whose name or an alias contains the query. Empty query returns everything. */
export function searchIngredients(query) {
  const needle = String(query || "").trim().toLowerCase();
  if (needle === "") return SUBSTITUTIONS;
  return SUBSTITUTIONS.filter(
    (entry) =>
      entry.ingredient.toLowerCase().includes(needle) ||
      entry.aliases.some((alias) => alias.includes(needle)),
  );
}

/**
 * Look up substitutes for one ingredient and scale them to the amount asked for.
 *
 * @param {object} input
 * @param {string} input.ingredientId  An id from SUBSTITUTIONS.
 * @param {number} input.quantity      How much the recipe calls for.
 * @param {string} [input.unit]        Display unit; defaults to the entry's own unit.
 * @param {string} [input.diet]        A DIET_FILTERS id, or "any".
 * @returns {object} matches and metadata, or { error }.
 */
export function findSubstitutes(input = {}) {
  const { ingredientId, quantity, unit, diet = "any" } = input;

  const entry = SUBSTITUTIONS.find((item) => item.id === ingredientId);
  if (!entry) {
    return { error: "Choose an ingredient from the list to see its replacements." };
  }
  if (isBadNumber(quantity)) {
    return { error: "Enter how much the recipe calls for." };
  }
  if (quantity <= 0) {
    return { error: "The amount must be greater than zero." };
  }
  if (quantity > 1000) {
    return { error: "That amount is beyond household scale — enter 1000 or less." };
  }

  const displayUnit = unit || entry.defaultUnit;
  const filtered =
    diet === "any"
      ? entry.substitutes
      : entry.substitutes.filter((substitute) => substitute.tags.includes(diet));

  if (filtered.length === 0) {
    const dietLabel = DIET_FILTERS.find((item) => item.id === diet)?.label || diet;
    return {
      error: `No ${dietLabel.toLowerCase()} replacement for ${entry.ingredient.toLowerCase()} is listed here. Clear the filter to see the rest.`,
    };
  }

  const matches = filtered.map((substitute) => {
    const amount = quantity * substitute.ratio;
    // A substitute measured in a different unit carries its own, e.g. cloves of garlic -> tsp.
    const substituteUnit = substitute.resultUnit || displayUnit;
    const plural =
      amount > 1 && substituteUnit !== "tsp" && substituteUnit !== "tbsp" ? "s" : "";
    return {
      name: substitute.name,
      ratio: substitute.ratio,
      unit: substituteUnit,
      amount: Math.round((amount + Number.EPSILON) * 1000) / 1000,
      amountLabel: `${toKitchenAmount(amount)} ${substituteUnit}${plural}`.trim(),
      preparation: substitute.preparation || "",
      bestFor: substitute.bestFor,
      note: substitute.note,
      tags: substitute.tags,
    };
  });

  return {
    ingredient: entry.ingredient,
    unit: displayUnit,
    quantity,
    diet,
    matches,
    best: matches[0],
    count: matches.length,
  };
}
