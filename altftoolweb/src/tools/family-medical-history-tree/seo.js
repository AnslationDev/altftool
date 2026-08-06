const seo = {
  intro:
    "The Family Medical History Tree is a private note-keeper for hereditary health history: each record pairs a family member with the conditions and relation you want to remember, and the whole list is held in this browser's local storage until you export it as JSON. Add relatives one at a time, search across everything you have entered, delete individual entries, and import a JSON file back on another device. It is for anyone assembling the family-history answers a new GP, specialist or genetic counsellor asks for, without typing them into a cloud account first.",
  useCases: [
    "You are registering with a new practice and the form asks about conditions in first-degree relatives, so you write down what each parent and sibling has been diagnosed with and at roughly what age, then read from your own notes at the appointment.",
    "A grandparent tells you things at a family gathering that nobody has written down, so you capture each relative and condition on your phone before the detail is lost, and export the JSON to keep with your other documents.",
    "A specialist has asked whether a condition appears on one side of the family, so you type that condition into the search box and the saved list narrows to only the records mentioning it, each one still showing the family member it was filed under.",
  ],
  benefits: [
    ["Stays out of an account", "Records live in this browser's local storage, so a sensitive family history is not created as a row in someone else's database by default."],
    ["Portable JSON in and out", "Export the full list as family-medical-history-tree.json and import it again later or on another machine, so the notes are yours to move and to back up."],
    ["Searchable as it grows", "The search box filters across both the family member and the condition text, which is what makes a list of thirty relatives usable at an appointment."],
  ],
  faqs: [
    [
      "Where is my family medical history stored?",
      "In your own browser's local storage, under a key specific to this tool, and nowhere else unless you export it. Clearing site data, using private browsing, or switching browser or device will lose it, so export the JSON if the record matters.",
    ],
    [
      "What should I record for each relative?",
      "Name or relationship, the condition, and the age at which it was diagnosed — age at onset is the detail clinicians ask about most, because a condition appearing unusually early carries different weight than the same condition in later life. Note which side of the family each person is on as well.",
    ],
    [
      "How far back should a family medical history go?",
      "Most clinical family-history forms ask about three generations: you and your siblings and children, then parents, aunts and uncles, then grandparents. First-degree relatives — parents, siblings and children — carry the most weight, so start there and add further out as you learn more.",
    ],
    [
      "Can this tell me my risk of inheriting a condition?",
      "No. It only organises what you write down; it does not calculate risk, interpret patterns or offer a diagnosis. Bring the exported notes to a GP or a genetic counsellor, who can judge whether the pattern warrants screening or testing.",
    ],
  ],
};

export default seo;
