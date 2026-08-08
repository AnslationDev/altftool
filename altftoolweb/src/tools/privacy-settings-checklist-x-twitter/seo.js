const seo = {
  title: "X (Twitter) Privacy Settings Checklist: 30 Controls",
  metaDescription:
    "Weighted audit of 30 X settings: phone and email discoverability, location on past posts, message requests and the Grok AI training switch.",
  steps: [
    "Choose Who are you locking this down for?, such as Pseudonymous account, and set a Target score (%).",
    "Tick each of the 30 settings already applied, from phone and email discoverability to the Grok AI training switch; a Critical one open caps the score at 69%.",
    "Read the Protection score, the critical settings still open, the biggest remaining exposure and the shortest route to your target.",
  ],
  "intro": "This checklist covers the 30 settings on X, formerly Twitter, that decide whether people can find you by phone number or email, what your posts and location tags reveal, who can message you and how your data is shared. It includes the discoverability pair that most often unmasks a pseudonymous account, the bulk removal of location information from past posts, the message-request options, the Grok AI training setting that was enabled by default for existing accounts, business-partner data sharing and connected apps. Each is weighted by exposure removed and re-weighted for whether you are anonymous, public, being harassed or minimising data.",
  "useCases": [
    "Stop a pseudonymous account being matched to your real identity through your phone number or email address.",
    "Strip location data from years of geotagged posts in one bulk action.",
    "Cut off crypto and sextortion DMs by closing message requests from people you do not follow.",
    "Opt out of your posts and assistant conversations being used to train X's AI models."
  ],
  "benefits": [
    [
      "Puts unmasking first",
      "Phone and email discoverability are the two settings that connect an anonymous handle to a real person — they lead the checklist."
    ],
    [
      "Covers opt-outs enabled by default",
      "The AI training and business-partner sharing switches were turned on for existing accounts without a prompt."
    ],
    [
      "Different scoring for different threats",
      "Being brigaded and staying anonymous produce very different orderings of the same 30 settings."
    ]
  ],
  "faqs": [
    [
      "How do I stop people finding my X account by my phone number?",
      "Settings and privacy > Privacy and safety > Discoverability and contacts, then turn off both 'let others find you by your phone number' and 'by your email address'. Also use Manage contacts > remove all contacts, because switching syncing off does not delete the address book already uploaded."
    ],
    [
      "How do I remove location data from my old tweets?",
      "Settings and privacy > Privacy and safety > Location information. There are two separate things there: stop adding location to new posts, and a bulk action that removes location information already attached to past posts. Most people do the first and never run the second."
    ],
    [
      "Is X using my posts to train Grok?",
      "There is a dedicated control at Settings and privacy > Privacy and safety > Grok and third-party collaborators, covering whether your posts, interactions and inputs train X's models and are shared with collaborators. It was switched on by default for existing accounts, so check rather than assume."
    ],
    [
      "Does protecting my posts hide what I already published?",
      "It stops non-followers seeing your posts from that point and removes them from public search, but anything already public may survive as screenshots, archived copies and quote posts elsewhere. Protecting is a forward-looking control, not a retroactive delete."
    ]
  ]
};

export default seo;
