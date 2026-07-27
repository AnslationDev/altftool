const seo = {
  intro:
    "The Indian numbering system groups digits as 2-2-3 after the hundreds place, which is why 1,23,456 reads as one lakh twenty three thousand four hundred fifty six rather than one hundred twenty three thousand. This converter turns any rupee figure into the courtesy line a cheque needs — starting with 'Rupees', stating paise separately out of one hundred, and closing with 'Only' so no words can be appended after it. It also shows the same amount in international million and billion wording and in both digit-grouping styles.",
  useCases: [
    "Writing a cheque for 1,23,456.78 and needing the exact wording that a bank will accept.",
    "Preparing an invoice or a demand draft request where the amount must appear in words as well as figures.",
    "Filling a loan or property agreement that requires the consideration in Indian words with lakh and crore.",
  ],
  benefits: [
    ["Correct Indian place names", "Lakh and crore are used at the right positions, and counts above a crore are spelled as crores rather than invented names."],
    ["Paise handled exactly", "The amount is converted through paise as integers, so a decimal like 0.1 plus 0.2 can never round into the wrong word."],
    ["Cheque-safe formatting", "The 'Only' suffix and the separate paise clause follow what banks look for when they verify the courtesy line against the figures."],
  ],
  faqs: [
    [
      "How do you write 123456.78 in words on a cheque?",
      "Rupees One Lakh Twenty Three Thousand Four Hundred Fifty Six and Paise Seventy Eight Only. Write the figures as 1,23,456.78 in the amount box, keep the two lines consistent, and draw a line through any empty space after 'Only'.",
    ],
    [
      "Why is 'Only' written at the end of a cheque amount?",
      "It closes the line so nobody can append extra words and inflate the amount. It is a long-standing banking convention rather than a legal requirement under the Negotiable Instruments Act, 1881, but leaving it out invites a query and makes the cheque easier to alter.",
    ],
    [
      "What happens if the words and figures on a cheque do not match?",
      "Section 18 of the Negotiable Instruments Act, 1881 says the amount written in words is the amount payable. In practice most banks simply return the instrument with the reason 'amount in words and figures differ' rather than paying the lower sum, so correct the cheque and re-issue it instead of overwriting it.",
    ],
    [
      "How is a crore written in the international system?",
      "One crore is ten million, and one hundred crore is one billion. The Indian system inserts a name every two digits after the thousands place while the international system inserts one every three, which is why 1,23,45,67,890 in India is written 1,234,567,890 elsewhere.",
    ],
  ],
};

export default seo;
