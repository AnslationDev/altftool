// lib/news/sources.js

export const GLOBAL_FEEDS = [
  {
    url: "http://feeds.bbci.co.uk/news/rss.xml",
    source: "BBC News",
    category: "world",
  },
  {
    url: "https://feeds.theguardian.com/theguardian/world/rss",
    source: "The Guardian",
    category: "world",
  },
  {
    url: "https://feeds.theguardian.com/theguardian/technology/rss",
    source: "The Guardian",
    category: "tech",
  },
  {
    url: "https://rss.nytimes.com/services/xml/rss/nyt/World.xml",
    source: "NY Times",
    category: "world",
  },
  {
    url: "https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml",
    source: "NY Times",
    category: "tech",
  },
  {
    url: "https://feeds.a.dj.com/rss/RSSWorldNews.xml",
    source: "Wall Street Journal",
    category: "business",
  },
  {
    url: "https://feeds.reuters.com/reuters/topNews",
    source: "Reuters",
    category: "world",
  },
  {
    url: "https://www.aljazeera.com/xml/rss/all.xml",
    source: "Al Jazeera",
    category: "world",
  },
  {
    url: "https://techcrunch.com/feed/",
    source: "TechCrunch",
    category: "tech",
  },
  {
    url: "https://feeds.feedburner.com/ndtvnews-top-stories",
    source: "NDTV",
    category: "world",
  },
];

/**
 * Build a Google News RSS URL for a location/topic query.
 * @param {string} query  e.g. "India", "New York", "climate"
 */
export function buildGoogleNewsUrl(query) {
  const encoded = encodeURIComponent(query);
  return `https://news.google.com/rss/search?q=${encoded}&hl=en-IN&gl=IN&ceid=IN:en`;
}