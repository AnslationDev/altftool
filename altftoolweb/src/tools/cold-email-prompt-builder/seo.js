const seo = {
  intro:
    "The Cold Email Prompt Builder writes an AI drafting prompt for a single outreach email, sized in words and built around three things that decide whether it gets a reply: a specific persona, a real trigger event, and exactly one ask. It allocates your word budget across opener, value section and ask, and flags any length outside the roughly 50-125 word band that Boomerang's analysis of millions of email threads found responded best. Six trigger types and four ask types each swap a different structural instruction into the prompt.",
  useCases: [
    "A founder emailing a Head of RevOps after a Series B gets a 100-word plan — 20-word trigger opener, 65-word value section, 15-word ask — plus three subject lines under 40 characters.",
    "An SDR with no trigger event to reference uses the pure-cold setting, which forces the opening line to prove research instead of faking familiarity.",
    "A consultant who keeps stacking asks uses the referral option to produce an email that ends on one name-answerable question rather than a calendar link and a question and an attachment.",
  ],
  benefits: [
    [
      "Length that gets replies",
      "Warns when the email falls outside the roughly 50-125 word band associated with the best response rates.",
    ],
    [
      "One ask, enforced",
      "The prompt states explicitly that the email contains a single ask, and names which of the four it is.",
    ],
    [
      "No invented facts",
      "Drafts come back with [detail needed] markers instead of fabricated customers, metrics or events.",
    ],
  ],
  faqs: [
    [
      "How long should a cold email be?",
      "Roughly 50 to 125 words. Boomerang's analysis of millions of email threads found response rates peaked in that band and fell off on both sides, and 100 words is about 25 seconds of reading at the average adult silent reading rate of 238 words per minute. This builder budgets the opener, value section and ask inside whatever total you set and warns you when you leave the band.",
    ],
    [
      "What makes a good cold email subject line?",
      "Short, lowercase and specific to the recipient. Mobile mail clients cut subjects off at roughly 35 to 40 characters, so the generated prompt caps subject lines at 40 characters, asks for three options, and requires them to reference the trigger event or the outcome rather than reading like a campaign.",
    ],
    [
      "Is cold emailing legal?",
      "In the United States cold email is legal under the CAN-SPAM Act of 2003 provided the message uses accurate header and subject information, discloses that it is a commercial message, includes a valid physical postal address, and offers an opt-out that is honoured within 10 business days. Rules differ elsewhere — the EU and UK generally require a lawful basis under GDPR and the ePrivacy rules, and India, Canada and Australia each have their own regime. Check your jurisdiction, and take legal advice before running outreach at scale.",
    ],
    [
      "What is a trigger event in cold outreach?",
      "An observable, dateable reason to write today — a funding round, a new hire into a relevant role, a published talk, a product launch or an open job posting. It matters because the opening line is the part a recipient uses to decide whether the email was written for them or blasted to a list. This tool includes a no-trigger option that instead demands one specific verifiable observation a mail-merge could not produce.",
    ],
  ],
};

export default seo;
