const seo = {
  intro:
    "Pet Health Records Vault keeps one searchable list of your animals' health history — each entry pairs the pet's name with a health record such as a vaccination, medicine dose, weight reading or vet visit. Records are saved in this browser's own localStorage instead of an account, and the whole vault exports to a single JSON file you can back up or carry to another device. It suits multi-pet households and anyone tired of digging through paper cards and WhatsApp photos the moment a vet asks when the last rabies shot was given.",
  useCases: [
    "You have three cats on different vaccination cycles and need to answer 'when was Mishka last dewormed?' at the counter without scrolling two years of camera roll.",
    "Boarding a dog for a week and needing to hand the kennel a written list of current medicines, doses and the date of the last kennel-cough vaccine.",
    "Tracking a cat's monthly weight through a prescription diet, so all six weigh-ins sit together in the order you entered them at the next check-up instead of one isolated number.",
  ],
  benefits: [
    [
      "One vault, every pet",
      "The pet name is its own field on every record, so typing that name into the search box pulls the animal's history out of a shared household log — the search reads the whole record, so distinct names keep the results clean.",
    ],
    [
      "Search by anything you wrote",
      "The filter matches text anywhere in a record, so 'rabies', a medicine name or a clinic name pulls up every matching entry at once.",
    ],
    [
      "Export and import as JSON",
      "The whole vault saves to one file you keep, and reimports into any browser — useful for a backup before clearing site data, or for sharing a copy with a partner or pet sitter.",
    ],
  ],
  faqs: [
    [
      "Where are these pet records stored?",
      "In this browser's localStorage only — there is no account and nothing is uploaded. Clearing site data, using private browsing, or switching to a different browser or device will lose the vault, so export the JSON as a backup whenever you add something important.",
    ],
    [
      "What should I record for each pet?",
      "The details a vet or boarding facility asks for: vaccine name and date given, next due date, medicine with dose and frequency, weight with the date it was measured, and the reason for each visit. Adding the clinic name makes later searching much easier.",
    ],
    [
      "How often should vaccinations and check-ups be recorded?",
      "Record every one as it happens, on the day. Core vaccine intervals and check-up frequency vary by species, age, local law and the specific product used — your veterinarian sets the schedule, and this vault only stores what you enter, it does not calculate due dates or give medical advice.",
    ],
    [
      "Can I move the vault to a new phone or laptop?",
      "Yes. Use Export JSON on the old device and Import JSON on the new one, confirming the prompt that warns the import replaces every record already saved there. The export is a plain JSON array with one object per record, so it also opens in a text editor if you ever want to read or edit it outside the tool.",
    ],
  ],
};

export default seo;
