const seo = {
  title: "Scam Message Checker: Score SMS, WhatsApp & Email",
  metaDescription:
    "Paste an SMS, WhatsApp or email and get a 0-100 signal score, the exact phrases that matched ten scam patterns, and safer next steps. Runs in-browser.",
  steps: [
    "Under \"Paste the message\", choose the Message source — SMS, WhatsApp or Email — and paste the text into the \"Message text\" box, which accepts up to 20,000 characters.",
    "Press \"Review message\" (or \"Load example\" first); the pattern rules, link inspection and Unicode checks all run in the page, and \"Clear\" empties the box.",
    "Read the \"Signal score\" out of 100 next to the \"Evidence groups\" and \"Links found\" counts, check the \"Observed evidence\" cards quoting each matched phrase, then take the \"Safer next steps\" list with \"Copy checklist\".",
  ],
  intro:
    "This is a local checklist that scans the text of an SMS, WhatsApp message or email against ten deterministic scam-pattern rules — urgency, hard-to-reverse payment, OTP and PIN requests, remote-access instructions, authority and relationship claims — plus structural checks on any links and hidden Unicode characters. It returns a 0-100 signal score, the exact phrases that matched, and a list of safer next steps tailored to what it found. The message never leaves the page, which matters because the thing you want checked usually contains your own name, account details or a link you were told to open.",
  useCases: [
    "A text says your bank account will be blocked today unless you verify at a link, and you want to see which specific phrases and which part of that URL are the problem before you decide",
    "An elderly relative forwards you a WhatsApp message from someone claiming to be a grandchild on a new number, and you want a written explanation you can send back rather than just saying 'ignore it'",
    "You received an unexpected refund message asking you to approve a collect request or enter your UPI PIN, and want confirmation that receiving money never requires a PIN",
  ],
  benefits: [
    ["Shows the evidence, not just a verdict", "Each finding quotes the matched phrase with surrounding context, so you can see why it fired and judge it yourself."],
    ["Catches look-alike domains and invisible characters", "It flags punycode labels, numeric-IP hosts, userinfo before the host, and words mixing Latin with Cyrillic or Greek that render identically on screen."],
    ["Understands warnings about scams are not scams", "Credential and personal-data rules check the preceding 16 characters for negation, so a genuine bank notice saying 'never share your OTP' is not scored against you."],
  ],
  faqs: [
    [
      "What does the score out of 100 actually mean?",
      "It is the summed weight of the patterns that matched, capped at 100 — not a probability that the message is a scam. Below 25 is flagged as a few caution signals, 25 to 54 as several, and 55 or above as multiple strong signals; combinations add extra weight, such as +10 when a credential request appears alongside a link.",
    ],
    [
      "Does my message get uploaded anywhere?",
      "No. The rules, URL inspection and Unicode checks all run in the page on your device, and nothing is transmitted or stored on a server. That is deliberate, since the messages people most want checked are the ones containing their own account numbers and personal details.",
    ],
    [
      "Does a clean result mean the message is safe?",
      "No, and the tool says so explicitly. It matches a fixed list of known warning patterns, so a well-written scam using none of those phrases will score zero. Treat a clean result as 'nothing obvious found', and still verify any request for money or credentials through a number or app you sourced yourself.",
    ],
    [
      "What should I do if I already replied or paid?",
      "Contact your bank or the relevant provider immediately through their official app or a number you already had, not one from the message, and change any password or PIN you disclosed. Speed matters most with hard-to-reverse methods such as gift cards, crypto and wire transfers, and reporting to your national cybercrime or fraud line is the next step.",
    ],
  ],
};

export default seo;
