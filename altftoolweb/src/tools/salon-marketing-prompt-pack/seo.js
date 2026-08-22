const seo = {
  title: "Salon Marketing Prompt Pack: 4 Prompts to Copy",
  metaDescription:
    "Name your salon type, offer and audience, then copy four prompts: Instagram captions, a WhatsApp broadcast, a Google Business post and review replies.",
  steps: [
    "Fill in \"Salon type\", \"Offer/service\" and \"Audience\" — the defaults are a hair salon running a monsoon hair repair package for local working professionals.",
    "Set \"Channels\" to the places you actually post (Instagram, WhatsApp, Google Business); the \"Prompt pack\" panel rebuilds with your business, offer, audience and channels stamped at the top.",
    "Press \"Copy output\" to take all four prompts — Instagram caption (5 options with a booking CTA), WhatsApp broadcast, Google Business post under 120 words, and review replies — into your AI assistant.",
  ],
  intro:
    "Salon Marketing Prompt Pack fills ten ready-written AI prompts — offers, appointment reminders, before-and-after captions, rebooking nudges, review requests, stylist introductions, quiet-day fillers, cancellation-policy notes, package pitches and Google Business Profile updates — with your salon name, city, service and booking line, and stamps each one with the real character budget for its channel. SMS budgets come from GSM 03.38 itself: 160 characters in a single 7-bit segment, 153 per segment once a message concatenates, dropping to 70 and 67 the moment a single emoji or non-Latin character forces UCS-2. Other channels carry their published caps — WhatsApp 1,024, Instagram 2,200, Google Business Profile 1,500, in-salon poster 220.",
  useCases: [
    "You are sending a Tuesday-and-Wednesday colour offer to your WhatsApp list and want a prompt that names the price and end date without inventing scarcity.",
    "Your no-show rate is climbing and you want a 24-hour reminder SMS that fits one segment so the send does not cost double per recipient.",
    "You are posting a balayage before-and-after and need a caption that describes the maintenance honestly, keeps the client unnamed, and lands its hook in the first 125 characters Instagram shows before 'more'.",
  ],
  benefits: [
    [
      "The character limit is computed, not guessed",
      "Segment counting follows GSM 03.38 — extension-table characters like {, }, [, ], ~, \\, ^ and € cost two septets each, and one non-GSM character drops the whole message to UCS-2 and 70 characters.",
    ],
    [
      "Compliance rules are written into the prompts",
      "The review-request prompt forbids offering a reward or asking only happy clients, the quiet-day SMS requires STOP opt-out wording, and the before-and-after prompt requires stated client consent and bans permanent-result claims.",
    ],
    [
      "Unfilled placeholders stay visible",
      "Any {{placeholder}} you leave blank is left in the text and listed as a warning, so a message with a missing price or booking line cannot be copied out and sent by accident.",
    ],
  ],
  faqs: [
    [
      "How many characters can one SMS hold?",
      "160 characters if every character is in the GSM 03.38 7-bit alphabet. Longer messages are split into concatenated segments of 153 characters each, because a 6-byte user data header eats into every part.",
    ],
    [
      "Why does adding one emoji shorten my SMS so much?",
      "An emoji is outside the GSM alphabet, so the whole message re-encodes as UCS-2, which fits only 70 characters in a single segment and 67 per segment when concatenated. That is why the reminder and review prompts explicitly instruct plain Latin characters and no emoji.",
    ],
    [
      "What are the character limits for the other channels?",
      "WhatsApp is treated as 1,024 (stay under about 1,000 to avoid the 'Read more' collapse), Instagram captions cap at 2,200 characters with 30 hashtags but only about the first 125 show before 'more', Google Business Profile posts cap at 1,500 with the first ~150 doing the work, and an in-salon poster is budgeted at 220 so it reads from two metres.",
    ],
    [
      "Does this tool write the messages for me?",
      "No — it produces the prompt, which you paste into the AI assistant of your choice. Everything is assembled in your browser with no AI call and no data sent anywhere, so you always see and can edit the instruction before any model reads it.",
    ],
  ],
};

export default seo;
