const seo = {
  title: "Privacy Policy Diff: Find Retention and Sharing",
  metaDescription:
    "Compares two policy versions line by line and counts how many added or removed lines contain collect, share, retain, delete, consent, transfer or cookie.",
  steps: [
    "Paste the old wording into 'Previous policy' and the new wording into 'Updated policy'.",
    "Leave 'Treat capitalization-only changes as equal' ticked so a re-cased heading is not counted as both an addition and a removal.",
    "The result gives added and removed counts plus privacy-sensitive changed lines, then lists the first 100 changes marked + or −.",
  ],
  intro:
    "This tool compares two versions of a privacy policy line by line and reports which lines were added, which were removed, and how many of those changed lines touch privacy-sensitive language. It splits both texts on line breaks, drops blank lines, and treats a line as changed when its trimmed text has no match in the other version — optionally ignoring capitalization. Any added or removed line containing collect, share, retain, delete, sell, consent, right, transfer, processor or cookie is counted separately as a privacy-sensitive change, so the substantive edits surface ahead of the cosmetic ones.",
  useCases: [
    "A vendor emails an updated privacy policy and you need to know within the hour whether the data-retention or data-sharing clauses moved before the renewal call.",
    "Your own legal team returns a revised policy and you have to write the changelog entry that tells users exactly what changed.",
    "You are keeping a compliance record of every policy revision and want a dated list of added and removed clauses filed with each version.",
  ],
  benefits: [
    ["Flags the clauses that matter", "Added and removed lines are re-scanned for ten data-practice keywords so retention and sharing edits are counted apart from wording tweaks."],
    ["Ignores capitalization noise", "One toggle makes a re-cased heading or sentence match its old version instead of showing as both an addition and a removal."],
    ["Counts before it lists", "You get the before-line total, after-line total and sensitive-change count up front, then the marked +/− lines beneath."],
  ],
  faqs: [
    [
      "How does it decide a line changed?",
      "A line counts as removed if its trimmed text appears nowhere in the new version, and as added if it appears nowhere in the old one. Matching is exact on the trimmed text, so moving a sentence between paragraphs shows as unchanged but rewording it shows as one removal plus one addition.",
    ],
    [
      "What makes a change 'privacy-sensitive'?",
      "A changed line is counted as privacy-sensitive when it contains any of ten keywords: collect, share, retain, delete, sell, consent, right, transfer, processor or cookie. That count appears as its own figure so you can see at a glance whether the revision touched actual data practices.",
    ],
    [
      "Is there a limit on how much policy text I can compare?",
      "The counts cover the whole document, but the marked line list is capped at the first 100 changes. For policies with more edits than that, compare one section at a time to see every line.",
    ],
    [
      "Can I rely on this for a legal or compliance sign-off?",
      "No — treat the output as informational triage, not a legal review. It reliably shows which lines differ, but whether a change is material to your obligations is a judgment call for a qualified privacy or legal professional.",
    ],
  ],
};

export default seo;
