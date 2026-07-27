const seo = {
  intro:
    "Meeting Notes Prompt Builder classifies every line of raw notes as a decision, a commitment, an open question or context, then checks whether each commitment names an owner and carries a due date. It reports the gaps as counts — how many commitments have nobody attached, how many have no date, how many questions were left open — and writes those exact figures into a prompt that instructs the assistant to mark them rather than fill them in. Analysis happens in the browser, so nothing is uploaded.",
  useCases: [
    "Turning a page of bullet scribbles into an actions table before the meeting is an hour old.",
    "Spotting that three commitments in the notes have no owner, before the summary quietly assigns one.",
    "Producing a client recap email that only contains what was actually agreed in the room.",
    "Keeping a decision log where each decision carries its rationale and the alternatives rejected.",
  ],
  benefits: [
    ["Counts the gaps", "Missing owners, missing dates and unresolved questions are reported as numbers."],
    ["Blocks invention", "The prompt explicitly forbids assigning an owner or a date that the notes do not contain."],
    ["Runs locally", "Classification is plain pattern matching in your browser — notes never leave the page."],
  ],
  faqs: [
    [
      "What should meeting notes always capture?",
      "Three things: decisions, commitments and open questions. A decision states what was settled, a commitment names one owner, one deliverable and one date, and an open question names who can close it. Discussion that produces none of the three is context and can usually be compressed to a line.",
    ],
    [
      "Why do AI meeting summaries invent action items?",
      "Because summarisation models fill structural gaps by default — asked for an actions table, they will produce one even when the notes contain no owner or date. The fix is to state the gaps explicitly in the prompt and require them to be marked as unknown, which is what this tool writes for you.",
    ],
    [
      "How long does it take to read a page of notes?",
      "About a minute per 238 words for adult non-fiction read silently, which is the mean from Brysbaert's 2019 meta-analysis of 190 reading studies. That makes a 500-word set of notes roughly two minutes, which is worth knowing before you paste them into a channel where nobody will read them.",
    ],
    [
      "Are my notes sent anywhere?",
      "No. The line classification, owner detection and date detection all run as pattern matching in your own browser, and the generated prompt is only copied to your clipboard when you press the button. What you subsequently paste into an AI assistant is governed by that assistant's own privacy terms.",
    ],
  ],
};

export default seo;
