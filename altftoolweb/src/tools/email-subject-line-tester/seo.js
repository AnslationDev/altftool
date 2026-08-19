const seo = {
  title: "Email Subject Line Tester: 9 Metrics & Preview",
  metaDescription:
    "Score a subject line on nine weighted metrics, see spam-dictionary matches highlighted in place, and where Gmail, Outlook and Apple Mail cut it off.",
  intro:
    "The Email Subject Line Tester grades a subject line out of 100 using nine weighted metrics — length 20%, spam safety 15%, readability 15%, personalisation 10%, urgency 10%, power words 10%, capitalisation 10%, numbers 5% and emoji 5% — and shows how the line truncates in Gmail, Outlook and Apple Mail. It is for email marketers and anyone scheduling a campaign who wants a reproducible read on a line before it goes out. Every score is rule-based and deterministic: readability uses the real Flesch Reading Ease formula, and spam risk comes from a 75-phrase trigger dictionary plus penalties for exclamation marks, ALL-CAPS words and repeated symbols.",
  useCases: [
    "You have two candidate subject lines for the same send and want them scored side by side before choosing which gets the A and which gets the B in your split test.",
    "A campaign landed in Promotions instead of Primary and you want to see which specific phrases in the line matched the spam dictionary, highlighted in place.",
    "You are writing for a mobile-heavy list and need to confirm the offer is still visible inside Gmail Mobile's roughly 40-character cut, not stranded after the ellipsis.",
  ],
  benefits: [
    [
      "Published weights, not a black box",
      "The nine metric weights are exposed in the interface and sum to 1, so you can see exactly why a line scored what it did and which metric to fix first.",
    ],
    [
      "In-line phrase highlighting",
      "Spam, urgency, power and personalisation matches are highlighted directly in your subject with spam taking priority on overlaps, so you edit the exact words that cost points.",
    ],
    [
      "Exportable analysis",
      "The full metric breakdown, suggestions and generated variations export as PDF, TXT or JSON, so a score can be attached to a campaign brief or diffed later.",
    ],
  ],
  faqs: [
    [
      "What is the ideal email subject line length?",
      "30 to 50 characters scores a perfect 100 on the length metric here; outside that band the score drops about 3 points per character of distance, with a floor of 10. That range sits inside every major client's truncation point except Gmail Mobile, which cuts at roughly 40 characters.",
    ],
    [
      "How is spam risk calculated?",
      "Each match against the 75-phrase spam dictionary costs 12 points, capped at 60. On top of that: one exclamation mark adds 5 penalty points, two add 10, three or more add 15; each ALL-CAPS word longer than two letters adds 10 up to a cap of 30; two or more dollar signs add 10; and repeated symbols like !! or $$ add another 10.",
    ],
    [
      "How does the readability score work on a subject line?",
      "It applies Flesch Reading Ease — 206.835 minus 1.015 times the word count minus 84.6 times syllables per word — treating the subject as a single sentence, then clamps the result to 0-100. Short phrases can push the raw formula above 100 or below 0, which is why the clamp exists.",
    ],
    [
      "Where does each email client cut off a subject line?",
      "Approximately 70 characters in Gmail Desktop, 40 in Gmail Mobile, 60 in Outlook's reading-pane list and 90 in Apple Mail on iPhone or iPad. These are widely-cited approximations rather than pixel measurements — real truncation shifts with font, zoom and window width, so treat them as a planning guide.",
    ],
  ],
  steps: [
    "Type into the Subject line box (placeholder \"Type or paste your email subject line…\", capped at 300 characters), press Paste to pull the line from your clipboard, or Try an example to cycle through the six built-in samples. The line below counts \"N characters · N words\" and flips to \"Likely to truncate on most inboxes\" past 60 characters.",
    "There is nothing to submit — scoring runs live as you type. The overview shows the score gauge, the grade letter and its label (A+ Excellent, A Great, B Good, C Needs Work, D High Risk), a \"N characters · N words · Clickability N/100\" line and the nine weights under Scored on, while the tabs beneath hold Metrics, Highlights, Suggestions, Variations, Inbox Preview, Insights, Compare (A/B) and History.",
    "Under Export, click PDF, JSON or TXT — the button reads Exporting… while it runs — to download the metric breakdown, suggestions and variations as email-subject-analysis-<subject-slug>.pdf, .json or .txt, the slug being your subject lowercased, hyphenated and cut to 40 characters. Clear empties the box so you can start on the next line.",
  ],
};

export default seo;
