const seo = {
  title: "Netflix or Prime Payment-Failed Email: Real or Fake",
  metaDescription:
    "Paste the sender and button link from a streaming payment-failed email; it checks them against netflix.com, primevideo.com, disneyplus.com and more.",
  steps: [
    "Pick the brand under Service it claims to be from — Netflix, Amazon Prime Video, Disney+, JioHotstar / Hotstar, Spotify, YouTube Premium or Apple TV+.",
    "Fill in Sender address and Where the update payment button goes, paste the visible Message text, and tick the attached invoice or receipt box if one came.",
    "Read the Red-flag score out of 100 with its band and the Red flag and Caution findings, then follow the Check it the safe way instead route.",
  ],
  intro:
    "A payment-failed streaming email is judged on the registrable domain its button leads to, not on how closely the page copies the brand. This page compares the sender and link against the domains each service actually uses — netflix.com, primevideo.com and the regional amazon sites, disneyplus.com, hotstar.com, spotify.com, youtube.com — flags card-detail requests, deadline pressure and template reuse where a kit mentions two brands at once, and points you to the in-app route that answers the question for good.",
  useCases: [
    "A 'your membership is on hold' email arrives and you want to check the button before entering a card.",
    "Two different services appear to email about the same failed payment on the same day.",
    "Explaining to a family member why the padlock and the correct logo prove nothing about who owns the page.",
    "Deciding whether a genuine renewal actually failed, without touching the link you were sent.",
  ],
  benefits: [
    ["Per-service domain lists", "Each service is checked against its own domains rather than a generic 'looks suspicious' rule."],
    ["Spots reused phishing kits", "If the text names Prime Video while claiming to be Netflix, the template was recycled and never fully edited."],
    ["Always gives the in-app answer", "Every result ends with the exact path — app, account page or payments record — where the real billing state lives."],
  ],
  faqs: [
    [
      "Is the Netflix 'payment declined' email real?",
      "Check where the button goes: the host immediately before the first single slash must be netflix.com. Netflix's own guidance says it never asks for payment details by email or text, so any message that collects a card number is fake. Open the Netflix app and look at Account, Membership and Billing instead — a genuine failure is shown there.",
    ],
    [
      "How do I know if an Amazon Prime Video email is genuine?",
      "Open the Amazon app or site yourself and go to Your Account, then Message Centre. Amazon keeps a copy of every message it genuinely sent you there, so if the payment email is missing from that list, it did not come from Amazon.",
    ],
    [
      "The link starts with netflix.com — why is it still fake?",
      "Because the brand is only a subdomain. In netflix.com.billing-update.io the owner is billing-update.io and everything to its left is a label that owner chose. Read the host right to left and stop at the last two or three parts before the first single slash.",
    ],
    [
      "I already entered my card on a fake billing page — what should I do?",
      "Contact your bank or card issuer immediately, report the card as compromised and ask about a block or replacement; if you also gave a one-time code, say so, because that lets a payment be authorised in real time. Change the password on the streaming account and any other account using the same password. This is general information — your bank's fraud team will advise on your specific case.",
    ],
  ],
};

export default seo;
