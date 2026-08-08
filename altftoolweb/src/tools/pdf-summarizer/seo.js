const seo = {
  title: "PDF Summarizer: Extractive Summaries, Up to 80 MB",
  intro:
    "PDF Summarizer extracts a PDF's text layer in the browser and condenses it by extractive scoring: it ranks each sentence on word frequency, then weights opening and closing sentences, sentences containing numbers or named entities, and sentences carrying cue phrases like \"in conclusion\" or \"key finding\". You choose the length — short, medium, detailed, bullet points or an executive brief — and get the top-ranked sentences back, alongside the top 12 keywords, a word count and a reading-time estimate at 200 words per minute. Every sentence in the output comes verbatim from your document; nothing is generated or paraphrased.",
  useCases: [
    "A 40-page vendor report landed an hour before the meeting and you need the argument and the numbers, not the preamble.",
    "You are triaging a folder of research PDFs and need a bullet list per paper to decide which three are worth reading properly.",
    "A committee pack has to be summarised for people who will not open the attachment, and quotes must be the author's exact words.",
  ],
  benefits: [
    ["Sentences are quoted, not invented", "Extractive scoring selects real sentences from your file, so the summary cannot hallucinate a claim the document never made."],
    ["Five lengths from the same ranking", "Short returns the 2 highest-scoring sentences; bullets returns about a quarter of them (minimum 5) and detailed about a third (minimum 6), so short documents still get a substantive summary and you can trade depth for brevity without re-running the analysis."],
    ["Context beyond the summary", "Keywords, word count and a reading-time estimate come with every run, so you can judge document size and subject at a glance."],
  ],
  faqs: [
    [
      "How does it decide which sentences matter?",
      "It scores each sentence by the frequency of its non-stopword terms, then applies multipliers: 1.4x for the first sentence, 1.3x for the last, 1.25x for cue phrases such as \"conclusion\" or \"key finding\", and smaller boosts for sentences containing digits or proper-noun pairs. The highest scorers become the summary.",
    ],
    [
      "How is the reading time calculated?",
      "Word count divided by 200 words per minute, rounded, with a one-minute floor. That is a common average adult silent-reading rate for general prose; dense technical text will take longer.",
    ],
    [
      "Why did it find no text in my PDF?",
      "The document is almost certainly a scan — an image with no text layer — and there is nothing to extract or score. Run OCR on it first, then summarise the OCR'd file.",
    ],
    [
      "How big a PDF can I summarise, and is it uploaded?",
      "Up to 80 MB, and nothing is uploaded: text extraction, scoring and keyword ranking all run in the browser tab, so confidential documents stay on your device.",
    ],
  ],
};

export default seo;
