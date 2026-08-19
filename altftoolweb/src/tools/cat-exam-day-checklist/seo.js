const seo = {
  title: "CAT Exam Day Checklist: Slot Clock, Section Locks",
  metaDescription:
    "Turn your CAT slot into a clock: reporting, gate close and the minute VARC, DILR and QA each lock, plus seconds per question and a net score at +3 / -1.",
  steps: [
    "Pick your Slot — or choose \"other\" and type the Test start time from your admit card — then set \"Reporting opens\" and \"Gate closes\" in minutes before start, plus \"Journey to the centre\" and \"Getting ready\".",
    "Set \"Questions per section\" for VARC, DILR and QA, and tick anything under \"Anything special?\" — Compensatory time has been granted, I am using an approved scribe, or The centre is in another city.",
    "Read the \"Leave home by\" time, the \"Sectional windows and pace\" table (Section, Window, Questions, Per question) and the \"Attempt strategy at +3 and −1\" score model; Copy plan copies the whole day and Reset restores the defaults.",
  ],
  intro:
    "This planner converts a CAT slot into a wall clock: reporting time, gate closing, and the exact minute each of the three sections locks. CAT runs 120 minutes with a hard 40-minute limit on VARC, DILR and QA in that fixed order — the screen moves on by itself and there is no going back, so knowing that DILR ends at 9:50 AM changes how you spend 9:45. Candidates granted compensatory time get 53 minutes 20 seconds a section, 160 minutes in all. It also works out seconds per question and projects a net score under the published +3 and -1 marking.",
  useCases: [
    "A Slot 1 candidate with a 45-minute commute seeing that a 8:30 AM start means leaving home by 6:30 to clear biometrics inside the reporting window.",
    "Deciding attempt strategy before the test: 22 DILR questions in 40 minutes is 1 minute 49 seconds each, which makes it obvious that three sets solved fully beat six started.",
    "Checking that a wristwatch, a personal pen and a calculator all have to stay outside, because the centre issues the scribble pad and puts a basic calculator on screen.",
  ],
  benefits: [
    ["Sectional lock made visible", "Each section's start and end printed as a clock time, not just a 40-minute figure."],
    ["Compensatory time built in", "Switch to 53 minutes 20 seconds a section and the whole day's clock recomputes."],
    ["Score model, not guesswork", "Net marks from correct, wrong-MCQ and wrong-TITA counts under the real +3 / -1 scheme."],
  ],
  faqs: [
    [
      "Can I go back to a previous section in CAT?",
      "No. Each of the three sections has a hard 40-minute limit and the screen advances automatically when the time is up. Once VARC closes you cannot return to it, which is why the order — VARC, then DILR, then QA — is worth planning around rather than discovering on the day.",
    ],
    [
      "What is the marking scheme in CAT?",
      "Three marks for a correct answer and minus one for an incorrect multiple-choice answer. Type-in-the-answer questions, where you key the response instead of choosing an option, carry no negative marking, so a considered guess there is free. Nothing is deducted for leaving a question unattempted.",
    ],
    [
      "Am I allowed a watch or a calculator in the CAT exam hall?",
      "Neither. Watches of every kind are barred, and the section countdown runs on the test screen instead. A basic on-screen calculator is provided inside the test window for arithmetic, square roots included, so practise with it in the official mock rather than meeting it for the first time on test day.",
    ],
    [
      "What documents do I need to carry to the CAT centre?",
      "The admit card printed on A4 paper and an original photo identity document — passport, PAN, voter ID, driving licence, Aadhaar or a college ID. Photocopies and phone images are refused. Candidates using compensatory time or a scribe also carry the disability certificate in the prescribed format and the scribe declaration, both of which must have been sanctioned during registration.",
    ],
  ],
};

export default seo;
