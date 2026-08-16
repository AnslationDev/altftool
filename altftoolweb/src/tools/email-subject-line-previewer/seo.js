const seo = {
  title: "Subject Line Preview: Gmail, Outlook, Apple Mail",
  metaDescription:
    "See where your subject and preview text cut off at 38, 46, 54 and 68 characters, and score the line out of 100 as you type.",
  steps: [
    "In the Subject Builder, type into Subject line (counter reads 'ideal: 30-55') and Preview text (reads 'ideal: 40-95'), and set Sender name and Recipient inbox.",
    "Watch the four inbox previews cut the subject at Gmail Mobile 38, Apple Mail 46, Outlook 54 and Gmail Desktop 68 characters, with preview text capped between 72 and 96.",
    "Read the score out of 100 with the Readiness, Mobile Fit, Preheader and Risk Level tiles, then take an A/B option from Variant Lab using its 'Use variant' or 'Copy variant' button.",
  ],
  intro:
    "The Email Subject Line Previewer shows exactly where your subject line and preview text get cut off in four inboxes — Gmail Mobile at 38 characters, Apple Mail at 46, Outlook at 54 and Gmail Desktop at 68 — and scores the line out of 100 as you type. It is built for anyone about to press send on a campaign who wants to know whether the important half of the sentence survives truncation. The score starts at 100 and moves on measurable traits: length, word count, missing preview text, spam-trigger words, numbers, questions, personalisation tokens and emoji.",
  useCases: [
    "You wrote a 74-character subject line and want to see whether the call to action still shows on a phone, where Gmail cuts at 38 characters, before the send goes out to your list.",
    "Open rates dropped on your last two newsletters and you want to check whether words like 'free', 'urgent' or 'act now' in the subject are what the scorer is penalising.",
    "You need a second and third option for an A/B split, so you generate variants from your base line and pick the one that fits inside the Outlook 54-character cut.",
  ],
  benefits: [
    [
      "Per-client truncation, not one generic limit",
      "Each of the four inbox previews applies its own subject and preview-text limit, so you can see the same line survive on desktop and break on mobile.",
    ],
    [
      "Transparent scoring",
      "Every point is traceable: -18 for going over 60 characters, -12 for empty preview text, -9 per spam word, +5 for including a number.",
    ],
    [
      "Preview text treated as a real field",
      "The preheader is previewed and scored alongside the subject, with its own per-client limits from 72 to 96 characters.",
    ],
  ],
  faqs: [
    [
      "How long should an email subject line be?",
      "Aim for roughly 20 to 60 characters. This tool deducts 10 points below 20 characters and 18 points above 60, because Gmail Mobile shows about 38 characters, Apple Mail about 46 and Outlook about 54 — anything past that is invisible on the screens where most email is first opened.",
    ],
    [
      "How long can the preview text be before it gets cut?",
      "Between 72 and 96 characters depending on the client — Gmail Mobile shows about 72, Apple Mail 82, Outlook 88 and Gmail Desktop 96. Preview text over 110 characters costs 8 points in the score, and leaving it blank costs 12.",
    ],
    [
      "Which words hurt a subject line score?",
      "Ten common spam triggers each cost 9 points: free, guarantee, urgent, winner, cash, limited time, act now, risk-free, click here and 100%. Five weak filler words — newsletter, update, important, announcement and reminder — cost 3 points each because they say nothing about the actual contents.",
    ],
    [
      "Do emoji and numbers help subject lines?",
      "In this scorer, yes, but modestly: a number adds 5 points, a personalisation token like {first_name} adds 4, a question mark adds 3 and an emoji adds 2. These reflect common email-marketing patterns rather than a guarantee — the only reliable measure for your own list is an A/B test.",
    ],
  ],
};

export default seo;
