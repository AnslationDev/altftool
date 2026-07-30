const seo = {
  intro:
    "Clipboard History keeps a running list of the things you have copied, reading the clipboard when you return to the tab if you turn monitoring on, or taking entries you paste in by hand. Each entry is classified automatically as a URL, email address, JSON, code, number, hex colour or plain text, counted for characters and words, and timestamped, with up to 500 entries kept and duplicates promoted to the top rather than repeated. The whole list lives in your browser's local storage on this device.",
  useCases: [
    "You copied a confirmation code, then copied something else before pasting it, and need the earlier value back instead of regenerating it.",
    "You are gathering a dozen product links and reference numbers from different tabs and want them all in one list you can copy back from one at a time.",
    "You copy the same test JSON payload and hex colour repeatedly while building a page, and want them starred so a clear-out does not lose them.",
  ],
  benefits: [
    [
      "Types are detected, not guessed at by you",
      "Each entry is tagged URL, email, JSON, code, number, colour or text using pattern checks and a real JSON parse, so you can scan a long list by shape.",
    ],
    [
      "Duplicates move, they do not pile up",
      "Copying the same string again removes the older row and puts it at the top, so the history stays a list of distinct items rather than fifty copies of one link.",
    ],
    [
      "Favourites survive a clear-out",
      "Clearing offers a non-favourites option, so you can wipe the day's noise while keeping the entries you starred.",
    ],
  ],
  faqs: [
    [
      "How many clipboard entries are kept?",
      "Up to 500. When a new entry pushes the list past that, the oldest one is dropped. Each entry stores the text, its detected type, an ISO timestamp, and its character and word counts.",
    ],
    [
      "Why does it only capture when I switch back to the tab?",
      "Browsers do not allow a page to read the clipboard in the background. With monitoring on, the page reads it on window focus and on the tab becoming visible, so copy elsewhere and then click back to this tab to capture. You can also paste anything in manually.",
    ],
    [
      "How does it decide something is code or JSON?",
      "JSON is confirmed by actually parsing the text; code is matched heuristically against patterns such as a leading function/const/class/import keyword, a line ending in a brace or semicolon, an HTML tag, Python's def/print, or an SQL statement keyword. A pure hex value like #14B8A6 is tagged as a colour instead.",
    ],
    [
      "Is my clipboard content sent anywhere?",
      "No. Entries are written to your browser's local storage under altftool_clipboard_history_data and stay on this device. Because that storage is unencrypted, avoid capturing passwords or one-time codes, and use the clear option when you are finished.",
    ],
  ],
};

export default seo;
