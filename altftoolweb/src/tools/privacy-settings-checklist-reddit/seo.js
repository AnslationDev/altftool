const seo = {
  title: "Reddit Privacy Checklist: 27 Settings and Habits",
  metaDescription:
    "Scores 27 Reddit controls by how much identity linkage they remove, re-weights for 5 risk profiles, and caps you at 69% while a critical one is open.",
  steps: [
    "Answer 'Who are you locking this down for?' — Pseudonymous main account, Throwaway or second account, Posting under your real name, Subreddit moderator or Balanced — and set your Target score (%).",
    "Tick what you have already applied across Identity linkage, What your history reveals, Who can reach you, Ads and tracking and Account security, or use Mark all applied and Clear all.",
    "Read your weighted score with 'Remaining exposure by area' and 'Shortest route to your target', then press Copy result.",
  ],
  "intro": "This checklist scores a Reddit account against 27 real privacy controls and habits — search-engine indexing, the active-communities panel, public vote history, chat and private-message limits, ad personalisation, third-party app tokens and two-factor authentication — weighting each by how much identity linkage it actually removes. Reddit is unusual in that the highest-risk exposures are not toggles: your username is permanent, your comment history is public by default, and third-party archives keep copies of what you delete, so the audit gives those items the heaviest weights. Five risk profiles re-score the same list, and five controls are marked critical and cap the score at 69% while any is still open.",
  "useCases": [
    "Check whether a pseudonymous account you have posted from for years can still be traced back to your real name.",
    "Set up a throwaway properly before posting something personal, instead of discovering the linkage afterwards.",
    "Harden a moderator account against a brigading campaign, focusing on message controls and two-factor authentication.",
    "Audit an account you post from under your real name, so at least the ad tracking and third-party tokens are cleaned up."
  ],
  "benefits": [
    [
      "Weighted by real exposure",
      "A permanent reused username outscores a dozen ad toggles, because that is how deanonymisation actually happens."
    ],
    [
      "Covers habits, not just switches",
      "Comment history, posting times and archive copies are on the list, because Reddit has no setting for any of them."
    ],
    [
      "Nothing leaves the tab",
      "The checklist runs entirely in your browser and never asks for a username, password or login code."
    ]
  ],
  "faqs": [
    [
      "Does deleting my Reddit account delete my comments?",
      "No. Deleting the account detaches your username from your posts — they stay visible attributed to [deleted] — and it does not touch the third-party archives and mirror sites that copied them earlier. To remove your own text you have to edit each comment and then delete it, and even that only affects copies made after the edit."
    ],
    [
      "Can people see what I upvote on Reddit?",
      "Only if you have switched it on. Reddit keeps upvote and downvote history private by default, and the “Make my upvotes public” and “Make my downvotes public” toggles under Settings > Privacy and Safety are what expose it. Moderators cannot see your individual votes either."
    ],
    [
      "How do I stop my Reddit profile appearing in Google?",
      "Turn off “Show up in search results” under Settings > Privacy and Safety, which asks search engines not to index your profile page. It does not remove pages already indexed, and it does nothing about the mirror sites that republish Reddit threads, so expect old results to persist for a while."
    ],
    [
      "Can I change my Reddit username?",
      "No. Reddit usernames are permanent — the only way to get a different one is to create a new account. That is why reusing a handle from another site is the single highest-weighted item here: once it is set, no privacy setting can break the link."
    ]
  ]
};

export default seo;
