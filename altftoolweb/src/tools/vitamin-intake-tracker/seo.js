const seo = {
  title: "Vitamin Intake Tracker: Daily Supplement Checklist",
  metaDescription:
    "One-tap checklist for D3, B-complex, magnesium, omega-3 and vitamin C, with each target range and a progress bar that resets every day.",
  steps: [
    "Open the tracker to today's five cards - Vitamin D3, B-Complex (B6, B9, B12), Magnesium (Glycinate / L-Threonate), Omega-3 (EPA & DHA) and Vitamin C - each showing its target, such as \"Target: 1000 - 4000 IU\".",
    "Tap a card as you take that supplement: the empty circle becomes a tick and the card fills with the item's colour.",
    "\"Daily Stack Progress\" shows the percentage of the five ticked, 20% per item; the ticks are stored in your browser against today's date and start empty tomorrow.",
  ],
  intro:
    "The Vitamin Intake Tracker is a one-tap daily checklist for a five-supplement stack — Vitamin D3, a B-complex, Magnesium, Omega-3 and Vitamin C — that shows each one's commonly cited target range and fills a progress bar as you tick them off. Your ticks are saved in your own browser against today's date and clear automatically when the date rolls over, so each morning starts empty. It is a habit aid for people already taking supplements, and it is informational only: dosage decisions belong with a doctor or pharmacist who knows your bloodwork and medications.",
  useCases: [
    "You take four or five supplements at different times of day and keep genuinely forgetting whether you already took the magnesium before bed.",
    "You have just started a stack and want a visible daily prompt for the first few weeks while the routine is still forming.",
    "You are travelling with a pill organiser and want a quick check on your phone that the evening ones went in, without installing an app or making an account.",
  ],
  benefits: [
    [
      "Resets itself at midnight",
      "The saved state is stamped with today's date and simply does not load on a new day, so there is no stale checklist to clear manually.",
    ],
    [
      "Target range shown on each card",
      "Every item carries its commonly cited dose range and a one-line note on what it is taken for, so you are not checking off an abbreviation you cannot remember the reason for.",
    ],
    [
      "No account and nothing sent anywhere",
      "The whole day's record lives in your browser's local storage, which means a health habit log that no server ever sees.",
    ],
  ],
  faqs: [
    [
      "What dosages does the tracker show?",
      "Vitamin D3 at 1,000 to 4,000 IU, Magnesium as glycinate or L-threonate at 200 to 400 mg, Omega-3 combined EPA and DHA at 1,000 to 2,000 mg, and Vitamin C at 500 to 1,000 mg; the B-complex is left as varies, with a note to look for methylated forms. These are general reference ranges shown for context, not a prescription — your own requirement depends on your diet, blood levels, medications and health conditions.",
    ],
    [
      "Does my checklist reset every day?",
      "Yes, automatically. The saved entry records the date it was made, and when you open the tracker on a different day that entry is ignored and every item starts unticked.",
    ],
    [
      "Can I add my own supplements to the list?",
      "Not currently. The tracker covers a fixed five-item stack, so if you take something outside that list you would need to note it elsewhere.",
    ],
    [
      "Is it safe to take all of these together?",
      "That depends on you, and this tool cannot answer it. Fat-soluble vitamins such as D can accumulate, some supplements interact with prescription medicines including blood thinners, and upper limits differ by age and pregnancy status — check with a doctor or pharmacist before starting or combining supplements.",
    ],
  ],
};

export default seo;
