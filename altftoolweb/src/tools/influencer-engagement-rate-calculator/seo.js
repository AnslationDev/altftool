const seo = {
  title: "Engagement Rate Calculator — Followers, Reach",
  metaDescription:
    "Compute engagement rate three ways — by followers, reach and impressions — from one batch of post totals, plus creator tier and comment/save share.",
  steps: [
    "Enter your \"Followers\", \"Posts these totals cover\" and the batch totals for likes, comments, \"Total shares / sends\" and \"Total saves / bookmarks\".",
    "Add \"Total reach (optional)\" and \"Total impressions (optional)\" to unlock ER by reach, ER by impressions and reach rate vs followers.",
    "Read ER by followers with its band and creator tier, check \"What a target rate needs\" in engagements per post, then click \"Copy result\".",
  ],
  intro:
    "Engagement rate is total engagements divided by an audience denominator, and this calculator runs all three standard denominators from one set of post totals: followers, reach and impressions. It also reports the creator tier by follower count, reach rate against followers, and how much of the engagement came from comments and saves rather than passive likes. Useful for creators building a media kit and for brands sanity-checking one before they pay for a collaboration.",
  useCases: [
    "Build a media kit line that says 3.7% ER across the last 12 posts instead of quoting a single lucky reel.",
    "Check whether a creator's headline rate was calculated on reach rather than followers, which always flatters the number.",
    "Spot a post that reached far beyond the follower base — a reach rate above 100% means the algorithm pushed it out.",
    "See whether engagement is comment-led or like-led before choosing a creator for a product launch that needs discussion.",
  ],
  benefits: [
    ["All three denominators at once", "Followers, reach and impressions from the same engagement total, so mismatched quotes are obvious."],
    ["Batch of posts, not one", "Totals across several posts smooth out a single viral outlier."],
    ["Quality of engagement", "Comment and save share reveal whether attention is passive or active."],
  ],
  faqs: [
    [
      "How do you calculate engagement rate?",
      "Add likes, comments, shares and saves, then divide by your chosen denominator and multiply by 100. Using followers: 925 engagements on a post with 25,000 followers is 925 / 25,000 x 100 = 3.7%. Using reach, divide by the unique accounts the post reached instead.",
    ],
    [
      "What is a good engagement rate for an influencer?",
      "As a rule of thumb on image and short-video feeds, under 1% is weak, 1-3% is a healthy working range, 3-6% is strong and above 6% is exceptional enough to be worth verifying. Rates fall as follower count rises, so a nano creator and a mega creator should not be judged on the same number.",
    ],
    [
      "Should engagement rate use followers, reach or impressions?",
      "Use followers when comparing creators of similar size, because it is the only denominator that cannot be inflated by the algorithm. Use reach when judging how well a specific post performed with the people who actually saw it. ER by impressions is always the lowest of the three since impressions count repeat views.",
    ],
    [
      "Can a reach rate be over 100%?",
      "Yes. Reach rate is reach divided by followers, so a post pushed onto Explore, Reels or a recommendation feed can reach several times the follower count. A consistently high reach rate with a low follower-based ER usually means the audience seeing the post is not the audience that follows it.",
    ],
  ],
};

export default seo;
