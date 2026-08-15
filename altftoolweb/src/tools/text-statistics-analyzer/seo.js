const seo = {
  title: "Text Statistics: Word Count and Readability Scores",
  metaDescription:
    "Paste text for words, sentences, paragraphs and syllables plus Flesch Reading Ease, Flesch-Kincaid, Gunning Fog, SMOG, Coleman-Liau and ARI, in-browser.",
  steps: [
    "Paste or type into Your text, or press Load sample text to see it working on a ready-made passage.",
    "Counts and scores recalculate on every keystroke as you edit; press Clear to empty the box and start over.",
    "Read Flesch Reading Ease out of 100 with its band, the Words, Sentences, Syllables and Complex words tiles, and the five Grade level formulas, then press Copy report.",
  ],
  "intro": "Text Statistics Analyzer breaks any passage down into words, unique words, characters, sentences, paragraphs and syllables, then runs six standard readability formulas over it — Flesch Reading Ease, Flesch-Kincaid Grade, Gunning Fog, SMOG, Coleman-Liau and the Automated Readability Index. It is built for writers, editors, teachers and content marketers who need to know not just how long a piece is, but how hard it is to read. Everything runs in your browser, so drafts and student work never leave your device.",
  "useCases": [
    "Check that a landing page or help article lands near Flesch 60-70 before publishing.",
    "Grade a school reading passage so it matches the age group you are teaching.",
    "Spot the sentences bloating your draft by watching words-per-sentence climb as you edit."
  ],
  "benefits": [
    [
      "Six formulas at once",
      "Compare Flesch-Kincaid, Gunning Fog, SMOG, Coleman-Liau and ARI side by side instead of trusting a single score."
    ],
    [
      "Live as you type",
      "Counts and scores recalculate on every keystroke, so you can see an edit improve readability instantly."
    ],
    [
      "Nothing is uploaded",
      "The whole analysis happens in your browser — unpublished copy and confidential documents stay local."
    ]
  ],
  "faqs": [
    [
      "What is a good Flesch Reading Ease score?",
      "Most general web and business writing aims for 60-70, which reads at roughly an 8th-9th grade level. Scores above 80 feel very easy and conversational, while anything under 30 usually needs a university-level reader."
    ],
    [
      "How are syllables counted without a dictionary?",
      "The tool uses the standard vowel-group heuristic with silent-e and silent -ed corrections. It matches dictionary counts for the large majority of English words, which is exactly the basis the classic readability formulas were calibrated on."
    ],
    [
      "Why do the grade level scores differ from each other?",
      "Each formula weighs different signals: Gunning Fog and SMOG count words of three or more syllables, Coleman-Liau and ARI use character length instead, and Flesch-Kincaid blends sentence length with syllables. Reading them together gives a more reliable picture than any single number."
    ],
    [
      "How does it decide where a sentence ends?",
      "A sentence ends at a full stop, question mark or exclamation mark, or at a line break so that headings and bullet points each count once. Abbreviations such as 'Dr.' can occasionally split a sentence early, which is normal for automated readability scoring."
    ]
  ]
};

export default seo;
