const seo = {
  title: "Clipboard Capsule: Reusable Snippet Library",
  metaDescription:
    "Save canned replies, addresses and code once, file them under categories, pin or star favourites, and copy them back with one click — stored locally.",
  intro:
    "Clipboard Capsule is a saved-snippet library: you paste the text you keep needing again — signatures, addresses, code blocks, canned replies, tracking links — file it under a category, and copy it back with one click. Entries can be pinned to the top or starred as favourites, and search matches across the title, the body text and the category at once. Everything is stored in your browser's local storage on this device, so nothing is uploaded and nothing syncs.",
  useCases: [
    "You answer the same support questions all day and want five canned replies one click away instead of scrolling back through a chat log to re-copy them.",
    "You are filling in forms across several sites and keep retyping the same address, VAT number and emergency contact — save each one once and copy it back as needed.",
    "You are working through a tutorial and keep pasting the same commands and API endpoints; filing them under a Code category keeps them separate from your text snippets.",
  ],
  benefits: [
    [
      "Pinned before recent",
      "The list sorts pinned items first and then newest-first, so the three snippets you use hourly stay at the top no matter how much you add.",
    ],
    [
      "Search hits the body, not just the label",
      "A query is matched against the title, the full snippet content and the category together, so you can find an entry by a phrase inside it.",
    ],
    [
      "Categories you define",
      "It ships with Text, Code, Links, Emails and Other, and typing a new category on a snippet creates it and keeps it as a tab.",
    ],
  ],
  faqs: [
    [
      "Does it record everything I copy automatically?",
      "No — snippets are added by you, deliberately. Browsers do not let a web page read your clipboard in the background, so nothing is captured unless you paste it in and save it.",
    ],
    [
      "Where are my snippets stored?",
      "In your browser's local storage under the keys altftool_clipboard_capsule_data and ..._categories, on the device and browser you saved them in. They are not sent to a server, not synced between devices, and clearing site data or using a private window will remove them.",
    ],
    [
      "What if I do not give a snippet a title?",
      "It titles itself from the content: the first 20 characters followed by an ellipsis. You can edit the title afterwards, and the untitled snippet is still fully searchable by its body text.",
    ],
    [
      "Should I keep passwords or card numbers in here?",
      "No. Local storage is plain, unencrypted text readable by anyone with access to the browser profile, so keep credentials and payment details in a password manager and use this for non-sensitive text you reuse.",
    ],
  ],
};

export default seo;
