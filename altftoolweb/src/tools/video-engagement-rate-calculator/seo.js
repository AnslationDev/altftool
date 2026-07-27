const seo = {
  intro:
    "The Video Engagement Rate Calculator divides your total engagements — likes plus comments plus shares plus saves — by views, by impressions and by follower count, so you get all three definitions of engagement rate from one set of numbers. It also returns view-through rate (views ÷ impressions), average percentage viewed (average view duration ÷ video length) and estimated total watch time (views × average view duration). Every figure is plain arithmetic on counts you paste from your own analytics export, so nothing is estimated or modelled.",
  useCases: [
    "Reporting a single engagement rate to a client who defines it against reach while your dashboard reports it against views.",
    "Comparing a 10-minute upload at 37% average percentage viewed against a 3-minute one at 62% to decide which format holds attention better.",
    "Converting views and average view duration into total watch hours to check progress towards a monetisation threshold.",
    "Spotting a distribution problem rather than a content problem when impressions are high but view-through rate is under 3%.",
  ],
  benefits: [
    ["Three denominators at once", "Views, impressions and followers side by side, so you can answer whichever definition is asked for."],
    ["Retention included", "Average percentage viewed and total watch time sit next to engagement, where they belong."],
    ["No silent bad maths", "Impossible inputs — zero views, impressions below views, view duration longer than the video — are refused rather than rounded away."],
  ],
  faqs: [
    [
      "How do you calculate video engagement rate?",
      "Add likes, comments, shares and saves to get total engagements, then divide by the denominator you are reporting against and multiply by 100. Against views: 5,000 engagements on 100,000 views is a 5% engagement rate; the same 5,000 against 250,000 followers is 2%.",
    ],
    [
      "What is a good engagement rate for a video?",
      "It depends entirely on the platform, niche and denominator, which is why no single number is safe to quote. Measured against views, creator reporting shorthand treats roughly 1-3% as typical and above 6% as strong, but your own median across the last 20 uploads is a far more reliable benchmark than any published figure.",
    ],
    [
      "What is the difference between engagement rate by reach and by views?",
      "Engagement rate by reach (impressions) divides by everyone the video was shown to, including people who scrolled past; engagement rate by views divides only by people who actually watched. Reach-based rates are always the lower of the two, so always state which one you are quoting.",
    ],
    [
      "How is average percentage viewed calculated?",
      "Divide average view duration by the full video length and multiply by 100 — 3 minutes 42 seconds on a 10-minute video is 37%. Because longer videos naturally score lower, compare percentage viewed only between videos of similar length, and look at absolute watch time as well.",
    ],
  ],
};

export default seo;
