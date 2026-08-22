const seo = {
  title: "Clinic Front Desk Prompts + SMS Segment Counter",
  metaDescription:
    "Administrative prompts for reminders, waitlists, recalls and complaints, screened for clinical advice, with GSM 03.38 segment counting (160 or 70).",
  steps: [
    "Use 'Search prompts' or the Category list, then click a prompt card — appointment reminders, cancellation waitlists, no-show follow-ups, insurance, recalls.",
    "Complete the 'Fill in the blanks' fields with placeholder names, or press 'Use example values'; 'Clear fields' empties them again.",
    "'Copy prompt' takes the finished text, and pasting a script into 'Paste the reminder, recall or voicemail script' returns Encoding, Segments and flagged phrases.",
  ],
  intro:
    "Clinic Front Desk Prompt Pack is a library of administrative AI prompts for the non-clinical work of a practice — appointment reminders, cancellation waitlists, missed-appointment follow-ups, insurance explanations, recalls and complaint acknowledgements. Every message you draft is screened for two things a front desk must avoid: clinical advice that only a clinician may give, and identifiable clinical detail that does not belong in an unsecured SMS or a voicemail. It also counts the message into real SMS segments using the GSM 03.38 rules, so a reminder that must fit 160 characters actually does.",
  useCases: [
    "Write a 24-hour appointment reminder that fits one 160-character segment and names no department, condition or test.",
    "Fill a slot that opened this morning by messaging a cancellation waitlist with a clear first-reply-wins rule and a deadline.",
    "Build a front-desk script that escalates a medication question to the duty nurse without answering any part of it.",
    "Check a recall broadcast for wording that would tell a stranger reading the lock screen something about the patient's health.",
  ],
  benefits: [
    ["Administrative by design", "Every prompt forbids diagnosis, dose changes and reassurance about symptoms, and routes clinical questions to a clinician."],
    ["Real SMS segment maths", "GSM-7 counts 160 characters in one part and 153 per part when concatenated; one emoji switches the whole message to 70."],
    ["Nothing is uploaded", "Prompts, the screen and the segment counter all run in the browser, so patient details never leave the device."],
  ],
  faqs: [
    [
      "Can a clinic send appointment reminders without patient authorisation?",
      "Appointment reminders are treated as part of treatment, so a separate authorisation is not normally required, but the minimum necessary standard still applies to what the message says. Keep the reason for the visit, the department and any result out of an SMS or voicemail — date, time, place and a call-back number are enough.",
    ],
    [
      "How many characters fit in one SMS?",
      "160 characters when the message uses only GSM 03.38 characters, dropping to 153 per part once it splits across segments because seven characters go to the header. A single emoji, curly quote or en dash forces UCS-2 encoding, which allows only 70 characters in one part and 67 per part after that.",
    ],
    [
      "How often can a clinic text appointment reminders to a mobile number?",
      "Where healthcare reminders are sent without separate consent, the recognised limits are one message per day and no more than three per week per patient, each free to the recipient and each offering an easy opt-out. Marketing and billing or collection messages get no such allowance and need consent.",
    ],
    [
      "Can front desk staff answer a patient's medical question?",
      "No — deciding a dose, naming a medicine, interpreting symptoms or telling a patient they do not need to be seen are all clinical decisions. The escalation prompt here records the patient's own words, asks a red-flag question rather than giving advice, and sets a call-back time. This tool is administrative and is not medical advice.",
    ],
  ],
};

export default seo;
