const seo = {
  intro:
    "Reel Audio Usage Planner lists the audio you plan to use post by post and checks each track against four things: whether your account sees the consumer music catalogue or the commercial-use library, whether the post will be boosted as an ad, the platform's maximum clip length, and how recently the same track was used. It separates organic clearance from paid clearance, because a track that is fine on a personal organic reel usually cannot be used in a promoted post. Built for social managers and agencies who need an audit trail rather than a guess.",
  useCases: [
    "Check a month of brand reels before scheduling, so no post relies on a chart track a business account cannot use.",
    "Catch the case where a post is marked for boosting but the audio only clears organic use.",
    "Keep licence or invoice numbers next to each stock track so a takedown can be answered with proof.",
    "Spot the same audio being reused three posts apart across a campaign.",
  ],
  benefits: [
    ["Organic and paid checked separately", "The tool flags posts that are fine organically but would break the moment you boost them."],
    ["Length limits built in", "Each clip is checked against the platform maximum before you cut it."],
    ["Rotation tracking", "Reusing the same track too soon is flagged with the post number it clashes with."],
  ],
  faqs: [
    [
      "Can a business account use trending music on Instagram Reels?",
      "Usually not. Business and brand accounts are served a separate commercial-use music library, so most consumer chart tracks are unavailable or greyed out, and audio added another way can be muted or the post restricted in some countries. Switch to the commercial library or use original audio.",
    ],
    [
      "Why was my reel muted or made unavailable after posting?",
      "The most common cause is a rights match on music that is not licensed for your account type or your country. Platforms scan uploads and can mute the audio, block the post regionally or remove it entirely — using the in-app commercial library or your own recording avoids this.",
    ],
    [
      "Can I boost a post that uses music from the app's library?",
      "Only if the track is cleared for commercial use. Music from the consumer catalogue is licensed for organic personal posts, not paid promotion, so a boost will be rejected or the audio stripped. Tracks from the commercial-use library and your own original audio are the safe choices for ads.",
    ],
    [
      "How often can I reuse the same audio track?",
      "There is no platform rule against reusing a track, but repeating the same audio every few posts makes a feed monotonous and gives the algorithm less signal to work with. A gap of four or more posts is a reasonable default, and this planner flags anything closer.",
    ],
  ],
};

export default seo;
