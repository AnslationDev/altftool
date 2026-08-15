const seo = {
  title: "Meeting Invite Generator with Time-Boxed Agenda",
  metaDescription:
    "Turn a topic, slot and timed agenda into invite text with a run sheet — and check the agenda fits once ~10% is reserved for wrap-up.",
  steps: [
    "Fill in \"Topic\" and the \"Objective — what must be true when it ends\", pick a \"Meeting type\" and a length from 15 to 90 minutes, and write agenda lines as \"Item — minutes\".",
    "List \"Required attendees\", \"Optional attendees\", the \"Pre-read / preparation ask\" and a \"Decision owner\" — or use the \"Load the … agenda template\" link to pre-fill timings.",
    "Check \"Agenda fit\" against the slot (over-booking shows minutes to trim), review the timed \"Run sheet\", then \"Copy result\" for subject plus body or \"Copy body\" alone.",
  ],
  intro:
    "The Meeting Invite Wording Builder turns a topic, a slot and a list of agenda items into invite text that says what the meeting is for, who must be there and what to do before it. It also checks the two things most invites get wrong: whether the time-boxed agenda actually fits the slot once you reserve about 10% for wrap-up, and how much paid attendee time the slot consumes. Useful for managers, project leads and anyone whose invites get declined or drift over time.",
  useCases: [
    "Write a decision meeting invite that names the decision owner so the group does not leave without an answer.",
    "Check whether four 15-minute agenda items really fit a 50-minute slot before you send the invite.",
    "Show a sponsor the person-hour cost of a weekly status call to justify cutting it to fortnightly.",
    "Convert a vague 'catch-up' into a kickoff invite with scope, non-goals, owners and a first checkpoint.",
  ],
  benefits: [
    [
      "Agenda that fits the clock",
      "Each item gets a real start and end time, and the total is compared against the slot minus wrap-up time.",
    ],
    [
      "Required versus optional",
      "Separating the two lists shrinks the room and tells optional invitees they can read the notes instead.",
    ],
    [
      "Visible cost of the slot",
      "Headcount times slot length times an hourly rate gives a number that makes long recurring meetings hard to ignore.",
    ],
  ],
  faqs: [
    [
      "What should a meeting invite include?",
      "Six things: the objective in one sentence, the date and time range, the location or call link, a time-boxed agenda, the required versus optional attendee split, and any pre-read. Invites missing the objective and the agenda are the ones people decline or attend unprepared.",
    ],
    [
      "How do I write the purpose of a meeting?",
      "Write it as the state of the world when the meeting ends, not as a topic. 'Agree the new Pro price and the announcement date' is an objective; 'Pricing discussion' is a label. If you cannot phrase an end state, the work probably belongs in a document rather than a meeting.",
    ],
    [
      "How long should a meeting be?",
      "Book the shortest slot the agenda fits, and prefer 25 or 50 minutes over 30 or 60 so back-to-back attendees get a break — Google Calendar and Outlook both offer this as a 'speedy meeting' setting. Leave roughly the last 10% for decisions and action capture.",
    ],
    [
      "How many people should be in a working meeting?",
      "Keep decision and working sessions to about eight people; beyond that discussion turns into a broadcast and most attendees stop contributing. Anyone who only needs to know the outcome should get the notes rather than an invite.",
    ],
  ],
};

export default seo;
