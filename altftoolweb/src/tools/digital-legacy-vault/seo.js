const seo = {
  intro:
    "This is a private worksheet for building the list your family would need if you were suddenly unreachable: each entry pairs a Record — an account, policy, document or where a key is kept — with the Instructions for what should happen to it. Entries stay in this browser's local storage and can be searched, deleted, exported as a single JSON file or imported back on another machine. It is an organiser, not a password manager: nothing is encrypted, so name where a credential lives rather than writing the credential itself.",
  useCases: [
    "You are writing a \"if anything happens to me\" letter and want the bank, insurer, utility and subscription list in one place with what to close and what to transfer",
    "A parent is going into surgery and the family needs to know which documents exist and where, without anyone handing over passwords in a group chat",
    "You keep a hardware wallet or a safe deposit box and want to record where the key is and who should be contacted, then export the file to a USB drive kept with your will",
  ],
  benefits: [
    ["Instruction, not just inventory", "Every record carries its own handover note, so an heir sees what to do with an account rather than only that it exists."],
    ["Portable JSON in and out", "Export the whole list as one JSON file for offline or encrypted storage and import it later on a different device."],
    ["Searchable as it grows", "A single search box filters across both fields, so a forty-entry list stays usable when someone is looking for one insurer at a stressful moment."],
  ],
  faqs: [
    [
      "Where is my data stored?",
      "In this browser's localStorage, under a key specific to this tool, and nowhere else — no account, no server, no sync. Clearing site data, using private browsing, or switching browsers or devices will lose the list, which is why the JSON export exists.",
    ],
    [
      "Should I put passwords in here?",
      "No. Nothing is encrypted, and localStorage is readable by anyone with access to the unlocked device. Record the location instead — \"password manager, master key in the safe\" or \"recovery codes in the fireproof box\" — and keep the actual secrets in a dedicated password manager with an emergency-access feature.",
    ],
    [
      "Is this list legally binding?",
      "No. It is informational notes, not a will, trust, or nomination form, and it does not override an account's registered beneficiary or a platform's own legacy-contact process. Talk to a solicitor or estate professional about anything with legal or tax consequences.",
    ],
    [
      "How do I hand it to my family?",
      "Export the JSON, store it somewhere they can reach — an encrypted drive, a sealed envelope with your will, or a shared vault — and tell at least one trusted person it exists and how to open it. The import button reloads that same file into this page later, so the handover does not depend on this site being reachable.",
    ],
  ],
};

export default seo;
