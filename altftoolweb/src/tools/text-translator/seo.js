const seo = {
  title: "Text Translator: 11 Languages, Copy and Speak",
  metaDescription:
    "Translate between any two of 11 languages, then copy, share or hear it. Text goes to Google’s translate endpoint, so keep confidential material out.",
  steps: [
    "Choose Source and Target from the two 11-language dropdowns, then type or paste into the \"Your Text\" panel.",
    "Press Translate; the swap button between the selects exchanges both languages and the panel contents for a back-translation check.",
    "Read the \"Translation\" panel and use its Copy, Speak or Share buttons — Speak reads it in a voice matched to the target language.",
  ],
  intro:
    "Text Translator converts a passage between any two of 11 languages — English, Spanish, French, German, Simplified Chinese, Japanese, Korean, Russian, Portuguese, Arabic and Hindi — by sending it to Google's translate endpoint and returning the joined result. It is for anyone who needs a quick, readable rendering of a message, a review or a paragraph of documentation rather than a certified translation. The output panel can be copied, shared, or spoken aloud with a voice matched to the target language's BCP 47 tag.",
  useCases: [
    "Reading a supplier email or product review that arrived in a language you do not speak, and needing the gist before you decide whether it is worth a proper reply.",
    "Drafting a short message to a customer in Spanish or Portuguese, then hitting the swap button to translate it back to English and sanity-check that the meaning survived the round trip.",
    "Checking how a Japanese or Arabic phrase is pronounced by pressing the speak button on the output, which picks a system voice whose language tag matches the target language.",
  ],
  benefits: [
    [
      "One-click swap that carries the text with it",
      "Swapping source and target also swaps the two panels' contents, so a back-translation check takes one click instead of copy-paste.",
    ],
    [
      "Output you can hear, not just read",
      "The translation panel speaks through the browser's speech synthesiser using a mapped locale — es-ES, ja-JP, hi-IN and so on — so pronunciation follows the target language's rules.",
    ],
    [
      "Copy and share built into the result",
      "The translated text has copy-to-clipboard and native share buttons on the panel itself, so it goes straight into your reply without re-selecting the text.",
    ],
  ],
  faqs: [
    [
      "Which languages does it support?",
      "Eleven: English, Spanish, French, German, Chinese (Simplified), Japanese, Korean, Russian, Portuguese, Arabic and Hindi. Any of the eleven can be the source or the target, giving 110 directional pairs.",
    ],
    [
      "Is my text private — does it stay in the browser?",
      "No. Unlike most tools here, translation requires a network call: your text is sent to Google's public translate endpoint to be processed. Do not paste confidential contracts, medical records, credentials or personal data you are not willing to send to a third-party service.",
    ],
    [
      "Is machine translation accurate enough to publish?",
      "It is reliable for gist and everyday correspondence, but not for anything binding. Idioms, legal terms, dosage instructions and marketing tone are where machine output most often goes wrong — have a fluent human review anything contractual, medical or public-facing before it ships.",
    ],
    [
      "Why did the translation fail or come back empty?",
      "The most common causes are a dropped network connection, a blocked request from an extension or corporate proxy, or an unusually long passage. Try again with a shorter chunk — a few paragraphs at a time is more reliable than pasting a whole document into one request.",
    ],
  ],
};

export default seo;
