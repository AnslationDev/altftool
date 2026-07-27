const seo = {
  intro:
    "A pinned comment is the one comment that sits above the thread, and it does four jobs a description cannot: it corrects anything wrong in the video, carries the links people ask for, gives the audience a single thing to reply to, and stays visible on mobile where descriptions are collapsed. This generator assembles those parts in that order and checks the result against the comment character limit for the platform — 10,000 on YouTube, 2,200 on Instagram, 1,250 on LinkedIn — along with link count, timestamp formatting and whether an affiliate disclosure is actually present.",
  useCases: [
    "Post a correction the moment someone spots an error, without re-uploading or editing the description.",
    "Collect the gear, tools and sources from a video into one comment people can find from the mobile app.",
    "Seed a thread with a specific question so the first replies set the tone for the rest.",
    "Check that a comment carrying affiliate links includes a disclosure before it goes live.",
  ],
  benefits: [
    ["Correction first", "Errors sit at the top, which is the reason most people open a pinned comment at all."],
    ["Platform limits checked", "Character count is measured against the real comment limit for the platform you picked."],
    ["Timestamp and link parsing", "Badly formatted timestamps and unusable URLs are flagged before you paste."],
  ],
  faqs: [
    [
      "What is the character limit for a YouTube comment?",
      "Ten thousand characters. Instagram allows 2,200 in a comment and LinkedIn 1,250. Length is rarely the real constraint though — past about 900 characters a pinned comment stops being scannable and the detail belongs in the description.",
    ],
    [
      "What should a pinned comment say?",
      "Any correction first, then timestamps, then the links people will ask for, then one question that invites a specific reply. Ending with a question matters: a pinned comment that only lists links gives nobody a reason to respond.",
    ],
    [
      "Do too many links get a comment hidden?",
      "It can. Comments carrying several links are more likely to be held for review or filtered as spam, so around three is a sensible working limit. Put the rest in the description, where links are expected.",
    ],
    [
      "Do I need to disclose affiliate links in a pinned comment?",
      "If you earn from a link, the connection has to be disclosed clearly and near the link rather than buried elsewhere. This tool adds a plain disclosure line when you mark links as affiliate or sponsored — treat it as a starting point and check the rules that apply where you publish, since requirements differ by country.",
    ],
  ],
};

export default seo;
