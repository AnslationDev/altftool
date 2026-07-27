const seo = {
  intro:
    "The Real Estate Agent Prompt Pack is a library of 12 fill-in-the-blank AI prompts covering the work agents repeat every week: listing descriptions, portal headlines, walkthrough video scripts, seller and expired-listing outreach, neighbourhood guides, buyer briefs, viewing feedback, offer presentation, price-reduction conversations and post-completion follow-up. Every prompt carries the same standing rule — describe the property, never the sort of person who should buy it — and everything you type is screened against 24 phrases that HUD advertising guidance flags under section 3604(c) of the Fair Housing Act. Fill the blanks in your browser and paste the finished prompt into any assistant.",
  useCases: [
    "Turning a fact sheet into a 60-word portal summary, a 180-word full description and a 25-word social caption without inventing anything about the schools or the commute.",
    "Rewriting a neighbourhood guide that currently says 'safe area' and 'good schools' into checkable facts about transport, housing stock and amenities.",
    "Presenting a 412k offer against a 425k asking price by valuing the chain-free position and eight-week completion explicitly, so the seller can disagree with the reasoning.",
  ],
  benefits: [
    ["Fair housing screen built in", "Checks your text against 24 phrases HUD guidance repeatedly flags — 'perfect for families', 'safe neighborhood', 'walking distance' — and names the protected class and a safer rewrite."],
    ["Facts in, no invention out", "Every prompt tells the model to work only from the details you supplied and to list anything unverified as 'verify before publishing'."],
    ["Runs in your browser", "No account and no API key; nothing about your seller, buyer or listing is sent anywhere."],
  ],
  faqs: [
    [
      "What words can you not use in a real estate listing?",
      "Anything that indicates a preference, limitation or discrimination based on a protected class — 'no children', 'adults only', 'perfect for families', 'safe neighborhood', 'good schools', 'exclusive', 'no Section 8' and 'walking distance' are the ones HUD guidance and NAR training flag most often. Section 3604(c) of the Fair Housing Act makes publishing such an advertisement unlawful whether or not anyone was actually turned away, so this pack screens your input against 24 of them.",
    ],
    [
      "Which classes does the federal Fair Housing Act protect?",
      "Seven: race, colour, religion, sex, national origin, disability and familial status. Race, colour, religion, sex and national origin come from the Civil Rights Act of 1968; disability and familial status were added by the Fair Housing Amendments Act of 1988; and HUD's February 2021 memorandum applies 'sex' to include sexual orientation and gender identity. Many states and cities add more, such as source of income, age or marital status.",
    ],
    [
      "Why is 'walking distance' a problem in listing copy?",
      "It assumes an ability, which brings disability into an advertisement. HUD guidance prefers a measured figure, so write '0.4 miles to the station' or '8 minutes by bus' instead. The same logic applies to 'able-bodied' and 'handicapped' — describe the building, such as 'step-free entrance, 36-inch doorways', not the occupant.",
    ],
    [
      "Can AI write my property listings?",
      "It can draft them, but you remain the responsible party for accuracy and for fair housing compliance under section 3604(c), and portals hold you to their own accuracy policies. These prompts constrain the model to the facts you supply, cap the adjectives, and require it to list separately anything it could not verify — but every draft still needs your read before it goes live.",
    ],
  ],
};

export default seo;
