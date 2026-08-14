const seo = {
  title: "Survey Builder: 5 Question Types, CSV Export",
  metaDescription:
    "Build a questionnaire from short text, paragraph, multiple choice, checkbox and 1-5 rating questions, fill it in, chart the answers and export a CSV.",
  steps: [
    "Press Create New Survey, give it a Survey Title and Description, then press Add Question and pick a type: Short Text, Paragraph, Multiple Choice, Checkboxes or Rating (1-5).",
    "Press Create Survey to store it in this browser's localStorage, then press Take on the survey card to fill the form in; questions marked required block submission until answered.",
    "Open Analytics for a bar chart of every choice question and a mean score out of 5 for ratings, then press Export CSV to download a file named after the survey plus _responses.csv.",
  ],
  intro:
    "This is a self-contained survey builder that lets you assemble a questionnaire from five question types — short text, paragraph, multiple choice, checkboxes and a 1–5 star rating — then fill it in, chart the answers and export them as CSV. Surveys and responses are kept in this browser's localStorage rather than on an account, so you can draft and test a form without signing up for a survey platform. The analytics view bar-charts every choice question, gives each rating question a mean score out of 5, and lists free-text answers in full.",
  useCases: [
    "You are drafting a customer satisfaction form before committing to a paid survey platform and want to see exactly how the question wording and the 1–5 rating scale feel when someone actually fills them in",
    "You need a short intake or feedback questionnaire for an event stall or a classroom, filled in on one shared laptop, and you want the answers out as a CSV at the end of the day",
    "A colleague sent you a list of survey questions and you want to prototype the structure — required fields, option lists, question order — to check it reads sensibly before rebuilding it in your company's tool",
  ],
  benefits: [
    ["Charted results, not just a response list", "Choice questions render as bar charts, rating questions as a pie breakdown with the mean score, and text answers stay readable in full."],
    ["Per-question required validation", "Any question can be marked required, and the form refuses to submit until every required question has an answer."],
    ["CSV export with real question labels", "The export uses your question text as column headers and joins multi-select answers with semicolons, so the file opens cleanly in a spreadsheet."],
  ],
  faqs: [
    [
      "Can I send this survey to other people with a link?",
      "No — there is no shareable link or hosted response collection. Surveys and their answers live in the localStorage of the browser you built them in, so responses have to be entered on that same device, and the tool is best used for drafting, testing and small in-person collection.",
    ],
    [
      "What question types can I add?",
      "Five: short text, paragraph, multiple choice (single answer), checkboxes (multiple answers) and a 1–5 star rating. Choice and checkbox questions start with two options and you can add as many more as you need, though the last two cannot be deleted.",
    ],
    [
      "What happens to my surveys if I clear my browser data?",
      "They are gone. Everything is stored under the localStorage keys for surveys and responses in one browser profile, with no server copy, so clearing site data, using private browsing or switching browsers loses the lot — export the CSV as soon as you have answers worth keeping.",
    ],
    [
      "I deleted a survey by mistake — can I get it back?",
      "Yes, if you act quickly. Deleting shows an Undo button for 3 seconds before the survey and its responses are actually removed; once that window closes the removal is permanent and there is no backup to restore from.",
    ],
  ],
};

export default seo;
