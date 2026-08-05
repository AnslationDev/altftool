/**
 * Top 49 — category groups.
 * Seven groups partition all 49 categories with no overlap and no gaps.
 */

/**
 * @typedef {Object} Group
 * @property {string} slug
 * @property {string} name
 * @property {string} blurb        Short label used on cards
 * @property {string} description  Long-form copy for group headers
 * @property {string} image        Unsplash photo id
 * @property {string[]} categorySlugs
 */

/** @type {Group[]} */
export const groups = [
  {
    slug: 'entertainment',
    name: 'Entertainment',
    blurb: 'Film, television, music, games and the stories in between.',
    description:
      'Everything made to be watched, played, read or listened to. Our entertainment rankings weight critical consensus against audience response and lasting cultural footprint, so a film that shaped a genre outranks one that merely topped a weekend.',
    image: '1489599849927-2ee91cede3ba',
    categorySlugs: [
      'movies',
      'tv-shows',
      'celebrities',
      'music',
      'video-games',
      'anime',
      'books',
      'podcasts',
    ],
  },
  {
    slug: 'tech-gadgets',
    name: 'Tech & Gadgets',
    blurb: 'Devices, software and the tools that run modern work.',
    description:
      'Hardware and software judged the way people actually live with them: performance under load, build quality after a year, support lifespan, and whether the price still makes sense once the launch hype has burned off.',
    image: '1519389950473-47ba0277781c',
    categorySlugs: [
      'smartphones',
      'laptops',
      'ai-tools',
      'software',
      'apps',
      'websites',
      'photography',
      'programming',
    ],
  },
  {
    slug: 'lifestyle',
    name: 'Lifestyle',
    blurb: 'Fashion, wellness, home and the everyday objects worth owning.',
    description:
      'The things you wear, live with and rely on daily. Rankings favour durability and repairability over novelty, and we weight long-term owner reports far more heavily than first impressions.',
    image: '1441984904996-e0b6ba687e04',
    categorySlugs: [
      'fashion',
      'shoes',
      'watches',
      'beauty',
      'fitness',
      'health',
      'home',
      'kitchen',
      'pets',
    ],
  },
  {
    slug: 'food-travel',
    name: 'Food & Travel',
    blurb: 'Destinations, kitchens, cellars and the journeys worth taking.',
    description:
      'Where to go and what to eat when you get there. Travel entries balance the experience itself against crowding, cost and seasonality; food and drink entries weight consistency across visits above any single standout meal.',
    image: '1493857671505-72967e2e2760',
    categorySlugs: ['food', 'drinks', 'restaurants', 'travel', 'hotels', 'airlines'],
  },
  {
    slug: 'sports',
    name: 'Sports',
    blurb: 'Athletes, clubs, rivalries and moments that defined a era.',
    description:
      'Competitive excellence measured across peak performance, sustained dominance and the degree to which a player or club changed how their sport is played. Era-adjusted so different generations can be compared fairly.',
    image: '1461896836934-ffe607ba8211',
    categorySlugs: ['sports', 'football', 'basketball', 'soccer'],
  },
  {
    slug: 'business-money',
    name: 'Business & Money',
    blurb: 'Companies, brands, markets and the mechanics of capital.',
    description:
      'Organisations and financial instruments ranked on fundamentals rather than headlines: durable economics, competitive moat, governance quality and how the thing behaved the last time conditions turned hostile.',
    image: '1486406146926-c627a92ad1ab',
    categorySlugs: [
      'brands',
      'companies',
      'business',
      'finance',
      'investing',
      'crypto',
      'careers',
      'marketing',
    ],
  },
  {
    slug: 'knowledge',
    name: 'Knowledge',
    blurb: 'Science, history, learning and the places that hold them.',
    description:
      'Ideas, institutions, discoveries and landmarks. Entries are weighted by verified significance and scholarly consensus rather than popularity, with sourcing noted wherever the record is contested.',
    image: '1507842217343-583bb7270b66',
    categorySlugs: ['education', 'science', 'history', 'places', 'cars', 'trending'],
  },
];

/** @returns {Group|undefined} */
export function getGroup(slug) {
  return groups.find((g) => g.slug === slug);
}

/** @returns {Group|undefined} */
export function getGroupForCategory(categorySlug) {
  return groups.find((g) => g.categorySlugs.includes(categorySlug));
}

export const groupSlugs = groups.map((g) => g.slug);
