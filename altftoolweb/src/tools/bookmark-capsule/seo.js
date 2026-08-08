const seo = {
  title: "Bookmark Manager With Notes, Tags and JSON Export",
  metaDescription:
    "Save links with your own description, notes and tags, then pin, favourite or archive them. Stored in your browser; export a dated JSON backup.",
  intro:
    "Bookmark Capsule is a private link library that stores each bookmark's URL, title, description, category, tags and notes in your browser's localStorage, then lets you pin, favourite, archive and search across the whole set. It suits anyone whose browser bar has become an unusable wall of icons and who wants links described in their own words rather than by page title alone. Seven categories are set up by default — Development, Design, Education, Business, Marketing, Personal and News — and you can add your own, with a one-click JSON export as your backup.",
  useCases: [
    "You are researching a purchase across a dozen review sites and want each link saved with a note on what that page actually said, so you do not reopen all twelve later.",
    "Your reading list has grown past the point of usefulness and you want to archive the links you have finished with instead of deleting them, keeping the active list short.",
    "You are moving to a new laptop and want a portable JSON file of your curated links, notes and categories rather than an opaque browser sync.",
  ],
  benefits: [
    ["Notes and descriptions, not just titles", "Every entry carries a description, free-text notes and tags, and search matches across title, URL, description and category at once."],
    ["Pin, favourite and archive separately", "Pinned links sort to the top ahead of newest-first ordering, favourites get their own tab, and archived links leave the main list without being deleted."],
    ["Portable JSON backup", "Export writes a dated bookmarks-backup file, and import merges it back by bookmark ID so re-importing the same file never creates duplicates."],
  ],
  faqs: [
    [
      "Where are my bookmarks stored?",
      "In your browser's localStorage on the device you are using, under a single key for the bookmarks and another for your category list. Nothing is sent to a server, which also means clearing site data or browsing in a private window will remove them — export the JSON file if you want a copy you keep.",
    ],
    [
      "What is the difference between archiving and deleting a bookmark?",
      "Archiving keeps the bookmark and all its notes but removes it from the All tab and from category tabs, filing it under Archived where you can restore it later. Deleting removes the record permanently with no undo, so archive anything you might want back.",
    ],
    [
      "Can I add my own categories?",
      "Yes. Seven categories ship by default — Development, Design, Education, Business, Marketing, Personal and News — and typing a new category name when saving a bookmark adds it to the list and gives it its own tab automatically.",
    ],
    [
      "Will importing a backup duplicate the bookmarks I already have?",
      "No. Import compares each incoming entry's ID against the ones already stored and only adds records that are new, then reports how many were added. Entries without both an ID and a URL are skipped, and any new categories they reference are added to your tab list.",
    ],
  ],
};

export default seo;
