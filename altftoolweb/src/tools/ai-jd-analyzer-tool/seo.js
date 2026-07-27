const seo = {
  intro:
    "The AI JD Analyzer scores a pasted job description out of 100 and tells you what is missing from it — the named skills, the seniority band, how hard it is to read, and any gendered wording. Readability uses the Flesch Reading Ease and Flesch–Kincaid Grade Level formulas; the wording check uses the masculine- and feminine-coded word stems published by Gaucher, Friesen and Kay (2011). It is built for recruiters tightening a post before it goes live and for candidates deciding whether a role is worth applying to.",
  useCases: [
    "A recruiter checks a draft posting before publishing and finds it is missing a compensation range and an equal-opportunity line.",
    "A candidate pastes a job ad and their own skill list to see that they match 6 of 11 named technologies before spending an hour on the application.",
    "A hiring manager rewrites 'competitive rockstar who works independently' after the tool flags three masculine-coded words in one sentence.",
  ],
  benefits: [
    ["Nothing leaves the browser", "The whole analysis runs client-side, so a confidential requisition is never uploaded."],
    ["Published formulas, not guesses", "Reading scores come from the Flesch formulas and the bias list from a peer-reviewed 2011 study."],
    ["Actionable rewrites", "Every flag comes with the specific fix — the missing section, the neutral word to swap in, the sentence length to cut."],
  ],
  faqs: [
    [
      "How long should a job description be?",
      "Aim for 300 to 800 words. Posts under 300 words read as thin and leave candidates guessing about the day-to-day work; past 800 words the responsibilities get buried in company boilerplate. This tool gives full length credit inside that band and tapers the score outside it.",
    ],
    [
      "What Flesch reading ease score should a job description have?",
      "Between 50 and 70. Below 50 the writing is 'fairly difficult' and needs a college reading level; above 70 it usually means the post has stopped saying anything concrete. The formula is 206.835 − 1.015 × (words per sentence) − 84.6 × (syllables per word).",
    ],
    [
      "Does gendered wording in job ads really change who applies?",
      "Yes. Gaucher, Friesen and Kay found in the Journal of Personality and Social Psychology (2011, vol. 101) that masculine-coded wording such as 'competitive', 'dominant' and 'self-reliant' made job ads less appealing to women and lowered their sense of belonging in the role. The tool flags each stem from that published list and suggests a neutral swap.",
    ],
    [
      "How is the match percentage calculated?",
      "Each skill named in the job description gets a weight of 1, rising by 0.5 for every extra mention up to a cap of 2, so a skill the post repeats counts for more than a passing mention. The match score is your matched weight divided by the total weight. Skills outside the built-in library are not counted in either direction.",
    ],
  ],
};

export default seo;
