const seo = {
  title: "LinkedIn Post Prompt Builder – Hook, Story, Takeaway",
  metaDescription:
    "AI prompt for a hook-story-takeaway LinkedIn post, sized to the 3,000-character limit with the hook budgeted under the ~140-character mobile fold.",
  steps: [
    "Fill in 'What the post is about' and 'Who should stop scrolling', and set a Target post length between 200 and 3,000 characters.",
    "Choose one of the five Hook styles — specific result, contrarian, confession, question or direct address.",
    "Review the hook, story and takeaway character budgets, then click Copy prompt to paste the generated drafting prompt into your AI chat.",
  ],
  intro:
    "The LinkedIn Post Prompt Builder writes an AI drafting prompt for a hook-story-takeaway post, sized in characters to fit LinkedIn's 3,000-character post limit. It budgets the hook to land inside the roughly 140-character mobile 'see more' fold, splits the remaining length between story and takeaway, and picks one of five hook styles — specific result, contrarian, confession, question or direct address — each with its own structural instruction.",
  useCases: [
    "A founder turning a cost-cutting win into a post gets a 1,200-character plan: 140-character hook with the number up front, 844-character story, 216-character takeaway.",
    "A job-seeking engineer uses the confession hook style to structure a post about a production mistake without it reading like a humblebrag.",
    "A marketer briefing ghostwritten posts standardises the prompt so every draft arrives with 1-2 sentence paragraphs, no engagement bait and [detail needed] markers instead of invented numbers.",
  ],
  benefits: [
    [
      "Fold-aware hooks",
      "The hook budget never exceeds ~140 characters, the point where mobile feeds cut the post behind 'see more'.",
    ],
    [
      "Five real hook patterns",
      "Result, contrarian, confession, question and direct-address hooks each swap a different opening instruction into the prompt.",
    ],
    [
      "Bait filtered out",
      "The prompt bans 'Like if you agree', corporate phrasing and invented numbers, so drafts need less de-cringing before posting.",
    ],
  ],
  faqs: [
    [
      "What is the character limit for a LinkedIn post?",
      "A standard LinkedIn feed post is capped at 3,000 characters; LinkedIn articles are a separate, much longer format. This tool sizes the whole hook-story-takeaway structure to a target you choose between 200 and 3,000 characters.",
    ],
    [
      "How many characters show before 'see more' on LinkedIn?",
      "Roughly 210 characters on desktop and roughly 140 on mobile before the feed truncates the post — these are observed values LinkedIn can change at any time. Because most scrolling happens on mobile, this tool caps the hook budget at 140 characters so the opening works standing alone.",
    ],
    [
      "How many hashtags should a LinkedIn post have?",
      "Three to five topic-specific hashtags at the end of the post is the common practitioner range; LinkedIn imposes no hard limit. The generated prompt asks for 3-5 specific tags and explicitly excludes generic filler like #motivation.",
    ],
    [
      "Should you put links in a LinkedIn post?",
      "The safer pattern is to keep the body link-free and put any link in the first comment, since many creators observe lower reach on posts with external links — though LinkedIn has never published a rule. The generated prompt follows the link-in-first-comment convention.",
    ],
  ],
};

export default seo;
