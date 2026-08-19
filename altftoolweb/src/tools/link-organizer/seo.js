const seo = {
  title: "Link Organizer: Save Link Groups, Open in Tabs",
  metaDescription:
    "File links into named groups, star favourites and open a whole group in new tabs with one Open All click. Stored in your browser - no account needed.",
  steps: [
    "Press Add Link, fill in the URL (required) and optional Title, then file it under one of the starter groups (Daily Reads, Dev Resources, Design Inspiration, Work) or Add New Group, and hit Save Link.",
    "Find links by switching the All / Favorites / group tabs or typing in the 'Search by URL, title...' box, which also matches group names.",
    "On a specific group's tab press Open All to launch every link in that group in its own browser tab; the list is kept in your browser's localStorage.",
  ],
  intro:
    "Link Organizer is a browser-local link manager that files URLs into named groups and can open an entire group in new tabs with one click. It ships with four starter groups — Daily Reads, Dev Resources, Design Inspiration and Work — and you can add your own from the add-link form. Everything is kept in your browser's local storage, so the list is tied to that one browser and needs no account, but it also does not sync between devices.",
  useCases: [
    "Keeping a 'Daily Reads' group of the six sites you check every morning and launching all of them at once instead of typing each address",
    "Collecting docs, dashboards and repos for one project into a group so a new teammate can be walked through the whole stack in order",
    "Starring the handful of references you reach for constantly, then using the Favorites tab to get to them without scrolling through everything else",
  ],
  benefits: [
    ["Open a whole group at once", "Select a group and Open All launches every link in it in its own tab — a saved workspace rather than a saved bookmark."],
    ["Search covers title, URL and group", "One search box matches across all three fields, so a half-remembered domain or folder name is enough to find the link."],
    ["Groups you invent on the spot", "New group names are created straight from the add-link form and become tabs immediately, with no separate folder-management step."],
  ],
  faqs: [
    [
      "How do I open all the links in a group at once?",
      "Switch to that group's tab and press Open All — every link in the group opens in a new browser tab. The button only appears on a specific group, not on All or Favorites, and your browser's pop-up blocker may ask permission the first time it sees several tabs open together.",
    ],
    [
      "Where are my saved links stored?",
      "In your browser's local storage on the device you added them from, under the keys altftool_link_organizer_data and altftool_link_organizer_groups. There is no account and no sync, so clearing site data or browsing history for this site removes the list, and it will not appear on your phone or another browser.",
    ],
    [
      "Can I make my own groups?",
      "Yes. In the add-link form choose Add New Group, type the name, and the link is filed under it and a new tab appears for it. Four groups exist by default — Daily Reads, Dev Resources, Design Inspiration and Work — and there is no limit on how many you add.",
    ],
    [
      "How is this different from browser bookmarks?",
      "The main difference is bulk opening: a group here behaves like a session you launch, not a folder you click through one item at a time. Favorites, group-aware search and inline editing of a link's title and group are all on one screen rather than in a separate bookmark manager.",
    ],
  ],
};

export default seo;
