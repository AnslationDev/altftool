const seo = {
  title: "Browser Storage Cleanup Planner: What to Clear",
  metaDescription:
    "Pick a goal — tracking, space or a broken site — and get a clear/keep plan for localStorage, IndexedDB and service worker caches, with what breaks.",
  steps: [
    "Choose a goal under What are you trying to achieve? — Stop cross-site tracking, Reclaim disk space, Fix one misbehaving site, Hand the device to someone else or Shrink the re-identification surface — and your Browser: Chrome, Edge, Firefox or Safari.",
    "Tick what to protect under Things you would rather not lose: Keep me signed in to the sites I use, Keep site preferences and granted permissions, Keep offline data for installed web apps.",
    "Read the Stores to clear count with Privacy gain, Space reclaimed and Breakage risk meters, review the Clear these and Leave these alone lists with What breaks per store, then press Copy plan.",
  ],
  intro:
    "Browser Storage Cleanup Planner sorts the dozen or so places a browser keeps your data into a clear list and a keep list, based on what you are actually trying to achieve. It covers the stores that \"Clear browsing data\" misses — localStorage, IndexedDB, service worker caches, extension storage and the copy held in your sync account — and states the cost of clearing each one before you do it. Useful when you want to break cross-site tracking or free disk space without signing yourself out of everything.",
  useCases: [
    "Break advertiser tracking links between sites while staying signed in to your email, bank and work tools.",
    "Free several gigabytes of profile space by emptying the HTTP cache and service worker caches without touching passwords.",
    "Fix a web app that keeps loading an old build by unregistering its service worker instead of clearing cookies again.",
    "Strip personal data from a browser profile before handing a laptop to a colleague, a repair shop or a buyer.",
  ],
  benefits: [
    ["Covers what the dialog misses", "Extension storage and the sync-account copy survive Clear browsing data — both are listed explicitly."],
    ["Breakage stated up front", "Every store shows what stops working when it is cleared, so nothing surprises you afterwards."],
    ["Per-browser instructions", "Gives the exact settings path for Chrome, Edge, Firefox and Safari, plus each one's known gap."],
  ],
  faqs: [
    [
      "Does clearing cookies stop websites tracking me?",
      "Only partly. Tracking scripts also write identifiers to localStorage, IndexedDB and Cache Storage, so a cookies-only clear can be undone the moment you revisit the site. Clearing all script-writable storage, or blocking third-party cookies outright, does far more than a cookie clear.",
    ],
    [
      "What is the difference between localStorage and cookies?",
      "Cookies are attached to every matching HTTP request and can be set by the server; localStorage is written by page scripts, stays in the browser, and is never sent automatically. Cookies have expiry dates, while localStorage persists indefinitely unless the browser or the user clears it — Safari's Intelligent Tracking Prevention is an exception and removes script-writable storage seven days after your last interaction with the site.",
    ],
    [
      "Why does a website still show the old version after I clear the cache?",
      "Because a service worker is serving a cached app shell from Cache Storage, which a normal cache clear does not unregister. Clear that site's storage specifically, or use the browser's site-data view to delete the registration, and the next load will fetch a fresh build.",
    ],
    [
      "Will clearing browser data delete my saved passwords?",
      "Only if you tick passwords in the clear dialog, and that deletion is permanent — the browser has no undo. If the profile is signed in to sync, the deletion can also propagate to your other devices, so export or migrate credentials to a password manager before clearing anything in that category.",
    ],
  ],
};

export default seo;
