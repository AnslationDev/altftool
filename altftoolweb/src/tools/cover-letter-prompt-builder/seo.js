const seo = {
  title: "Cover Letter Prompt Builder: 4 Moves, Word Budget",
  metaDescription:
    "Splits a 250-400 word letter across opening hook, proof of fit, why this employer and close at 15/35/30/20%, and marks anything you did not supply.",
  steps: [
    "Pick a Letter type — applying to a posted job, referred by someone inside, cold / speculative outreach, career change or internal move — and set 'Letter length (words)', one page being about 250-400.",
    "Fill in 'Role you are applying for', Employer, Tone and Format, then 'Your achievements, with numbers' and 'Verified facts about this employer' — leave the hiring manager blank and the letter opens 'Dear Hiring Team'.",
    "Check the Paragraph budget table splitting the words across the opening hook, proof of fit, why this employer and close, then press 'Copy prompt' and work through 'Before you send it'.",
  ],
  intro:
    "The Cover Letter Prompt Builder writes the instruction you give ChatGPT, Claude or Gemini so the letter it returns has a real structure instead of generic praise. It uses the conventional four-move cover letter — opening hook, proof of fit, why this employer, close and call to action — and splits your total word budget across them at 15%, 35%, 30% and 20%, keeping the letter inside the one-page 250–400 word band recruiters expect. It is for job seekers who already have achievements and company research and want the model to use those facts rather than invent new ones.",
  useCases: [
    "Applying to a posted role and needing a 350-word letter whose second paragraph answers the two requirements in the job ad with numbers, not adjectives.",
    "Writing a referral letter where the referrer's name has to land in the first sentence instead of the last paragraph.",
    "Sending a cold, speculative letter to a company with no open role, leading with a problem you can solve rather than a request.",
  ],
  benefits: [
    [
      "A word budget per paragraph",
      "Each of the four moves gets an explicit word count, which is what stops AI letters drifting into padded, page-and-a-half praise.",
    ],
    [
      "No invented facts",
      "The prompt states that anything you did not supply must come back as a marked placeholder — no fabricated metrics, employers or product names.",
    ],
    [
      "Situation-aware framing",
      "Posted role, referral, cold outreach, career change and internal move each rewrite the opening and fit paragraphs, including skipping company praise for internal applications.",
    ],
  ],
  faqs: [
    [
      "How long should a cover letter be?",
      "About 250 to 400 words — three to four paragraphs on a single page. If you are pasting the letter into an email body rather than attaching it, cut to roughly 200 words, because it will be read on a phone. This tool flags a target outside those bands before you generate anything.",
    ],
    [
      "What should each paragraph of a cover letter say?",
      "Four moves: the opening names the exact role and where you saw it plus one specific hook; the second paragraph answers the posting's top two requirements with evidenced achievements; the third shows researched, specific knowledge of the employer; the close states what you would deliver early, your availability and a direct request for a conversation. The builder allocates roughly 15%, 35%, 30% and 20% of your word budget to those four.",
    ],
    [
      "Can employers tell if a cover letter was written by AI?",
      "They notice the symptoms rather than the tool: words like 'passionate', 'dynamic' and 'I believe I would be a great fit', praise that would fit any company, and a letter that restates the resume. The generated prompt bans those phrases, forces company-specific detail from your own notes, and forbids repeating your resume line by line.",
    ],
    [
      "Should I address a cover letter to a named person?",
      "Yes, whenever you can find one — a named hiring manager beats a generic greeting. If you cannot find a name after a genuine look, use 'Dear Hiring Team'. Never use 'To Whom It May Concern', which reads as unaddressed mail; the prompt applies exactly this rule.",
    ],
  ],
};

export default seo;
