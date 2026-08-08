const seo = {
  title: "Kirana Shop AI Prompt Pack: Offers & Udhaar Notes",
  metaDescription:
    "Builds a structured AI prompt for six kirana jobs — reorder notes, offer broadcasts, udhaar reminders — in nine languages including Hinglish.",
  steps: [
    "Pick one of the six jobs under \"What do you need written?\" — Reorder note for the distributor, Offer / discount broadcast or Udhaar (credit) payment reminder — then fill in its fields, such as Amount pending and Pending since.",
    "Choose a Language (Hinglish in Roman script, Hindi, Marathi, Tamil and five more), a Tone such as Friendly regular-customer, and set the Message length limit (characters).",
    "Check the \"Fits one WhatsApp message\" line and the SMS part count, then press Copy prompt — the prompt tells the assistant never to invent a price, date or quantity you did not supply.",
  ],
  intro:
    "Kirana Shop AI Prompt Pack builds a complete, structured AI prompt for the six messages a neighbourhood grocery shop writes most: a distributor reorder note, an offer broadcast, a customer reply, an udhaar payment reminder, a weekly rate list and a new-stock announcement. Each prompt is assembled in the standard role / task / constraints / output-format layout, with your language, tone and a character cap written in, so the assistant returns something you can send without editing. Built for shop owners and staff who already use WhatsApp for orders and want the wording done in seconds.",
  useCases: [
    "Turn a handwritten shelf count into a grouped reorder list for the distributor before the morning beat.",
    "Write a Saturday offer broadcast in Hinglish that keeps every price exactly as you typed it.",
    "Draft three escalating udhaar reminders for a regular customer without souring the relationship.",
    "Reply to a complaint about a bad packet with an apology and the exact replacement you can afford to give.",
  ],
  benefits: [
    ["Your numbers stay your numbers", "The prompt instructs the assistant to never invent a price, date or quantity and to leave a marked blank instead."],
    ["Nine Indian languages", "Hinglish in Roman script plus Hindi, Marathi, Tamil, Telugu, Bengali, Gujarati, Kannada and English."],
    ["Length you can actually send", "Set a character cap and see how many SMS parts it would take and whether it fits one WhatsApp message."],
  ],
  faqs: [
    [
      "How do I write a WhatsApp offer message for my kirana shop?",
      "State the single biggest saving in the first line, then list each item with its exact price, then say when the offer ends and how to order. Keep the whole message under about 400 characters so it reads without tapping 'read more', and repeat the prices exactly as they appear on your shelf label.",
    ],
    [
      "How long can a WhatsApp message be?",
      "A single text message sent through the WhatsApp Cloud API carries up to 4,096 characters in its body, so almost any shop message fits in one send. Readability is the real limit: WhatsApp collapses long messages behind a 'read more' link, so offers and reminders work best well under 500 characters.",
    ],
    [
      "What is the polite way to ask a customer for pending udhaar?",
      "Lead with the fact, not the feeling: name the amount and the period it has been outstanding, then offer a way to settle including a part payment. Avoid any threat or legal wording on a first reminder, and send it privately rather than in a group. This pack produces three versions of increasing firmness so you can escalate over weeks rather than in one message.",
    ],
    [
      "Will the AI make up prices or discounts?",
      "The generated prompt explicitly forbids it and asks the assistant to insert a visible blank such as [___] when a detail is missing. Models can still slip, so read every message before sending, particularly anything stating a rate, a discount or an amount owed. Treat the output as a draft, not a final commitment to a customer.",
    ],
  ],
};

export default seo;
