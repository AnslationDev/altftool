const seo = {
  intro:
    "This tool takes a chat log you exported from a messaging app, helpdesk or support platform and replaces the identifying parts with consistent pseudonyms — the first speaker becomes Person 1, the first email becomes [EMAIL_1], and so on — while leaving the actual conversation intact. It reads TXT transcripts, JSON message arrays and CSV exports (auto-detecting which), and can optionally strip leading timestamps from each line. The mapping is consistent within a single run, so the same person stays the same pseudonym throughout and the thread still reads as a conversation.",
  useCases: [
    "You want to paste a customer support thread into a bug report or an AI assistant without exposing the customer's name, email and order number",
    "You are attaching a WhatsApp or Slack export to a complaint, dispute or HR case and need the exchange on record without every phone number in it",
    "You are building a training or demo dataset from real conversations and need names, links and ticket IDs replaced consistently across thousands of lines",
  ],
  benefits: [
    ["Pseudonyms stay consistent", "Every occurrence of the same name, email or number maps to the same token, so you can still follow who said what."],
    ["Understands the file structure", "In JSON and CSV it targets known fields such as sender, author, email, phone and ticketId rather than blindly regex-scanning the whole file."],
    ["Produces a shareable privacy report", "A summary counts each category of detection and unique values found, and deliberately contains none of the original chat text."],
  ],
  faqs: [
    [
      "What exactly gets replaced in my chat export?",
      "Six categories: participant labels (to Person 1, Person 2...), email addresses, phone numbers, web links, labelled identifiers such as order ID or ticket number, and optionally timestamps. Message text itself is preserved word for word, so the conversation still makes sense.",
    ],
    [
      "Will it catch phone numbers written in different formats?",
      "It matches runs of 7 to 15 digits, allowing spaces, dots, dashes and parentheses. A bare number with no + prefix and no parentheses needs at least 10 digits to count, which keeps ordinary figures like prices, dates and quantities from being mistaken for a phone number.",
    ],
    [
      "Does the anonymised file get uploaded anywhere?",
      "No. Parsing, matching and replacement all run in your browser, so the original transcript never leaves the machine. That matters here more than for most tools, because the input is by definition the sensitive material.",
    ],
    [
      "Is an anonymised export safe to publish or hand over?",
      "Treat it as a strong first pass, not a guarantee. Pseudonymisation removes direct identifiers, but the message content can still identify someone through context — an address mentioned in passing, an unusual event, an internal project name — so always read the output before sharing it, and take advice if the material falls under GDPR, HIPAA or a legal hold.",
    ],
  ],
};

export default seo;
