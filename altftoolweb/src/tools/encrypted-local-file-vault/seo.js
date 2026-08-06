const seo = {
  intro:
    "The Encrypted Local File Vault is a browser-local index for the encrypted files you already keep elsewhere: each record holds a file name and a passphrase hint, saved to this browser's localStorage and never sent anywhere. It is for people who encrypt archives, disk images or document bundles with other software and then lose track of which passphrase belongs to which file. It is a catalogue, not an encryption engine — it does not encrypt, decrypt or store the files themselves.",
  useCases: [
    "You have a dozen encrypted 7-Zip and VeraCrypt containers on an external drive and need one searchable list of what each one is, with a hint that reminds you which passphrase you used.",
    "You are handing a project archive to a colleague and want to keep your own note of the file name and the hint you gave them, without writing it into a shared document.",
    "You are moving to a new laptop and export the index as JSON so the list travels with you, then import it on the other machine.",
  ],
  benefits: [
    [
      "Hints, not secrets",
      "The record shape is deliberately just a file name and a hint, which keeps the list useful for recall while giving it nothing worth stealing.",
    ],
    [
      "Search across every field",
      "The filter matches text anywhere in a record, so a partial file name or a fragment of a hint narrows a long list immediately.",
    ],
    [
      "Portable as plain JSON",
      "Export writes a readable JSON array you can back up or diff, and import reads it back after a confirmation prompt — replacing the current list rather than merging into it, and keeping each record's existing id — so there is no proprietary format to get stuck in.",
    ],
  ],
  faqs: [
    [
      "Does this tool actually encrypt my files?",
      "No. It stores a text index of file names and passphrase hints only — no file ever passes through it and nothing is encrypted or decrypted here. Use dedicated software such as VeraCrypt, 7-Zip AES-256 or your operating system's disk encryption to protect the files themselves, and use this to remember what you protected.",
    ],
    [
      "Should I type my actual passphrase into the hint field?",
      "No — write a reminder, not the secret. Records are saved as plain text in this browser's localStorage under a single key, so anyone with access to the browser profile can read them, and a real passphrase stored there would be no safer than one written on a sticky note.",
    ],
    [
      "Where is my data stored, and can I lose it?",
      "Everything lives in localStorage in the one browser and profile you used, so it is not synced and not on any server. Clearing site data, using private browsing or switching devices loses the index — export the JSON if the list matters to you.",
    ],
    [
      "Can other people see my records?",
      "Only someone using the same browser profile on the same device. Nothing is transmitted, but nothing is password-protected inside the page either — if the machine is shared, treat the index as visible to everyone who can unlock it.",
    ],
  ],
};

export default seo;
