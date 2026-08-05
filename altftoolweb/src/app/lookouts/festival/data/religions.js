// Religion taxonomy for the Festival Explorer.
// `icon` is a lucide-react icon key resolved by components/iconMap.js.

export const RELIGIONS = [
  {
    slug: "hinduism",
    name: "Hinduism",
    icon: "flame",
    tint: "orange",
    description: "Festivals of light, colour, and devotion celebrated across South Asia and its diaspora.",
  },
  {
    slug: "islam",
    name: "Islam",
    icon: "moon-star",
    tint: "gray",
    description: "Lunar-calendar observances marking fasting, charity, pilgrimage, and remembrance.",
  },
  {
    slug: "christianity",
    name: "Christianity",
    icon: "cross",
    tint: "violet",
    description: "Feasts and holy days tracing the liturgical calendar from Advent to Pentecost.",
  },
  {
    slug: "buddhism",
    name: "Buddhism",
    icon: "flower",
    tint: "violet",
    description: "Observances of the Buddha's life and the turning of the Buddhist calendar.",
  },
  {
    slug: "sikhism",
    name: "Sikhism",
    icon: "swords",
    tint: "pink",
    description: "Gurpurabs and harvest-linked celebrations rooted in Sikh history and the Gurus.",
  },
  {
    slug: "judaism",
    name: "Judaism",
    icon: "star",
    tint: "violet",
    description: "Festivals of the Hebrew calendar marking liberation, atonement, and renewal.",
  },
  {
    slug: "jainism",
    name: "Jainism",
    icon: "gem",
    tint: "orange",
    description: "Observances of penance, non-violence, and the lives of the Tirthankaras.",
  },
  {
    slug: "shinto",
    name: "Shinto",
    icon: "torii-gate",
    tint: "pink",
    description: "Seasonal rites and life-stage ceremonies rooted in Japan's native tradition.",
  },
  {
    slug: "taoism",
    name: "Taoism & Chinese Folk",
    icon: "circle-dot",
    tint: "teal",
    description: "Lunar-calendar festivals of the Chinese cultural sphere, blending folk and Taoist practice.",
  },
  {
    slug: "indigenous",
    name: "Indigenous & Folk",
    icon: "leaf",
    tint: "teal",
    description: "Community and harvest traditions predating or existing alongside organised religion.",
  },
  {
    slug: "secular",
    name: "Secular & National",
    icon: "flag",
    tint: "blue",
    description: "Civic holidays and national days celebrating independence, history, and identity.",
  },
  {
    slug: "multi-faith",
    name: "Cultural & Multi-faith",
    icon: "globe",
    tint: "blue",
    description: "Broadly shared cultural celebrations that cross religious and national lines.",
  },
];

export const RELIGION_MAP = Object.fromEntries(RELIGIONS.map((r) => [r.slug, r]));

export function getReligion(slug) {
  return RELIGION_MAP[slug] || null;
}
