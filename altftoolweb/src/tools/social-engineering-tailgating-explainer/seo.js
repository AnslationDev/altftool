const seo = {
  title: "Tailgating Risk: Unsupervised Door Openings Per Day",
  metaDescription:
    "Headcount x trips plus visitors and deliveries gives openings a day; entrance type sets how many nobody supervises. Get the control tier and scripts.",
  steps: [
    "Enter \"People using this entrance\", \"Trips through it per person per day\", \"Visitors per day\" and \"Deliveries and contractor visits per day\".",
    "Answer \"What is the entrance?\" and \"What is behind the door?\", then tick the controls already in place across the three tiers.",
    "Read the unsupervised door openings per day, the control tier the site needs, and the four polite challenge scripts, then press \"Copy result\".",
  ],
  intro:
    "Tailgating is walking into a controlled area behind someone who is authorised, and this explainer sizes it as an opportunity count rather than a scare story: door openings per day equal headcount times trips per person, plus visitors and deliveries. The share of those openings nobody supervises comes from what the entrance actually is — an unstaffed badge reader leaves roughly three quarters of openings unsupervised, a staffed reception far fewer, and speed gates with anti-passback admit one person per authorisation. Policies such as visible badges, escorting and permission to challenge reduce the remainder multiplicatively, and the tool then names the control tier the site needs and the polite scripts that make challenging normal.",
  useCases: [
    "Building a case for speed gates by showing how many unsupervised openings a badge-reader door produces each year.",
    "Choosing between a staffed reception and an access-control upgrade for a growing office.",
    "Writing a badge policy that people will actually follow, including what to say at the door.",
    "Reviewing contractor and leaver badge handling before a client security assessment.",
  ],
  benefits: [
    ["A number, not a lecture", "Turns access control into openings per day and per year, which is the language a budget conversation needs."],
    ["Tiered recommendations", "Policy, supervision and physical enforcement are separated so you buy in the right order."],
    ["Scripts included", "Four non-confrontational lines that let staff refuse without feeling rude."],
  ],
  faqs: [
    [
      "What is tailgating in physical security?",
      "It is entering a controlled area by following an authorised person through the door, without presenting your own credential. Piggybacking is the variant where the authorised person knowingly holds the door open; both defeat a badge reader because the reader only counts authorisations, not bodies.",
    ],
    [
      "How do you stop tailgating in an office?",
      "In order of effect: give staff written permission and words to challenge, escort every visitor, require visible badges, alarm propped doors, and then, if the site warrants it, install speed gates or an airlock with anti-passback so one authorisation admits one person. Behaviour alone stops scaling once a busy entrance passes a few hundred openings a day.",
    ],
    [
      "Should employees physically stop a tailgater?",
      "No. Nobody should block, grab or detain anyone — the response is to badge in for yourself, let the door close, and direct the person to reception, then tell security or the facilities team. A policy that expects confrontation puts staff at risk and will be quietly ignored.",
    ],
    [
      "What is anti-passback and why does it matter?",
      "Anti-passback records the direction of each badge use and refuses a second entry until that badge has been used to exit, which prevents one person badging in and passing the card back. It is the control that removes consensual badge sharing, and it only works where every entry and exit is read.",
    ],
  ],
};

export default seo;
