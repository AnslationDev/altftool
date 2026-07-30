const seo = {
  intro:
    "The Online Notepad is a plain-text scratchpad that writes every keystroke straight to your browser's localStorage, so the note and its title are still there when you come back to the tab. A live counter tracks words, characters and lines as you type, and Export saves the text as a .txt file named after your title. It is for the notes that are too small to deserve a document and too important to lose in a chat window.",
  useCases: [
    "Someone reads out an address or a booking reference on a call and you need somewhere to put it in two seconds, without waiting for a word processor to open a new file.",
    "You are drafting a message or a comment and want to write it somewhere that will not submit accidentally, then paste it across once it reads right.",
    "You are collecting fragments through the day — a title idea, a command you keep forgetting — and want them to survive closing the tab and reopening it tomorrow.",
  ],
  benefits: [
    ["Nothing to save, ever", "The note is written to local storage on every change, so there is no save button to forget and no unsaved-changes dialog."],
    ["Word, character and line counts live", "Three counters update as you type, which is enough to size a caption, a bio or a message against a limit without pasting it elsewhere."],
    ["Exports under your own filename", "The title field becomes the .txt filename, so the exported note lands in your downloads already identifiable."],
  ],
  faqs: [
    [
      "Will my note still be there if I close the browser?",
      "Yes. The note and title are stored in your browser's localStorage, which survives closing the tab and restarting the browser. It is tied to that one browser on that one device, so it will not appear on your phone or in a different browser.",
    ],
    [
      "Is anything I type uploaded or saved to an account?",
      "No — the text never leaves your device; it is written only to local storage in your own browser. That also means there is no server-side backup, so export anything you would be upset to lose.",
    ],
    [
      "How do I save the note as a file?",
      "Type a title, then press Export — it downloads the note as a plain .txt file named after the title, falling back to note.txt if the title is empty. The export is unformatted text, so it opens in any editor on any platform.",
    ],
    [
      "What happens if I press Clear?",
      "Clear empties the note body immediately and there is no undo, since the cleared state is autosaved straight away. The title is left untouched, so export first if the text still matters.",
    ],
  ],
};

export default seo;
