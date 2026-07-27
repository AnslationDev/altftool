const seo = {
  intro:
    "This log tracks every study doubt from the day it is raised to the day it is resolved — and, crucially, whether you retested yourself on it afterwards. It applies the testing effect from cognitive psychology (Roediger & Karpicke, 2006): a doubt is only truly closed when you can re-solve a similar problem without help, so the log reports a retest rate alongside resolution time. Built for coaching students and self-study aspirants who want to stop the same doubts resurfacing in mock tests.",
  useCases: [
    "A JEE aspirant logs doubts from daily problem sets and checks weekly which ones were resolved but never retested",
    "A coaching student compares how many doubts the doubt desk versus peers actually resolved before choosing where to queue",
    "A UPSC candidate flags doubts open for more than a week so they get raised in the next mentor session instead of being forgotten",
  ],
  benefits: [
    ["Retest rate, not just resolution", "Separates 'someone explained it' from 'I can now do it myself'."],
    ["Stale-doubt alerts", "Doubts open longer than 7 days — one coaching cycle — are flagged before they pile up."],
    ["Source breakdown", "See whether faculty, peers or online videos are actually clearing your doubts."],
  ],
  faqs: [
    [
      "Why should I retest myself after a doubt is resolved?",
      "Because retrieval, not re-reading, is what makes material stick — the testing effect shown by Roediger and Karpicke's 2006 experiments found actively recalling material beats restudying it for long-term retention. Watching someone solve your doubt feels like understanding, but only re-solving a similar problem yourself confirms it.",
    ],
    [
      "How long should a doubt stay open before I escalate it?",
      "This log flags any doubt open for more than 7 days, on the logic that most coaching schedules run weekly cycles of tests and doubt sessions. A doubt that misses one full cycle usually gets forgotten rather than resolved, so escalate it to a teacher or mentor at that point.",
    ],
    [
      "Is my doubt log uploaded anywhere?",
      "No. Entries are stored only in your own browser's local storage and never sent to a server. Clearing site data or switching browsers erases the log, so copy the summary out first if you need it elsewhere.",
    ],
    [
      "What counts as a resolved doubt versus a closed doubt?",
      "Resolved means someone or something gave you a satisfactory explanation; closed means you then re-solved a similar problem on your own and marked it retested. The gap between the two — shown here as the retest rate — is where most exam-day errors hide.",
    ],
  ],
};

export default seo;
