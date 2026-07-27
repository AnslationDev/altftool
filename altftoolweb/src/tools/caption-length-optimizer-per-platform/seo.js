const seo = {
  intro:
    "Caption Length Optimizer measures one caption against the hard character limit and the visible-before-\"more\" fold of every major social platform at once. It counts by code point so an emoji costs one character, applies X's rule that any link counts as a fixed 23 characters after t.co wrapping, and shows the exact words that survive above each platform's fold. Limits covered include Instagram's 2,200, X's 280, LinkedIn's 3,000, Threads' 500 and a YouTube title's 100.",
  useCases: [
    "Repurpose one caption across Instagram, TikTok, LinkedIn and X without rewriting it four times to find what fits.",
    "Check whether the hook of a LinkedIn post survives the mobile \"...see more\" break at roughly 140 characters.",
    "Confirm a post with two links still fits X's 280 characters once t.co wrapping is applied.",
    "Catch a 31st hashtag before Instagram rejects the post at its 30-hashtag ceiling.",
  ],
  benefits: [
    [
      "Every platform at once",
      "One caption checked against twelve limits and fold points, with a per-platform pass or fail.",
    ],
    [
      "Link maths handled",
      "X charges 23 characters per URL regardless of length; that is applied automatically.",
    ],
    [
      "See the fold",
      "Each platform shows the exact visible slice, so you know whether the point lands before the cut.",
    ],
  ],
  faqs: [
    [
      "How long can an Instagram caption be?",
      "2,200 characters, but only about the first 125 show in the feed before \"... more\". Instagram also rejects a post carrying more than 30 hashtags, and hashtags count toward the same 2,200 characters.",
    ],
    [
      "How many characters is a post on X?",
      "280 characters on a standard account and 25,000 with Premium. Links are the catch: every URL is wrapped by t.co and counted as exactly 23 characters, so a 90-character link still only costs 23.",
    ],
    [
      "Where does LinkedIn cut off a post?",
      "The limit is 3,000 characters, and the feed collapses the post behind \"...see more\" at roughly 140 characters on mobile — earlier than on desktop. Front-load the claim in the first line or most readers never expand it.",
    ],
    [
      "Do emojis count as one character or two?",
      "It depends on the platform's counting method; this tool counts by Unicode code point, so a standard emoji costs one. Multi-part emoji such as flags or skin-tone and family sequences are made of several code points and can cost more, so leave a little headroom when a caption is right at the limit.",
    ],
  ],
};

export default seo;
