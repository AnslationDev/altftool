const seo = {
  title: "Amount in Words for Cheques: Indian or International",
  metaDescription:
    "Spells a money amount for a cheque, invoice or agreement in lakh-crore or million-billion, with paise or cents worded separately. Eight currencies.",
  steps: [
    "Type the figure into Amount, pick the Currency, and set the numbering system to \"Indian — lakh, crore\" or \"International — million, billion\".",
    "Switch on the house-style toggles you need: End with \"Only\", Minor units as 50/100, Hyphenate (Twenty-One) and British \"and\".",
    "Press Copy result for the Cheque courtesy line, or take the Invoice / receipt wording, Agreement style (figures + words) or Whole-number words only from the list below.",
  ],
  intro:
    "This converter turns a money figure into the exact wording used on cheques, invoices and agreements, in either the Indian numbering system (2-2-3 grouping with lakh at 10^5 and crore at 10^7) or the international short scale (3-digit grouping with million at 10^6 and billion at 10^9). It covers eight currencies and spells the minor unit — paise, cents, pence, fils — separately out of one hundred, matching the ISO 4217 minor-unit rule. Accountants, cashiers and contract drafters get four ready wordings at once: cheque line, invoice line, agreement style with figures alongside words, and plain number words.",
  useCases: [
    "Writing the courtesy line on a cheque for 1,25,000.50 so the words match the figures a bank will verify.",
    "Filling the 'amount in words' field on an export invoice priced in US dollars while the rest of the books are in rupees.",
    "Drafting a sale agreement where the consideration must appear as figures followed by the same amount in words in brackets.",
  ],
  benefits: [
    [
      "Both numbering systems",
      "The same digits render as 'Twelve Lakh Thirty Four Thousand' or 'One Million Two Hundred Thirty Four Thousand' depending on the audience.",
    ],
    [
      "Exact minor units",
      "The amount is converted through whole paise or cents, so a decimal such as 0.1 plus 0.2 can never round into the wrong word.",
    ],
    [
      "House-style switches",
      "Hyphenated tens, the British 'and', an 'Only' suffix and a 50/100 fraction can each be turned on to match your organisation's format.",
    ],
  ],
  faqs: [
    [
      "How do I write 125000.50 in words for a cheque?",
      "Rupees One Lakh Twenty Five Thousand and Paise Fifty Only. Put 1,25,000.50 in the figures box, keep the two consistent, and rule through the empty space after 'Only' so nothing can be appended.",
    ],
    [
      "What is the difference between the Indian and international numbering systems?",
      "The Indian system inserts a new place name every two digits after the thousands place — lakh at 100,000 and crore at 10,000,000 — while the international short scale inserts one every three digits, giving million at 1,000,000 and billion at 1,000,000,000. So one crore equals ten million, and one hundred crore equals one billion.",
    ],
    [
      "Do I have to write 'Only' at the end of an amount in words?",
      "No law requires it; it is a banking convention that closes the line so extra words cannot be added to inflate the amount. Most Indian banks expect it on the courtesy line, and leaving it off invites a query even though the cheque is not invalid without it.",
    ],
    [
      "What happens if the words and the figures on a cheque disagree?",
      "Section 18 of the Negotiable Instruments Act, 1881 states that where the amount is stated differently in figures and in words, the amount in words is the amount undertaken to be paid. In practice most banks return the instrument marked 'amount in words and figures differ' instead of paying either sum, so re-issue the cheque rather than overwriting it, and ask your banker if you are unsure.",
    ],
  ],
};

export default seo;
