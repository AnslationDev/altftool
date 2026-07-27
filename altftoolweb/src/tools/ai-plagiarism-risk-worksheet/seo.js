const seo = {
  intro:
    "The AI Plagiarism Risk Worksheet computes a weighted 0-100 risk score for an AI-assisted draft from six factors integrity offices actually examine: verbatim retention of AI text, paraphrase depth, citation of borrowed facts, verification of references, disclosure, and original contribution. Verbatim unattributed text (30 points) and unverified references (20 points) carry the heaviest weights, matching how misconduct cases are assessed. It is built for students and writers who want to find and fix the derivative parts of a draft before anyone else does.",
  useCases: [
    "A student who drafted sections with ChatGPT checking what must be rewritten before submitting an essay",
    "A graduate writer auditing whether every AI-supplied claim in a literature review traces to a real, cited source",
    "A tutor walking a class through why word-swap paraphrase and unverified references still count against them",
  ],
  benefits: [
    ["Weighted like real cases", "Verbatim retention and fabricated references dominate the score, because they dominate misconduct findings."],
    ["Actionable output", "Every risky answer produces a specific fix — rewrite, re-source, verify or disclose — not just a number."],
    ["Three clear bands", "Scores 0-20 rate low risk, 21-50 moderate, 51-100 high, so the verdict is unambiguous."],
  ],
  faqs: [
    [
      "Is using AI to write an assignment plagiarism?",
      "It depends on the policy and on what you do with the output. Submitting AI-drafted text as your own where the unit prohibits or requires disclosure of AI use is treated as academic misconduct at most institutions; permitted, disclosed assistance with substantial rewriting in your own words generally is not. The decisive factors are verbatim retention, disclosure and whether the argument is genuinely yours — exactly what this worksheet scores.",
    ],
    [
      "Do AI tools really make up citations?",
      "Yes — language models regularly fabricate plausible-looking references, complete with real journal names and fake page numbers. Institutions treat submitted fabricated citations as fabrication, often a more serious offence than plagiarism, which is why reference verification carries 20 of the 100 points in this worksheet. Open and check every reference before submitting.",
    ],
    [
      "Is paraphrasing AI output enough to avoid plagiarism?",
      "Only if the paraphrase is deep: new structure, your own argument, your own examples. Swapping synonyms while keeping the AI's sentence order and organisation is still derivative, and both plagiarism detectors and human markers recognise it. The reliable method is to close the AI output and write the passage from your own understanding.",
    ],
    [
      "What score on this worksheet is safe?",
      "A score of 20 or below rates as low risk, meaning the draft looks substantially your own with at most minor fixes. Scores from 21 to 50 flag moderate risk with specific remediation steps, and above 50 the worksheet advises rewriting and re-sourcing before submission. The score is a self-assessment aid, not a guarantee — your institution's policy is what finally governs.",
    ],
  ],
};

export default seo;
