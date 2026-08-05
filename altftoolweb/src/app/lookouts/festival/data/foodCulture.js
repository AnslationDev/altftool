// "Festival Foods & Culture" spotlight strip on the hub page.
// Each entry links back to a real festival + country in data/festivals.js.

// A note on `unsplashQuery`: Unsplash ANDs the terms, so a long specific
// phrase usually matches nothing and the card silently drops to the low-res
// Wikipedia fallback — "modak sweet dumpling indian" returned zero results
// where "modak" alone returns the dish. Keep these short, and check the
// search endpoint before lengthening one.
//
// Songpyeon is the deliberate exception: Unsplash has no photo of it at all
// (the top hit for "songpyeon" is neon signage), so it is left to resolve
// through the Wikipedia fallback, which has a real one. An accurate image
// beats a sharper irrelevant one.
export const FOOD_CULTURE = [
  { food: "Modak", festivalSlug: "ganesh-chaturthi", countryCode: "IN", unsplashQuery: "modak" },
  { food: "Mooncake", festivalSlug: "mid-autumn-festival", countryCode: "CN", unsplashQuery: "mooncake mid autumn festival" },
  { food: "Sufganiyot", festivalSlug: "hanukkah", countryCode: "IL", unsplashQuery: "sufganiyot hanukkah donuts" },
  { food: "King Cake", festivalSlug: "mardi-gras", countryCode: "US", unsplashQuery: "king cake mardi gras" },
  { food: "Zongzi", festivalSlug: "dragon-boat-festival", countryCode: "CN", unsplashQuery: "zongzi rice dumpling" },
  { food: "Hamantaschen", festivalSlug: "purim", countryCode: "IL", unsplashQuery: "hamantaschen purim pastry" },
  { food: "Songpyeon", festivalSlug: "chuseok", countryCode: "KR", unsplashQuery: "songpyeon korean rice cake" },
  { food: "Pan de Muerto", festivalSlug: "day-of-the-dead", countryCode: "MX", unsplashQuery: "pan de muerto bread" },
  { food: "Gulab Jamun", festivalSlug: "diwali", countryCode: "IN", unsplashQuery: "gulab jamun sweet dessert" },
  { food: "Latkes", festivalSlug: "hanukkah", countryCode: "IL", unsplashQuery: "latkes potato pancakes" },
];
