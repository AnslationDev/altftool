export const CUISINES = [
  { id: "italian", name: "Italian", emoji: "🍝", color: "text-green-600", bg: "bg-green-50 dark:bg-green-900/20" },
  { id: "japanese", name: "Japanese", emoji: "🍣", color: "text-red-500", bg: "bg-red-50 dark:bg-red-900/20" },
  { id: "mexican", name: "Mexican", emoji: "🌮", color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-900/20" },
  { id: "indian", name: "Indian", emoji: "🍛", color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-900/20" },
  { id: "chinese", name: "Chinese", emoji: "🥟", color: "text-red-600", bg: "bg-red-50 dark:bg-red-900/20" },
  { id: "american", name: "American", emoji: "🍔", color: "text-yellow-600", bg: "bg-yellow-50 dark:bg-yellow-900/20" },
  { id: "mediterranean", name: "Mediterranean", emoji: "🥙", color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
  { id: "korean", name: "Korean", emoji: "🥘", color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-900/20" },
  { id: "thai", name: "Thai", emoji: "🍜", color: "text-pink-600", bg: "bg-pink-50 dark:bg-pink-900/20" },
  { id: "french", name: "French", emoji: "🥐", color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20" },
];

export const BUDGET_OPTIONS = [
  { id: "budget", name: "Budget", icon: "💰" },
  { id: "moderate", name: "Moderate", icon: "💵" },
  { id: "premium", name: "Premium", icon: "💎" },
];

export const MEAL_TYPES = [
  { id: "veg", name: "Vegetarian", icon: "🥦" },
  { id: "nonveg", name: "Non-Veg", icon: "🍗" },
  { id: "fastfood", name: "Fast Food", icon: "🍟" },
  { id: "healthy", name: "Healthy", icon: "🥗" },
  { id: "street", name: "Street Food", icon: "🌯" },
];

export const RESTAURANTS = [
  { name: "The Green Bowl", cuisine: "healthy", budget: "moderate", type: "veg", rating: 4.5 },
  { name: "Sakura Sushi", cuisine: "japanese", budget: "premium", type: "nonveg", rating: 4.8 },
  { name: "El Mariachi", cuisine: "mexican", budget: "moderate", type: "nonveg", rating: 4.3 },
  { name: "Taj Mahal Palace", cuisine: "indian", budget: "premium", type: "nonveg", rating: 4.7 },
  { name: "Golden Dragon", cuisine: "chinese", budget: "moderate", type: "nonveg", rating: 4.2 },
  { name: "Burger Republic", cuisine: "american", budget: "budget", type: "fastfood", rating: 4.0 },
  { name: "Olive Garden", cuisine: "italian", budget: "moderate", type: "veg", rating: 4.4 },
  { name: "Pita Paradise", cuisine: "mediterranean", budget: "moderate", type: "veg", rating: 4.6 },
  { name: "Seoul BBQ", cuisine: "korean", budget: "premium", type: "nonveg", rating: 4.9 },
  { name: "Bangkok Street", cuisine: "thai", budget: "budget", type: "street", rating: 4.1 },
  { name: "Le Petit Bistro", cuisine: "french", budget: "premium", type: "nonveg", rating: 4.8 },
  { name: "Fresh Harvest", cuisine: "healthy", budget: "moderate", type: "healthy", rating: 4.5 },
  { name: "Taco Stand", cuisine: "mexican", budget: "budget", type: "street", rating: 4.2 },
  { name: "Ramen House", cuisine: "japanese", budget: "moderate", type: "nonveg", rating: 4.3 },
  { name: "Paneer Paradise", cuisine: "indian", budget: "moderate", type: "veg", rating: 4.4 },
  { name: "Pizza Express", cuisine: "italian", budget: "moderate", type: "fastfood", rating: 4.1 },
  { name: "Dim Sum Palace", cuisine: "chinese", budget: "moderate", type: "nonveg", rating: 4.3 },
  { name: "Veggie Delight", cuisine: "healthy", budget: "budget", type: "veg", rating: 4.0 },
  { name: "Falafel King", cuisine: "mediterranean", budget: "budget", type: "veg", rating: 4.2 },
  { name: "Korean Fried Chicken", cuisine: "korean", budget: "moderate", type: "fastfood", rating: 4.6 },
  { name: "Pad Thai Corner", cuisine: "thai", budget: "budget", type: "street", rating: 4.1 },
  { name: "Croissant Cafe", cuisine: "french", budget: "moderate", type: "veg", rating: 4.3 },
  { name: "Salad Lab", cuisine: "healthy", budget: "moderate", type: "healthy", rating: 4.2 },
  { name: "Steakhouse Prime", cuisine: "american", budget: "premium", type: "nonveg", rating: 4.7 },
];

export const TRUTHS = {
  easy: [
    "What is your favorite food?",
    "What is your dream job?",
    "What is your favorite movie?",
    "What is your hobby?",
    "What is your favorite color?",
    "Where would you love to travel?",
    "What is your favorite song?",
    "Who is your role model?",
    "What is your favorite book?",
    "What makes you happy?",
  ],
  medium: [
    "What is the most embarrassing thing you've done?",
    "What is your biggest fear?",
    "What is a secret you've never told anyone?",
    "What was your worst date ever?",
    "What is the weirdest food you like?",
    "Have you ever lied to your best friend?",
    "What is your guilty pleasure?",
    "What is the worst gift you've received?",
    "What is something you're insecure about?",
    "What was your most awkward moment?",
  ],
  hard: [
    "What is the biggest mistake you've made?",
    "Have you ever broken someone's heart?",
    "What is something you've done that you regret?",
    "What is the biggest risk you've taken?",
    "Have you ever cheated on a test?",
    "What is the worst thing you've said to someone?",
    "What is a secret you've kept from your family?",
    "What is your biggest regret in life?",
    "Have you ever stolen anything?",
    "What is the most trouble you've been in?",
  ],
};

export const DARES = {
  easy: [
    "Do 10 pushups!",
    "Sing a song for 30 seconds!",
    "Speak in an accent for 1 minute!",
    "Do your best dance move!",
    "Make a funny face and hold it!",
    "Hop on one foot for 30 seconds!",
    "Say the alphabet backwards!",
    "Act like your favorite animal!",
    "Compliment everyone in the room!",
    "Do 5 cartwheels!",
  ],
  medium: [
    "Let someone write on your face!",
    "Talk without closing your mouth for 1 minute!",
    "Do your best celebrity impression!",
    "Eat a spoonful of hot sauce!",
    "Sing the national anthem loudly!",
    "Act out a movie scene for 1 minute!",
    "Let someone go through your phone for 30 seconds!",
    "Do a dramatic reading of a text message!",
    "Wear your shirt backwards for 3 rounds!",
    "Make up a rap about the person to your left!",
  ],
  hard: [
    "Post an embarrassing photo on social media!",
    "Let the group choose your profile picture for 24 hours!",
    "Do a TikTok dance in public!",
    "Call a friend and sing to them!",
    "Let someone draw on your face with a marker!",
    "Do 50 pushups in 2 minutes!",
    "Exchange an item of clothing with someone!",
    "Tell an embarrassing story in detail!",
    "Let the group pick your next meal!",
    "Do a handstand against the wall for 30 seconds!",
  ],
};

export const MODE_PACKS = {
  family: { label: "Family Friendly", desc: "Safe for all ages" },
  friends: { label: "Friends", desc: "Classic party fun" },
  party: { label: "Party", desc: "Wild and crazy" },
  office: { label: "Office Icebreaker", desc: "Professional fun" },
};

export function generateId() {
  return Math.random().toString(36).substring(2, 10);
}
