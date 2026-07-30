const seo = {
  intro:
    "Friendship Meter scores a friendship out of 100 by combining a deterministic hash of the two names with three things you answer about the bond itself: how your friend would react to a crisis call, how often you two actually talk, and how many of eight shared activities you have in common. Each shared interest adds 4 points, the crisis answer swings the score by -5 to +15 and contact frequency adds 5 to 15, with the total clamped between 15 and 99 and broken out into loyalty, trust, fun and mutual support. It is a for-fun compatibility toy — the same pair of names always returns the same base score, in either order — and the result can be copied or downloaded as a short text report.",
  useCases: [
    "Settling a running joke in a group chat about who is whose actual best friend, and posting the report card as proof",
    "Making a Friendship Day or birthday post with a shareable score and a verdict line instead of a plain caption",
    "Starting a conversation about a friendship that has drifted, using the honest \"how often do we actually talk\" question as the prompt",
  ],
  benefits: [
    ["Answers move the number, not just the names", "Crisis response, contact frequency and shared activities all feed the score, so two different friendships with the same names do not score alike."],
    ["Repeatable, not random", "The name component is a hash rather than a random draw and is order-independent, so A & B gives the same result as B & A every time."],
    ["A report you can keep", "Loyalty, trust, fun and mutual support are broken out separately and the whole thing exports as a plain-text report you can copy or download."],
  ],
  faqs: [
    [
      "How is the friendship score calculated?",
      "A base score of 15 to 99 is derived from a hash of both names, then adjusted: up to +15 for how your friend would answer a crisis call (or -5 if they would complain about the hour), 5 to 15 for how often you are in contact, and 4 points for each of the eight shared activities you tick. The final figure is clamped to the 15-99 range.",
    ],
    [
      "Will I get the same score if I run it again?",
      "Yes, as long as you give the same names and the same answers — nothing is randomised. Swapping the order of the two names also makes no difference, because the names are sorted before hashing.",
    ],
    [
      "What do the score bands mean?",
      "90 and above is \"Ride-or-Die Besties\", 70 and above \"Close Confidants\", 50 and above \"Good Buddies\", and anything below 50 reads as \"Casual Acquaintances\". Each band comes with a short description of what that kind of bond usually looks like.",
    ],
    [
      "Is this an actual measure of friendship?",
      "No — it is entertainment. Part of the score comes from a name hash, which has nothing to do with your relationship, and no quiz can quantify a friendship. Treat a low number as a prompt to spend time together, not as a verdict.",
    ],
  ],
};

export default seo;
