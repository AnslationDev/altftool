const seo = {
  title: "WhatsApp Business Quick Replies: 10 Ready",
  metaDescription:
    "Fill 10 customer replies with your business name, hours and links in English, Hindi or Hinglish. Shortcuts under 25 chars, messages under 1,024.",
  steps: [
    "Fill in Business name, Business hours, Usual delivery time, Catalogue link and Phone number, then set Language to English, Hindi or Hinglish.",
    "Tick which of the ten to build under 'Templates to include' — Greeting message, Away / after hours, Order status, Return / refund policy and the rest.",
    "Each card shows its /shortcut and its length against 1,024 characters; press Copy result for the whole set or Copy on a single reply.",
  ],
  intro:
    "This builder fills a set of ten customer-reply templates — greeting, away, hours, catalogue, order status, delay, payment, returns, thank-you and quote follow-up — with your business name, hours, delivery time and links, in English, Hindi or Hinglish. Each generated reply gets a shortcut in the form the WhatsApp Business app accepts (lowercase, no spaces, 25 characters or fewer) and a live count against the 1,024-character quick-reply limit. Meant for shop owners and solo sellers who answer the same eight questions every day.",
  useCases: [
    "Set up quick replies for a new WhatsApp Business account in one sitting instead of typing them into the app blind.",
    "Give a part-time helper a fixed script so customers get the same answer whoever picks up the phone.",
    "Switch the whole reply set from English to Hindi or Hinglish for a local customer base.",
    "Write an away message with your real opening hours so after-hours enquiries stop going unanswered.",
  ],
  benefits: [
    [
      "Shortcuts that the app will accept",
      "Every shortcut is lowercased, stripped of spaces and cut to 25 characters, and duplicates are made unique.",
    ],
    [
      "Character count against the real limit",
      "Each reply shows its length against the 1,024-character ceiling before you paste it into the app.",
    ],
    [
      "No unfilled placeholders",
      "Any token you have not supplied — like the catalogue link — is listed so it never gets sent to a customer as text.",
    ],
  ],
  faqs: [
    [
      "How many quick replies can WhatsApp Business save?",
      "The WhatsApp Business app stores up to 50 quick replies per account, each with a shortcut of at most 25 characters and a message of at most 1,024 characters. Greeting and away messages are separate settings and do not use a quick-reply slot.",
    ],
    [
      "How do I add a quick reply in WhatsApp Business?",
      "Open Settings, then Business tools, then Quick replies, tap the add button, type the message and a shortcut, and save. In a chat you then type '/' followed by the shortcut and pick the reply from the list.",
    ],
    [
      "What is the difference between a quick reply and a message template?",
      "Quick replies live in the WhatsApp Business app, are typed manually with '/' and need no approval. Message templates belong to the WhatsApp Business Platform (API), use numbered variables like {{1}} and must be submitted to Meta for approval before you can send them outside the 24-hour customer service window.",
    ],
    [
      "Can I use emoji and formatting in a WhatsApp reply?",
      "Yes — WhatsApp supports *bold*, _italic_ and ~strikethrough~ using asterisks, underscores and tildes, and emoji count towards the character limit like any other character. Keep formatting light: heavy styling reads as spam and breaks when a customer copies the text.",
    ],
  ],
};

export default seo;
