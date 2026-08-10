const seo = {
  title: "Sobriety Recovery Journal: Day Count and Urge Log",
  steps: [
    "Type one line per day into \"Private journal entries\" as Date | urge 0-10 | trigger | coping response | win / note, or press the \"Three private entries\" example to load the layout.",
    "Set \"Recovery start date\"; the day count, entry count, average urge, highest urge and distinct-trigger count recalculate as you type, with urge values clamped to 0-10.",
    "Read the ranked \"Trigger / Times noted\" table of your five most-recorded triggers plus your last five entries, then press Download to save sobriety-recovery-journal.txt.",
  ],
  intro:
    "The Sobriety Recovery Journal turns a plain list of daily entries — date, urge intensity from 0 to 10, trigger, coping response and a win or note — into a day count since the start date you set, an average and highest urge, and a ranked table of your five most frequently recorded triggers. It is a private reflection aid for someone keeping their own record between check-ins, not a treatment programme or a safety monitor. Everything is computed from the lines you type, in your browser, and nothing is stored or sent anywhere.",
  useCases: [
    "You are preparing for a counselling or group session and want to walk in with the actual pattern from the last fortnight rather than a general sense of how it went.",
    "You suspect that most of your hardest moments cluster around one situation, and want the trigger table to show whether that impression matches what you have written down.",
    "You want to see your day count and your average urge side by side, because progress in the second number is easy to miss when you are only watching the first.",
  ],
  benefits: [
    ["Triggers counted, not just listed", "Repeated entries in the trigger column are tallied and ranked, so the five that come up most often surface on their own."],
    ["Urge intensity summarised over time", "Average and highest urge are calculated across every entry, which shows the trend rather than only the worst day."],
    ["Coping responses kept in view", "The most recent entries are echoed back with the win or note you recorded, so what actually helped stays attached to the day it helped on."],
  ],
  faqs: [
    [
      "What format do the journal entries need?",
      "One line per day, with five fields separated by pipes: date, urge from 0 to 10, trigger, coping response, and a win or note. Only the urge column has to be a number, and values are clamped to the 0-10 range, so anything higher is read as 10.",
    ],
    [
      "How is the day count worked out?",
      "It is whole days elapsed between the recovery start date you enter and today, counted from midnight, so a start date of 1 July shows 30 days on 31 July. It counts from that fixed date and is not reduced by anything you record in the entries.",
    ],
    [
      "Is my journal stored anywhere?",
      "No. The text stays in the page while it is open and is neither saved to an account nor transmitted, so if you want a lasting record, keep the entries in your own file and paste them in when you want the summary.",
    ],
    [
      "Can this replace treatment or a support programme?",
      "No — it is an informational reflection aid only, with no clinical assessment behind it, and it cannot detect risk. Alcohol and some other withdrawals can be medically dangerous, so speak to a doctor, a qualified addiction service or your local emergency number about withdrawal, medication or any treatment decision, and use this alongside that support rather than instead of it.",
    ],
  ],
};

export default seo;
