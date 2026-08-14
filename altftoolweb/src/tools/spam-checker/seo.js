const seo = {
  title: "Email Spam Checker — Score Your Draft 1–10 Before Sending",
  metaDescription:
    "Paste subject and body to get a 1–10 spam score with the exact keyword, link, ALL-CAPS and punctuation counts behind it, plus specific fixes.",
  steps: [
    "Fill in the Sender Email, Recipient Email, Subject Line and Email Body fields of the draft.",
    "Click Check for Spam to score the text against 17 spam keywords, URL count, punctuation runs, ALL CAPS words and the sender's domain.",
    "Read the 1–10 score with its Looks Good, Needs Improvement or High Risk band, the Analysis Breakdown counts and the numbered Improvement Tips.",
  ],
  intro:
    "This spam checker scores a draft email from 1 to 10 by scanning the subject and body for the signals bulk filters react to, then tells you which ones to fix. It weighs promotional keywords, link count, punctuation runs like !! and $$, ALL CAPS words, and whether the sender address is a valid mailbox on a business domain. It is aimed at anyone about to send a cold outreach, newsletter or job-application email who wants to know the copy will not read as bulk mail before they hit send.",
  useCases: [
    "You wrote a cold sales email that says free, limited time and act now, and want to see how many of those phrases the score is actually penalising before you rewrite it.",
    "Your newsletter draft has six tracking links in it and you need to know whether that alone is enough to push the risk band from green to red.",
    "You are applying for jobs from a Gmail address and want to confirm the subject line and body do not look promotional to a recruiter's inbox filter.",
  ],
  benefits: [
    ["Shows the arithmetic", "The breakdown panel lists the exact keyword count, URL count, punctuation runs and ALL CAPS words behind the score instead of a bare verdict."],
    ["Fix list, not just a grade", "Every penalty that fired becomes a specific instruction, such as trimming links to one or two or dropping caps from the subject."],
    ["Judges the sender too", "A free-provider from-address combined with sale, offer, discount or buy wording adds to the score, which pure body-text checkers miss."],
  ],
  faqs: [
    [
      "What is a good spam score here?",
      "3 or below is the green band labelled Looks Good, 4 to 6 is Needs Improvement, and 7 to 10 is High Risk. The scale is capped at 1 at the bottom and 10 at the top, so a completely clean email still shows 1 rather than 0.",
    ],
    [
      "How many links can I put in an email before it hurts?",
      "Links add one point each up to a maximum of 3 penalty points, and the tool starts telling you to cut back once it counts more than 2. Keeping to one or two links is the recommendation it gives.",
    ],
    [
      "Which words does it treat as spam keywords?",
      "It matches 17 phrases across the subject and body, including free, discount, buy now, limited time, click here, congratulations, winner, urgent, guarantee, risk free, prize and claim now. Matches add one point each up to a ceiling of 5.",
    ],
    [
      "Does a low score guarantee my email reaches the inbox?",
      "No. This checks the content signals you control in the draft; real delivery also depends on SPF, DKIM and DMARC authentication, your sending domain's reputation, list hygiene and recipient engagement, none of which can be read from the text.",
    ],
  ],
};

export default seo;
