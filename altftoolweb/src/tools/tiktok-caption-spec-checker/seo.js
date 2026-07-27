const seo = {
  intro:
    "The TikTok Caption Spec Checker measures a caption against TikTok's 2,200 character field and tests whether burned-in on-screen text clears the app's interface. It counts characters by Unicode code point (so an emoji counts once, not twice), separates hashtag and mention characters from the readable hook, shows the opening 100 characters that appear before the \"more\" link, and maps a text block against the standard 1080 x 1920 safe-zone margins used in creator templates. Built for editors and social managers who need a caption and a title card to survive the upload without being clipped or covered.",
  useCases: [
    "Confirm a long storytelling caption fits inside the 2,200 character field before you paste it into the TikTok upload screen.",
    "Rewrite the opening line so the hook lands inside the ~100 characters shown before the caption is truncated with \"more\".",
    "Position a title card in your editor so it does not sit under the like, comment and share column on the right edge.",
    "Check that repurposed 1920 x 1080 landscape footage has been reframed to 9:16 before it goes out as a TikTok post.",
  ],
  benefits: [
    ["Counts the way the field does", "Code-point counting means emoji and accented characters are measured as one character each."],
    ["Separates hook from hashtags", "Shows how many characters go to tags and mentions versus the copy a viewer actually reads."],
    ["Catches covered text", "Reports pixel overlap on each edge and suggests a corrected position inside the safe area."],
  ],
  faqs: [
    [
      "How many characters can a TikTok caption be?",
      "2,200 characters. TikTok raised the caption field from 300 to 2,200 characters in 2022, and hashtags and @mentions are counted inside that same budget rather than added on top.",
    ],
    [
      "How much of my TikTok caption is visible before people tap more?",
      "Roughly the first 100 characters, or about one to two lines on a phone. Everything after that is hidden behind the \"more\" link, so put the hook and the payoff promise at the very start and push hashtags to the end.",
    ],
    [
      "What is the TikTok safe zone for on-screen text?",
      "On a 1080 x 1920 frame, creator templates commonly reserve about 130px at the top for the tab row, 320px at the bottom for the username, caption and nav bar, 140px on the right for the like and share column, and a small left gutter. Keep titles and captions inside the remaining rectangle. These are template conventions, not a published TikTok specification, so preview the upload before publishing.",
    ],
    [
      "Do hashtags count toward the TikTok caption limit?",
      "Yes. Every character of every hashtag, including the # symbol, comes out of the same 2,200 characters. This checker reports hashtag characters separately so you can see how much of the budget tags are consuming.",
    ],
  ],
};

export default seo;
