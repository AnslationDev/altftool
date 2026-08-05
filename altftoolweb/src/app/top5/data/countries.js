// "Explore by country" world index for the Top5 homepage and the
// /top5/category/[slug] index page (countries share that same template).
// Self-contained to this section.

const countries = [
  { slug: "india", code: "IN", name: "India", count: "6,430" },
  { slug: "united-states", code: "US", name: "United States", count: "18,240" },
  { slug: "japan", code: "JP", name: "Japan", count: "5,680" },
  { slug: "germany", code: "DE", name: "Germany", count: "4,920" },
  { slug: "china", code: "CN", name: "China", count: "9,150" },
  { slug: "united-kingdom", code: "GB", name: "United Kingdom", count: "7,340" },
  { slug: "brazil", code: "BR", name: "Brazil", count: "3,980" },
  { slug: "france", code: "FR", name: "France", count: "4,210" },
];

export function getAllCountries() {
  return countries;
}

export function getCountry(slug) {
  return countries.find((country) => country.slug === slug) || null;
}

export default countries;
