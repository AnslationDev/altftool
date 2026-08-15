const seo = {
  title: "Bookmark Organizer: Import bookmarks.html, Tag",
  metaDescription:
    "Import a Netscape bookmarks HTML export or a JSON backup, then file links in folders, tag and bulk-edit them, and sort by how often you open each.",
  intro:
    "The Bookmark Organization Assistant imports a browser's Netscape-format bookmarks HTML export or a JSON backup and turns it into a filed library with folders, tags, favourites, drag-and-drop sorting and bulk actions, all held in your browser. It is for people whose exported bookmarks file has thousands of unsorted links and who need to triage them in batches rather than one at a time. Counters at the top track total bookmarks, favourites, folders and distinct tags as you work, and you can sort the list by date added, title A–Z, or how often you have opened each link.",
  useCases: [
    "You exported bookmarks.html from Chrome or Firefox after years of saving links and need to sort several hundred of them into folders without opening each one.",
    "You want to select every link tagged for a project and move it into one folder and tag it in a single action instead of dragging each card.",
    "You are deciding what to prune and want the library sorted by how many times you have actually opened each bookmark, so the never-touched ones surface first.",
  ],
  benefits: [
    ["Reads the browser export format directly", "Parses Netscape bookmarks HTML — the file every major browser exports — as well as JSON, then asks whether to merge or replace before touching your library."],
    ["Bulk edit instead of one-by-one", "Selection mode lets you favourite, move to a folder, apply a tag or delete many bookmarks in one action, with Select All scoped to the current filter."],
    ["Sorts by real usage", "Opening a bookmark increments its use count, so the 'most used' sort reflects what you actually return to rather than what you saved most recently."],
  ],
  faqs: [
    [
      "What file can I import my existing bookmarks from?",
      "Either a bookmarks HTML file in the Netscape format that Chrome, Firefox, Edge and Safari all export, or a JSON file previously exported here. After parsing, you are shown the bookmark count and asked to merge into your current library or replace it entirely.",
    ],
    [
      "What happens to the bookmarks inside a folder if I delete the folder?",
      "They are moved to the General folder, not deleted. Deleting a folder is confirmed first and cannot be undone, but the links themselves survive the move.",
    ],
    [
      "Can I undo deleting a single bookmark?",
      "Yes, for one bookmark at a time — deleting a single card shows a toast with an Undo action that restores it. Bulk deletion of a selected set has no undo, so export a JSON backup before large clear-outs.",
    ],
    [
      "How do folders and tags differ here?",
      "A bookmark lives in exactly one folder but can carry any number of tags, so folders give you a single filing location and tags give you cross-cutting labels. The sidebar lists both, and the stats row counts distinct tags across your whole library.",
    ],
  ],
};

export default seo;
