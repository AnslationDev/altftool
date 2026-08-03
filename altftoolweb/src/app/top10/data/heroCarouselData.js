/**
 * The hero's floating 3D card carousel. Presentation only — the images and
 * copy are static page furniture, and no ranking, count or popularity claim
 * is made here; every actual list on the page is fetched live from that
 * product's own /api/top10/<product> route. When a card is centered, its
 * heading/subheading/searchPlaceholder drive the left column text. Ids match
 * CATEGORY_STRIP ids so the matching category chip highlights while its card
 * is active, so every id here must also be a real PRODUCT_REGISTRY categoryId.
 */
export const HERO_CARDS = [
  {
    id: "books",
    label: "Books",
    productName: "Books",
    image: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=700&q=80",
    subheading: "Explore books by subject, with up to ten provider-sourced picks in each list.",
    tagline: "Explore everything from new releases to literary classics. Ten picks per subject, so you can start reading sooner.",
    searchPlaceholder: "Search books...",
  },
  {
    id: "travel",
    label: "Travel",
    productName: "Destinations",
    image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=700&q=80",
    subheading: "Explore destinations and places through concise, provider-sourced lists.",
    tagline: "From tropical beaches to mountain escapes. Ten places per list, to plan a trip without a hundred open tabs.",
    searchPlaceholder: "Search destinations...",
  },
  {
    id: "ai-tools",
    label: "AI Tools",
    productName: "AI Tools",
    image: "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=700&q=80",
    subheading: "Discover AI tools from live provider results, without an endless directory.",
    tagline: "From writing assistants to coding copilots. Ten tools per list, so you can compare without the noise.",
    searchPlaceholder: "Search AI tools...",
  },
  {
    id: "music",
    label: "Music",
    productName: "Music",
    image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=700&q=80",
    subheading: "Explore Apple Music chart picks by genre in one focused place.",
    tagline: "Explore today's songs and albums by genre. Ten picks per list, so a new playlist takes a minute, not an hour.",
    searchPlaceholder: "Search music...",
  },
];
