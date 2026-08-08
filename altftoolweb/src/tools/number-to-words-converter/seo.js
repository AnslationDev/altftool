const seo = {
  title: "Number to Words Converter: Indian Lakh or Million",
  metaDescription:
    "Spells a figure in English and in the \"Rupees ... only\" cheque line, switching between Indian lakh-crore grouping and international thousand-million.",
  steps: [
    "Type the amount into the Number box, which opens on 1234567.",
    "Choose Indian for lakh and crore grouping, or International for thousand, million and billion.",
    "Read the Words panel and the Cheque format line reading Rupees ... only, then press Copy words.",
  ],
  intro:
    "The Number to Words Converter spells a figure out in English using either the Indian numbering system — thousand, lakh, crore — or the international one of thousand, million, billion, and returns it in the ready-to-write cheque form \"Rupees … only\". Switching systems changes the grouping, so 1,234,567 reads as twelve lakh thirty four thousand five hundred sixty seven in Indian and one million two hundred thirty four thousand five hundred sixty seven internationally. It is aimed at anyone filling in the amount-in-words line on a cheque, invoice, receipt or affidavit, where the written figure is what governs if it disagrees with the digits.",
  useCases: [
    "You are writing a cheque for ₹4,50,000 and need the words line filled in exactly, in the lakh-based grouping an Indian bank expects.",
    "You are drafting an invoice for an overseas client and want the amount in international words with million rather than lakh, so the wording matches their accounting system.",
    "You are preparing a rent agreement or affidavit where the deposit has to appear both in digits and in words, and a mismatch would send the document back.",
  ],
  benefits: [
    [
      "Both numbering systems, one switch",
      "Regroups the same figure between the Indian 2-2-3 digit pattern and the international 3-3-3 pattern instead of forcing one convention.",
    ],
    [
      "Cheque line, not just words",
      "Outputs the full \"Rupees … only\" phrasing that the amount-in-words field actually requires, ready to copy.",
    ],
    [
      "Correct teen and tens handling",
      "Spells 11 to 19 as single words and hyphen-free tens, so you never get the malformed \"ten three\" that naive converters produce.",
    ],
  ],
  faqs: [
    [
      "How do you write an amount in words on a cheque?",
      "Write it as \"Rupees\" followed by the amount in words and then \"only\" — for example, Rupees four lakh fifty thousand only. The word \"only\" closes the line so no one can add to it, and if the words and the digits disagree, the amount in words is what banks treat as governing.",
    ],
    [
      "What is the difference between the Indian and international numbering systems?",
      "The Indian system groups digits as 2-2-3 and uses lakh (100,000) and crore (10,000,000); the international system groups them as 3-3-3 and uses million (1,000,000) and billion (1,000,000,000). One crore equals 100 lakh, which is 10 million.",
    ],
    [
      "Does this convert paise or decimals?",
      "No. The converter takes the whole-number part only and drops anything after the decimal point, so 4500.75 spells out as four thousand five hundred. Add the fractional part yourself in the usual form — \"and seventy five paise\" before the word \"only\".",
    ],
    [
      "How is 1 crore written in words?",
      "One crore is 10,000,000 — written 1,00,00,000 in the Indian grouping and read as \"one crore\". In the international system the same figure is ten million, which is why the tool shows different wording for the same number depending on which mode you pick.",
    ],
  ],
};

export default seo;
