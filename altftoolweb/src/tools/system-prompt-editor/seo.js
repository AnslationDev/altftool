const seo = {
  intro:
    "This builder produces a system prompt that turns an AI into a disciplined copy editor: a named style guide (AP, Chicago or APA), an explicit depth of edit on the proofread–copyedit–line-edit ladder, and change-tracking rules so every alteration is visible. The edit-depth definitions follow the ladder used by the Chicago Manual of Style and the Editorial Freelancers Association. It is for writers, content teams and editors who want AI editing help without silent rewrites.",
  useCases: [
    "A content team standardising AI-assisted editing so every draft is copyedited to Chicago style with a numbered change log",
    "A novelist who wants proofreading only — typos and punctuation fixed, voice and phrasing left completely alone",
    "A documentation lead enforcing product terminology (and US spelling) across articles written by many contributors",
  ],
  benefits: [
    ["Real style guides", "Encodes the distinguishing rules of AP, Chicago and APA — serial comma, number style, capitalisation — not just a guide's name."],
    ["Edit depth is explicit", "Proofread, copyedit or line edit is defined in the prompt, so the AI cannot escalate a typo pass into a rewrite."],
    ["Every change visible", "Inline markup and change-log modes make the AI show its deletions, insertions and reasons."],
  ],
  faqs: [
    [
      "What is the difference between proofreading, copyediting and line editing?",
      "Proofreading fixes surface errors only — typos, spelling and punctuation. Copyediting adds grammar, usage and consistency (hyphenation, capitalisation, number style) without touching structure. Line editing goes deeper, reworking sentences for clarity, rhythm and concision while keeping the author's meaning and voice. Each level includes everything below it, which is why this builder writes the chosen level into the prompt explicitly.",
    ],
    [
      "What is the difference between AP style and Chicago style?",
      "The most-cited difference is the serial (Oxford) comma: AP omits it unless needed for clarity, Chicago requires it. They also diverge on numbers — AP spells out one through nine and uses numerals from 10, while Chicago spells out numbers up to one hundred in running text — and on capitalisation of titles. AP dominates journalism; Chicago dominates book and long-form publishing.",
    ],
    [
      "How do I stop AI from rewriting my text when I only want it edited?",
      "Constrain three things in the system prompt: the depth of edit (proofread or copyedit, defined concretely), a preserve-voice rule banning synonym swaps of equal merit, and a change-tracking format so every alteration is listed with a reason. This builder also offers a rule keeping the piece within about 5% of its original word count, which blocks stealth rewrites.",
    ],
    [
      "Should an AI editor be allowed to change quotes and facts?",
      "No. Professional practice is that quoted material is never silently altered — an apparent error in a quote is flagged, sometimes with '[sic]' — and facts, figures and names are queried rather than 'corrected', because the editor cannot know which version is true. This builder ships both protections as one-click hard rules and warns if you leave them off.",
    ],
  ],
};

export default seo;
