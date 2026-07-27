const seo = {
  intro:
    "This tracker records which edition of each textbook, guide or module you actually study from and compares it with the latest edition you have seen, marking every item Current, Behind or Unknown. Behind means a higher edition number exists; anything revised more than five years ago is additionally flagged for a re-check because syllabi, law and data-heavy chapters drift. It is built for exam aspirants and students juggling many books who keep discovering mid-preparation that a chapter was rewritten in a newer edition.",
  useCases: [
    "A UPSC aspirant checks whether their Laxmikanth, Spectrum and economy notes match the editions toppers currently recommend",
    "A CA or law student tracks which module versions the institute has re-issued since they downloaded their set",
    "A coaching student lists borrowed and second-hand books to decide which ones are safe to keep using",
  ],
  benefits: [
    ["One shelf audit", "Every book's edition, year and status sits in one table instead of scattered memory."],
    ["Clear action list", "Behind and Unknown items are counted so you know exactly how many checks to do."],
    ["Saved locally", "The list persists in your browser between visits; nothing is uploaded."],
  ],
  faqs: [
    [
      "Does the edition of a textbook really matter for exam preparation?",
      "Often, yes. New editions of standard exam books routinely add new chapters, updated statutes, revised data and corrected errors — for example, constitutional amendment and reorganisation updates appear only in newer editions of standard polity books. For fast-moving subjects like polity, economy or tax, an edition several years old can teach superseded material.",
    ],
    [
      "How do I find the latest edition of a book?",
      "Check the publisher's product page or the book's listing on a major bookstore, which state the edition number and year; the copyright page of any copy also lists its own edition and printing. Record that number in the tracker and the tool will tell you how many editions behind you are.",
    ],
    [
      "What is the difference between an edition and a reprint?",
      "A new edition changes content — added chapters, updates, corrections — while a reprint reproduces the same edition with no substantive change. Only the edition number matters for whether your material is out of date, so ignore reprint years when filling the tracker.",
    ],
    [
      "Is my book list stored anywhere online?",
      "No. The list is kept in your own browser's local storage on your device, so it survives page reloads but never leaves your machine. Clearing browser data or using the Reset button removes it.",
    ],
  ],
};

export default seo;
