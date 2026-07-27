const seo = {
  intro:
    "The Podcast Outline Prompt Builder splits an episode runtime into timed blocks — an optional 45-second cold open, a 60-second intro, evenly-timed segments and a 90-second outro — and writes an AI outline prompt with those timestamps embedded. For interview formats it also divides each segment's time across your planned questions and warns when a question gets less than the realistic 2-3 minutes an answer plus follow-up takes.",
  useCases: [
    "A host planning a 60-minute interview with four segments and three questions each sees every question gets about 4.7 minutes before sending the outline prompt to a model.",
    "A solo educator turns a 20-minute teaching episode into timed segments, each with a verbatim transition line and one point the listener should retain.",
    "A producer standardises episode prep so every outline arrives with a cold-open clip suggestion, derailment recovery lines and one clip-worthy moment flagged for social.",
  ],
  benefits: [
    [
      "Timestamps, not vibes",
      "Every block carries a start time and duration computed from your runtime, so the recording session has a real clock to run against.",
    ],
    [
      "Question-load reality check",
      "The tool warns when segment maths gives each interview question under 2 minutes — the point where episodes turn into speed rounds.",
    ],
    [
      "Format-specific structure",
      "Interview, solo, co-hosted and narrative formats each swap in different outline instructions, from planned follow-ups to [CLIP] markers.",
    ],
  ],
  faqs: [
    [
      "How many questions should I prepare for a one-hour podcast interview?",
      "Around 10 to 15. A substantive answer plus a follow-up runs 2-3 minutes, and a 60-minute episode has roughly 55 minutes of segment time after the open, intro and outro. This tool does that arithmetic for your exact runtime and warns when the plan gives each question less than 2 minutes.",
    ],
    [
      "What is a cold open in a podcast?",
      "A short teaser — usually a 30-60 second clip of the episode's most arresting moment — played before any intro music or welcome. It converts browsers into listeners because the first thing they hear is the best thing. This tool budgets 45 seconds for it and asks the model to nominate which moment to pull.",
    ],
    [
      "How long should a podcast intro be?",
      "About 60 seconds or less: one line on why the topic matters and one establishing the guest's or host's credibility. Listener drop-off is heaviest in the first minutes, so long welcomes and housekeeping are the most expensive airtime in the episode.",
    ],
    [
      "How many words is a 60-minute podcast episode?",
      "Roughly 9,000 words at a conversational 150 words per minute, which is why this tool generates an outline prompt rather than a transcript prompt — an outline keeps the episode natural while still controlling structure and timing.",
    ],
  ],
};

export default seo;
