/**
 * Top 49 — the 49 categories.
 *
 * Editorial content only. Counts (lists, items) are derived from the real
 * ranked data at query time in lib/data.js so the numbers on screen can never
 * drift from what actually renders.
 *
 * @typedef {Object} Category
 * @property {string} slug
 * @property {string} name
 * @property {string} group        Group slug
 * @property {string} tagline      One line, sentence case, no period
 * @property {string} description  2-3 sentences of real editorial context
 * @property {string} image        Unsplash photo id
 * @property {boolean} isTrending
 */

/** @type {Category[]} */
export const categories = [
  // ── Entertainment ────────────────────────────────────────────────────────
  {
    slug: 'movies',
    name: 'Movies',
    group: 'entertainment',
    tagline: 'A century of cinema, sorted',
    description:
      'From the silent era to the streaming age, ranked across every major genre. Critical consensus carries the most weight, but a film that reshaped how movies get made will always outrank one that merely reviewed well.',
    image: '1489599849927-2ee91cede3ba',
    isTrending: true,
  },
  {
    slug: 'tv-shows',
    name: 'TV Shows',
    group: 'entertainment',
    tagline: 'The series that earned your evenings',
    description:
      'Prestige drama, network comedy and everything the streamers have funded since. We score whole runs rather than standout seasons, which is why several beloved shows sit lower than their best year would suggest.',
    image: '1522869635100-9f4c5e86aa37',
    isTrending: true,
  },
  {
    slug: 'celebrities',
    name: 'Celebrities',
    group: 'entertainment',
    tagline: 'Influence, measured rather than assumed',
    description:
      'Actors, hosts and public figures ranked on body of work, cultural reach and staying power. Follower counts are an input, never the answer — longevity and range move the needle far more.',
    image: '1516280440614-37939bbacd81',
    isTrending: false,
  },
  {
    slug: 'music',
    name: 'Music',
    group: 'entertainment',
    tagline: 'Records that changed what came next',
    description:
      'Albums, artists and singles weighed on craft, influence and how well they have aged. Chart performance is deliberately underweighted: plenty of number ones vanished, and plenty of flops rewired a genre.',
    image: '1470225620780-dba8ba36b745',
    isTrending: false,
  },
  {
    slug: 'video-games',
    name: 'Video Games',
    group: 'entertainment',
    tagline: 'Four decades of interactive design',
    description:
      'Ranked on design ambition, mechanical polish and the degree to which a title became a template others copied. Launch-day state matters — games that shipped broken carry that penalty even after patches.',
    image: '1550745165-9bc0b252726f',
    isTrending: true,
  },
  {
    slug: 'anime',
    name: 'Anime',
    group: 'entertainment',
    tagline: 'Japanese animation at full strength',
    description:
      'Series and films assessed on direction, animation quality and narrative payoff. Adaptations are judged as standalone works, so a faithful but flat adaptation ranks below a looser one that actually lands.',
    image: '1578632767115-351597cf2477',
    isTrending: true,
  },
  {
    slug: 'books',
    name: 'Books',
    group: 'entertainment',
    tagline: 'Fiction and non-fiction that still holds',
    description:
      'Literature ranked on prose quality, structural ambition and continued relevance. Prize wins inform the score but never decide it — several canonical winners rank below books the committees passed over.',
    image: '1481627834876-b7833e8f5570',
    isTrending: false,
  },
  {
    slug: 'podcasts',
    name: 'Podcasts',
    group: 'entertainment',
    tagline: 'Audio worth the commute',
    description:
      'Interview shows, narrative documentary and long-form reporting judged on editorial rigour, production craft and consistency across a full season rather than a viral single episode.',
    image: '1478737270239-2f02b77fc618',
    isTrending: true,
  },

  // ── Tech & Gadgets ───────────────────────────────────────────────────────
  {
    slug: 'smartphones',
    name: 'Smartphones',
    group: 'tech-gadgets',
    tagline: 'Every flagship, tested against its price',
    description:
      'Sustained performance, camera output in poor light, battery under real load and how long the manufacturer will actually ship security patches. Benchmark peaks are noted but never carry a ranking on their own.',
    image: '1511707171634-5f897ff02aa9',
    isTrending: true,
  },
  {
    slug: 'laptops',
    name: 'Laptops',
    group: 'tech-gadgets',
    tagline: 'Portables that survive the third year',
    description:
      'Thermals under sustained load, keyboard and display quality, repairability and battery life measured on a real workload rather than a looping video. Chassis flex and hinge wear are counted.',
    image: '1496181133206-80ce9b88a853',
    isTrending: true,
  },
  {
    slug: 'ai-tools',
    name: 'AI Tools',
    group: 'tech-gadgets',
    tagline: 'Models and assistants, minus the hype',
    description:
      'Assessed on output quality for real tasks, latency, cost per unit of useful work and how gracefully each tool fails. Demo reels count for nothing; reproducible results count for everything.',
    image: '1620712943543-bcc4688e7485',
    isTrending: true,
  },
  {
    slug: 'software',
    name: 'Software',
    group: 'tech-gadgets',
    tagline: 'Desktop tools that earn their install',
    description:
      'Professional and prosumer applications ranked on capability, stability, licensing fairness and export freedom. Software that holds your work hostage in a proprietary format is penalised heavily.',
    image: '1517180102446-f3ece451e9d8',
    isTrending: false,
  },
  {
    slug: 'apps',
    name: 'Apps',
    group: 'tech-gadgets',
    tagline: 'Mobile software worth the home screen',
    description:
      'Judged on task completion speed, offline behaviour, data practices and whether the free tier is genuinely usable. Aggressive notification design and dark patterns cost real points.',
    image: '1512941937669-90a1b58e7e9c',
    isTrending: false,
  },
  {
    slug: 'websites',
    name: 'Websites',
    group: 'tech-gadgets',
    tagline: 'The web pages still worth a bookmark',
    description:
      'Reference sites, archives and tools ranked on information quality, load performance, accessibility and how little they interrupt you. Ad density is a scoring criterion, not an afterthought.',
    image: '1547658719-da2b51169166',
    isTrending: false,
  },
  {
    slug: 'photography',
    name: 'Photography',
    group: 'tech-gadgets',
    tagline: 'Cameras, glass and the images they make',
    description:
      'Bodies and lenses ranked on optical performance, autofocus reliability in difficult conditions, handling and system cost over five years rather than the price on the box.',
    image: '1502920917128-1aa500764cbd',
    isTrending: false,
  },
  {
    slug: 'programming',
    name: 'Programming',
    group: 'tech-gadgets',
    tagline: 'Languages, frameworks and developer tooling',
    description:
      'Weighted on ecosystem health, hiring reality, long-term maintenance cost and how the technology behaves at scale. Popularity is an input because it determines whether you can staff a team.',
    image: '1461749280684-dccba630e2f6',
    isTrending: true,
  },

  // ── Lifestyle ────────────────────────────────────────────────────────────
  {
    slug: 'fashion',
    name: 'Fashion',
    group: 'lifestyle',
    tagline: 'Labels judged on cloth, not campaigns',
    description:
      'Houses and labels ranked on material quality, construction, consistency across a collection and value retention. Marketing spend and celebrity seeding are explicitly excluded from the score.',
    image: '1445205170230-053b83016050',
    isTrending: false,
  },
  {
    slug: 'shoes',
    name: 'Shoes',
    group: 'lifestyle',
    tagline: 'Footwear rated on the second year',
    description:
      'Comfort over distance, outsole durability, resole potential and how the upper holds shape. Sneakers and dress shoes are scored on separate criteria and never ranked against each other.',
    image: '1542291026-7eec264c27ff',
    isTrending: true,
  },
  {
    slug: 'watches',
    name: 'Watches',
    group: 'lifestyle',
    tagline: 'Movements, finishing and honest value',
    description:
      'Mechanical and quartz pieces assessed on movement quality, case finishing, servicing cost and how the price compares to what the watch actually contains. Waiting-list hype is not a criterion.',
    image: '1523170335258-f5ed11844a49',
    isTrending: false,
  },
  {
    slug: 'beauty',
    name: 'Beauty',
    group: 'lifestyle',
    tagline: 'Formulations that do what the label claims',
    description:
      'Skincare and cosmetics ranked on active concentration, formulation stability, published evidence and irritation reports. Packaging and scent are noted but carry almost no weight.',
    image: '1596462502278-27bfdc403348',
    isTrending: true,
  },
  {
    slug: 'fitness',
    name: 'Fitness',
    group: 'lifestyle',
    tagline: 'Training that survives contact with reality',
    description:
      'Equipment, programmes and wearables scored on evidence base, adherence rates and durability. Anything requiring a subscription to remain functional is marked down.',
    image: '1534438327276-14e5300c3a48',
    isTrending: true,
  },
  {
    slug: 'health',
    name: 'Health',
    group: 'lifestyle',
    tagline: 'Evidence first, marketing last',
    description:
      'Devices, services and interventions weighted strictly by clinical evidence quality and regulatory clearance. Where evidence is thin we say so rather than filling the gap with confident language.',
    image: '1505576399279-565b52d4ac71',
    isTrending: false,
  },
  {
    slug: 'home',
    name: 'Home',
    group: 'lifestyle',
    tagline: 'Furniture and fittings built to be kept',
    description:
      'Ranked on material honesty, joinery, serviceability and comfort measured over long use. Flat-pack is not penalised for being flat-pack — it is penalised when it cannot be taken apart twice.',
    image: '1586023492125-27b2c045efd7',
    isTrending: false,
  },
  {
    slug: 'kitchen',
    name: 'Kitchen',
    group: 'lifestyle',
    tagline: 'Cookware that outlives the trend cycle',
    description:
      'Pans, knives and appliances judged on heat behaviour, edge retention, cleaning reality and repairability. Coatings with a two-year lifespan are scored as consumables, because that is what they are.',
    image: '1556909114-f6e7ad7d3136',
    isTrending: false,
  },
  {
    slug: 'pets',
    name: 'Pets',
    group: 'lifestyle',
    tagline: 'Care products vets actually endorse',
    description:
      'Food, equipment and services ranked on nutritional evidence, safety record and veterinary consensus. Recall history is a permanent part of every brand score.',
    image: '1450778869180-41d0601e046e',
    isTrending: false,
  },

  // ── Food & Travel ────────────────────────────────────────────────────────
  {
    slug: 'food',
    name: 'Food',
    group: 'food-travel',
    tagline: 'Dishes, cuisines and the things worth cooking',
    description:
      'Ranked on flavour, technique, cultural depth and how well a dish travels beyond its origin. Regional variants are treated as distinct entries rather than folded into one average.',
    image: '1504674900247-0877df9cc836',
    isTrending: true,
  },
  {
    slug: 'drinks',
    name: 'Drinks',
    group: 'food-travel',
    tagline: 'Coffee, wine, spirits and everything poured',
    description:
      'Assessed blind wherever possible, on balance, complexity and value at the price. House styles are described rather than judged, so you can find the one that matches your palate.',
    image: '1514432324607-a09d9b4aefdd',
    isTrending: false,
  },
  {
    slug: 'restaurants',
    name: 'Restaurants',
    group: 'food-travel',
    tagline: 'Dining rooms that deliver on a Tuesday',
    description:
      'Scored across multiple visits on food, service and consistency — never on a single tasting. Guides and stars are recorded as context, not as the ranking itself.',
    image: '1517248135467-4c7edcad34c4',
    isTrending: true,
  },
  {
    slug: 'travel',
    name: 'Travel',
    group: 'food-travel',
    tagline: 'Destinations rated honestly, crowds included',
    description:
      'Places ranked on what there is to do, how pleasant it is to actually be there, cost realism and seasonality. Overtourism pressure is a visible part of every destination score.',
    image: '1476514525535-07fb3b4ae5f1',
    isTrending: true,
  },
  {
    slug: 'hotels',
    name: 'Hotels',
    group: 'food-travel',
    tagline: 'Rooms measured against the rate card',
    description:
      'Judged on sleep quality, service recovery, soundproofing and whether the resort fee buys anything. Photography supplied by the property is never used as evidence.',
    image: '1566073771259-6a8506099945',
    isTrending: false,
  },
  {
    slug: 'airlines',
    name: 'Airlines',
    group: 'food-travel',
    tagline: 'Carriers ranked on the flights that go wrong',
    description:
      'On-time performance, seat pitch, crew consistency and — weighted most heavily — how the airline behaves during disruption. Cabin refits are tracked because fleet age varies wildly within a brand.',
    image: '1436491865332-7a61a109cc05',
    isTrending: false,
  },

  // ── Sports ───────────────────────────────────────────────────────────────
  {
    slug: 'sports',
    name: 'Sports',
    group: 'sports',
    tagline: 'Athletes and moments across every discipline',
    description:
      'Cross-sport rankings covering athletes, rivalries and defining events. Era adjustment is applied so dominance in a shallow field never outranks dominance in a deep one.',
    image: '1461896836934-ffe607ba8211',
    isTrending: true,
  },
  {
    slug: 'football',
    name: 'Football',
    group: 'sports',
    tagline: 'The gridiron, ranked without the homerism',
    description:
      'Players, franchises and seasons assessed on advanced metrics alongside traditional counting stats. Postseason performance is weighted but does not erase a decade of regular-season excellence.',
    image: '1508098682722-e99c43a406b2',
    isTrending: false,
  },
  {
    slug: 'basketball',
    name: 'Basketball',
    group: 'sports',
    tagline: 'Peaks, primes and the full career arc',
    description:
      'Ranked on peak level, sustained production and playoff impact, with pace and era adjustments applied throughout. Longevity is rewarded but never allowed to outweigh a genuinely historic prime.',
    image: '1546519638-68e109498ffc',
    isTrending: true,
  },
  {
    slug: 'soccer',
    name: 'Soccer',
    group: 'sports',
    tagline: 'The global game, club and country',
    description:
      'Players, clubs and tournaments weighted across league strength, continental competition and international honours. Position-adjusted, so defenders and keepers are not buried under goal totals.',
    image: '1517927033932-b3d18e61fb3a',
    isTrending: true,
  },

  // ── Business & Money ─────────────────────────────────────────────────────
  {
    slug: 'brands',
    name: 'Brands',
    group: 'business-money',
    tagline: 'Names people actually trust',
    description:
      'Brand strength measured on pricing power, customer retention, product consistency and how the company behaves when something goes wrong. Awareness alone is close to worthless here.',
    image: '1560179707-f14e90ef3623',
    isTrending: false,
  },
  {
    slug: 'companies',
    name: 'Companies',
    group: 'business-money',
    tagline: 'Businesses judged on the fundamentals',
    description:
      'Ranked on durable economics, capital allocation, governance and employee outcomes. Market capitalisation is context, not a score — several of the largest companies rank mid-table.',
    image: '1486406146926-c627a92ad1ab',
    isTrending: false,
  },
  {
    slug: 'business',
    name: 'Business',
    group: 'business-money',
    tagline: 'Models, strategies and the ideas that scale',
    description:
      'Business models, operating playbooks and management frameworks assessed on evidence of results across multiple companies rather than one celebrated case study.',
    image: '1454165804606-c3d57bc86b40',
    isTrending: false,
  },
  {
    slug: 'finance',
    name: 'Finance',
    group: 'business-money',
    tagline: 'Accounts, cards and the small print',
    description:
      'Financial products ranked on real cost after fees, transparency of terms and service quality during disputes. Introductory rates are shown separately from the rate you end up paying.',
    image: '1526304640581-d334cdbbf45e',
    isTrending: false,
  },
  {
    slug: 'investing',
    name: 'Investing',
    group: 'business-money',
    tagline: 'Vehicles, costs and long-run behaviour',
    description:
      'Funds, platforms and strategies assessed on total cost, tracking quality, tax treatment and behaviour through a full drawdown. Nothing here is a recommendation to buy anything.',
    image: '1611974789855-9c2a0a7236a3',
    isTrending: true,
  },
  {
    slug: 'crypto',
    name: 'Crypto',
    group: 'business-money',
    tagline: 'Protocols weighed on what they actually do',
    description:
      'Networks and applications ranked on security model, decentralisation, developer activity and real usage. Price action is deliberately excluded. Treat every entry as high risk.',
    image: '1518546305927-5a555bb7020d',
    isTrending: true,
  },
  {
    slug: 'careers',
    name: 'Careers',
    group: 'business-money',
    tagline: 'Roles ranked on more than the headline salary',
    description:
      'Occupations assessed on compensation, growth outlook, entry difficulty, autonomy and reported burnout. Total lifetime earnings matter more here than a strong starting number.',
    image: '1521737604893-d14cc237f11d',
    isTrending: false,
  },
  {
    slug: 'marketing',
    name: 'Marketing',
    group: 'business-money',
    tagline: 'Channels, tools and campaigns that converted',
    description:
      'Platforms and tactics ranked on measured return, attribution honesty and durability once the incentive spend stops. Vanity metrics are recorded and then set aside.',
    image: '1533750349088-cd871a92f312',
    isTrending: false,
  },

  // ── Knowledge ────────────────────────────────────────────────────────────
  {
    slug: 'education',
    name: 'Education',
    group: 'knowledge',
    tagline: 'Institutions and courses that repay the cost',
    description:
      'Universities, courses and platforms ranked on teaching quality, graduate outcomes and cost after aid. Research prestige is separated from undergraduate experience, because they rarely correlate.',
    image: '1523050854058-8df90110c9f1',
    isTrending: false,
  },
  {
    slug: 'science',
    name: 'Science',
    group: 'knowledge',
    tagline: 'Discoveries ranked by what they unlocked',
    description:
      'Breakthroughs, instruments and fields weighted on explanatory power, reproducibility and downstream impact. Contested findings are labelled rather than quietly omitted.',
    image: '1507413245164-6160d8298b31',
    isTrending: false,
  },
  {
    slug: 'history',
    name: 'History',
    group: 'knowledge',
    tagline: 'Events and figures, sourced and contested',
    description:
      'Ranked on documented consequence and scholarly consensus. Where historians genuinely disagree, the entry says so and points at the disagreement rather than picking a side.',
    image: '1461360370896-922624d12aa1',
    isTrending: false,
  },
  {
    slug: 'places',
    name: 'Places',
    group: 'knowledge',
    tagline: 'Landmarks, cities and natural wonders',
    description:
      'Sites assessed on significance, preservation state and what the visit is actually like. Protected and fragile locations carry an access note so the ranking does not encourage damage.',
    image: '1467269204594-9661b134dd2b',
    isTrending: true,
  },
  {
    slug: 'cars',
    name: 'Cars',
    group: 'knowledge',
    tagline: 'Vehicles rated on ownership, not launch day',
    description:
      'Ranked on reliability records, running costs, safety testing and how the car drives after 60,000 miles. Press-fleet impressions are noted but carry little weight against long-term owner data.',
    image: '1503376780353-7e6692767b70',
    isTrending: true,
  },
  {
    slug: 'trending',
    name: 'Trending',
    group: 'knowledge',
    tagline: 'What moved this month, across every category',
    description:
      'A rolling cross-category view of the lists gaining attention fastest. Positions here change far more often than anywhere else on Top 49 — that is the entire point.',
    image: '1451187580459-43490279c0fa',
    isTrending: true,
  },
];

export const categorySlugs = categories.map((c) => c.slug);

/** @returns {Category|undefined} */
export function getCategoryBySlug(slug) {
  return categories.find((c) => c.slug === slug);
}

/** @returns {Category[]} */
export function getCategoriesInGroup(groupSlug) {
  return categories.filter((c) => c.group === groupSlug);
}
