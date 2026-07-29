import Header from "./Header";
import KymAdBanner, { kymBanners } from "./KymAdBanner";
import KymComments from "./KymComments";
import {
  editorials,
  episodes,
  explainers,
  freshEntries,
  latest,
  spotlightCards,
  topEntries,
  topMemes,
} from "../data/kymData";
import { slugifyTitle } from "../data/slug";

// No `meta` field on any of these. Cards used to carry hardcoded strings such
// as "Recently updated", "Trending entry" and "Updated 12 hours ago" that never
// changed, advertising freshness and traction that were never measured.
const contentGroups = [
  ...spotlightCards,
  ...freshEntries,
  ...explainers.map((item) => ({ ...item, category: "Explainer" })),
  ...episodes.map((item) => ({ ...item, category: "Episode" })),
  ...editorials,
  ...latest,
  ...topEntries.map((item) => ({ ...item, category: "Entry" })),
  ...topMemes.map((item) => ({ ...item, category: "Meme" })),
];

export function getAllKymRoutes() {
  return [...new Set(contentGroups.map((item) => item.href || `/kym/${slugifyTitle(item.title)}`))];
}

const CATEGORY_COPY = {
  Explainer: {
    status: "Explained",
    type: "Slang / format",
    about:
      "This explainer tracks how the phrase moved through comment sections, captions and short-form video posts before becoming a recognizable reaction shorthand.",
    origin:
      "The format is presented here as a local KYM-style summary: a compact definition, the situation it describes and the reason users began applying it outside the original context.",
    spread:
      "After the phrase became legible on its own, creators reused it in stitched clips, caption jokes and quote-post replies where the setup needed almost no extra explanation.",
    notes: ["Definition-focused", "Caption-friendly", "Common in reaction posts"],
  },
  Episode: {
    status: "Episode",
    type: "Video feature",
    about:
      "This episode-style page frames the topic as a narrated look back at the meme, using the image as a cover and the surrounding copy as episode notes.",
    origin:
      "The entry focuses on the moment that made the topic memorable, then sets up why it kept resurfacing in discussions about internet culture.",
    spread:
      "Its continued circulation comes from explainers, video essays and nostalgia posts that revisit older formats for new audiences.",
    notes: ["Video-led", "Retrospective", "Context-heavy"],
  },
  Editorial: {
    status: "Featured",
    type: "Editorial",
    about:
      "This editorial-style entry treats the topic as part of a wider internet culture cycle, collecting the setup, recurring jokes and surrounding discourse.",
    origin:
      "The format is grouped with fast-moving posts and image edits that gained traction because they were easy to recognize, remix and recaption.",
    spread:
      "It spread through roundup posts, screenshots and reaction threads where users compared versions and added new captions.",
    notes: ["Roundup format", "Image-led", "Discussion-driven"],
  },
  Collection: {
    status: "Collection",
    type: "Image set",
    about:
      "This collection-style page gathers a theme of related jokes, images or design fails into a browsable entry.",
    origin:
      "The topic works as a collection because each example is self-contained while still reinforcing the same visual or comedic pattern.",
    spread:
      "Users tend to share collection entries as galleries, using individual images as standalone reactions and the full set as a larger reference point.",
    notes: ["Gallery-first", "Reusable examples", "Visual humor"],
  },
  Entry: {
    status: "Documenting",
    type: "Meme entry",
    about:
      "This entry documents the topic as a meme or internet culture reference, summarizing the premise and the way it is used in posts.",
    origin:
      "The earliest local context is represented by the card title and image, with this page expanding the setup into a dedicated encyclopedia-style entry.",
    spread:
      "The format spreads when users adapt the core joke to new situations, especially when the image can be understood quickly in feeds.",
    notes: ["Meme entry", "Template-ready", "Feed-native"],
  },
  Meme: {
    status: "Trending",
    type: "Meme",
    about:
      "This meme entry explains the recognizable image, phrase or character and how it functions as a reaction format.",
    origin:
      "The topic is framed around the first context that makes the joke readable, then connects that context to later edits and references.",
    spread:
      "Its spread is driven by simple remix rules: users keep the recognizable setup and swap in captions, edits or new situations.",
    notes: ["Reaction format", "Remixable", "High recognition"],
  },
  Event: {
    status: "Newsworthy",
    type: "Event",
    about:
      "This event-style entry summarizes a viral incident or discourse cycle and the memes that formed around it.",
    origin:
      "The event is treated as a source moment, with the meme activity growing from screenshots, clips or quotes attached to that moment.",
    spread:
      "As the event circulated, users turned the recognizable names and images into jokes, references and shorthand for similar situations.",
    notes: ["Discourse cycle", "Source moment", "Reaction posts"],
  },
  Culture: {
    status: "Subculture",
    type: "Culture",
    about:
      "This culture-style entry describes a broader community, fandom or recurring online behavior rather than one isolated joke.",
    origin:
      "The page introduces the shared vocabulary and visual cues that make the culture recognizable to people outside the group.",
    spread:
      "It spreads when posts from the community cross into wider feeds, where outsiders remix the references or ask for context.",
    notes: ["Community-led", "Shared references", "Contextual"],
  },
};

function getArticleProfile(item, category) {
  const normalizedCategory = category || "Entry";
  const base = CATEGORY_COPY[normalizedCategory] || CATEGORY_COPY.Entry;
  const lowerTitle = item.title.toLowerCase();
  const titleKeyword = item.title.split(/[:'"/()\-]/)[0].trim() || item.title;

  if (lowerTitle.includes("what does") || lowerTitle.includes("what is")) {
    return {
      ...CATEGORY_COPY.Explainer,
      lede: `${item.title} is presented as a KYM-style explainer for readers who have seen the phrase or image in posts but want the context behind the joke.`,
      examples: [
        `People use ${titleKeyword} as a quick reference when a caption needs an instantly readable setup.`,
        "The format works best in short posts, screenshots and replies where the audience already understands the mood.",
        "Later variants usually keep the recognizable wording while changing the target, scene or punchline.",
      ],
    };
  }

  if (lowerTitle.includes("roundup")) {
    return {
      ...CATEGORY_COPY.Editorial,
      lede: `${item.title} collects multiple fast-moving internet culture moments into one editorial-style overview.`,
      examples: [
        "Roundup entries group related jokes so readers can follow several formats at once.",
        "The strongest examples usually have a clear image, a repeated caption pattern and quick remix potential.",
        "Readers often use these pages as a map for what was circulating during a specific week.",
      ],
    };
  }

  if (lowerTitle.includes("harambe") || lowerTitle.includes("loss")) {
    return {
      ...CATEGORY_COPY.Episode,
      lede: `${item.title} revisits a long-running internet culture reference and explains why it still gets quoted years later.`,
      examples: [
        "Older memes resurface when new audiences encounter the original image or phrase through retrospectives.",
        "The reference works because it carries a compact history that can be signaled with only a few words.",
        "New posts often remix the legacy rather than restarting the meme from scratch.",
      ],
    };
  }

  if (lowerTitle.includes("25 ") || normalizedCategory === "Collection") {
    return {
      ...CATEGORY_COPY.Collection,
      lede: `${item.title} is formatted as a visual collection built around a shared theme, recurring joke or recognizable internet pattern.`,
      examples: [
        "Collection posts are strongest when every image works alone while still fitting the larger theme.",
        "The gallery format encourages browsing, saving and sharing individual examples.",
        "Users often add their own finds in comments, extending the collection beyond the original post.",
      ],
    };
  }

  return {
    ...base,
    lede: `${item.title} is documented here as a distinct ${base.type.toLowerCase()} with its own setup, usage notes and spread pattern.`,
    examples: [
      `${titleKeyword} is used as a shorthand reference when the audience recognizes the setup.`,
      "Common variants change the caption or context while keeping the recognizable visual cue.",
      "The format is most effective when it can be understood quickly without a long explanation.",
    ],
  };
}

export function findKymItem(slug) {
  return contentGroups.find((item) => slugifyTitle(item.title) === slug);
}

function RelatedRail({ current }) {
  const related = contentGroups
    .filter((item) => item.title !== current.title)
    .slice(0, 4);

  return (
    <aside className="kym-article-sidebar">
      <section>
        <h2>Related Entries</h2>
        <div className="kym-article-side-grid">
          {related.map((item) => (
            <a href={`/kym/${slugifyTitle(item.title)}`} key={item.title}>
              <img src={item.image.src} alt="" />
              <strong>{item.title}</strong>
            </a>
          ))}
        </div>
      </section>
      
      <div className="kym-sidebar-banners" aria-label="Sponsored banner">
        <KymAdBanner src={kymBanners.sidebarTall} variant="vertical" />
      </div>
    </aside>
  );
}

export default function KymGenericPage({ item }) {
  const category = item.category || "Entry";
  const profile = getArticleProfile(item, category);

  return (
    <div className="kym-page kym-article-page">
      <Header compact />
      <main className="kym-article-shell">
        <article className="kym-article">
          <p className="kym-article-kicker">{category}</p>
          <h1>{item.title}</h1>
          <img className="kym-article-hero" src={item.image.src} alt="" />
          <div className="kym-article-meta">
            {/* No date line: these entries carry no publish or update date. */}
            <span>Status: {profile.status}</span>
            <span>Type: {profile.type}</span>
          </div>
          <p className="kym-article-lede">{profile.lede}</p>
          <div className="kym-entry-facts">
            <span>Category</span>
            <strong>{category}</strong>
            <span>Status</span>
            <strong>{profile.status}</strong>
            <span>Format</span>
            <strong>{profile.type}</strong>
          </div>
          <section className="kym-article-section">
            <h2>About This Entry</h2>
            <p>
              <strong>{item.title}</strong> is the focus of this local
              encyclopedia entry. {profile.about}
            </p>
          </section>
          <section className="kym-article-section">
            <h2>Origin</h2>
            <p>{profile.origin} For this page, the source card title and image establish the starting point for documenting <strong>{item.title}</strong>.</p>
          </section>
          <section className="kym-article-section">
            <h2>Spread</h2>
            <p>{profile.spread} The local version of <strong>{item.title}</strong> keeps the page distinct from the other cards while preserving the same KYM-style article structure.</p>
          </section>
          <section className="kym-article-section">
            <h2>Common Examples</h2>
            <ul className="kym-entry-examples">
              {profile.examples.map((example) => (
                <li key={example}>{example}</li>
              ))}
            </ul>
          </section>
          <section className="kym-article-section">
            <h2>Entry Notes</h2>
            <div className="kym-topic-list">
              {profile.notes.map((note) => (
                <a href="#" key={note}>{note}</a>
              ))}
            </div>
          </section>
          <KymComments storageKey={`kym-comments:${slugifyTitle(item.title)}`} />
        </article>
        <RelatedRail current={item} />
      </main>
    </div>
  );
}
