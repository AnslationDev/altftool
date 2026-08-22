const seo = {
  title: "LocalStorage Explorer: Read, Edit & Delete Keys",
  metaDescription:
    "List every localStorage key for this origin, edit long JSON values in a full textarea, add or delete entries, and clear the store with a confirm.",
  steps: [
    "Press Add Item and fill in Key Name (e.g. user_preferences) and Value (e.g. {\"theme\": \"dark\"}) in the multi-line box, or press Edit Item on an existing row.",
    "Press Save to write the entry with setItem, or Refresh to rebuild the alphabetically sorted Key/Value table from localStorage.",
    "Use Copy Value, Edit Item or Delete Item in the Actions column; Clear All wipes this domain's storage after a confirmation.",
  ],
  intro:
    "LocalStorage Explorer lists every key and value the Web Storage API exposes for the current origin, sorted alphabetically, and lets you add, edit, copy or delete entries and clear the whole store. It calls localStorage.key() and getItem() across localStorage.length to build the list, and writes back with setItem(), removeItem() and clear(), refreshing the view after each change. It is a lightweight substitute for the browser devtools Application panel when you want to read and edit stored values without opening devtools.",
  useCases: [
    "You are testing how a page behaves for a first-time visitor and want to delete a single onboarding flag rather than wiping the entire origin's storage.",
    "A stored JSON blob is too long to read comfortably in the devtools table, and you want it in a full textarea where you can copy it out in one click.",
    "You want to seed a specific key and value by hand — a feature flag or a theme preference — and immediately see how the page reacts.",
  ],
  benefits: [
    [
      "Full-height editor for long values",
      "Values open in a multi-line monospace textarea instead of a single-line cell, which makes stored JSON and tokens readable without a separate viewer.",
    ],
    [
      "Alphabetical listing that refreshes on every write",
      "The list is rebuilt from localStorage after each add, edit or delete, so what you see always matches what the browser actually holds.",
    ],
    [
      "Destructive actions are gated",
      "Clear All asks for confirmation before wiping the origin's storage, and editing an existing entry locks the key field so you cannot silently create a duplicate.",
    ],
  ],
  faqs: [
    [
      "Can this read localStorage from another website?",
      "No. The Web Storage API is strictly same-origin, so a page can only read and write the storage belonging to its own scheme, host and port. This tool shows the storage for the origin it is loaded on — to inspect another site's storage you need your browser's devtools Application panel while that site is open.",
    ],
    [
      "How much data can localStorage hold?",
      "Most browsers allow roughly 5 MB per origin, and values are always stored as strings, so numbers and objects have to be serialised with JSON.stringify before saving. Exceeding the quota throws a QuotaExceededError, which is why a save can fail even though the key looks small.",
    ],
    [
      "What is the difference between localStorage and sessionStorage?",
      "localStorage persists until it is explicitly cleared, surviving browser restarts, while sessionStorage is wiped when the tab closes and is not shared between tabs. This tool reads localStorage only.",
    ],
    [
      "Is it safe to store tokens or passwords in localStorage?",
      "It is generally discouraged. Any JavaScript running on the origin, including an injected third-party script, can read localStorage, and it is not protected by HttpOnly or SameSite flags the way cookies can be. For session credentials, prefer HttpOnly cookies and follow your security team's guidance.",
    ],
  ],
};

export default seo;
