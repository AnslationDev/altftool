const seo = {
  title: "Online To-Do List with Starred Tasks Pinned on Top",
  metaDescription:
    "Free browser to-do list: star tasks to pin them on top, filter by All, Active, Important or Completed, edit inline. Saved to local storage, no account.",
  steps: [
    "Type a task into 'What needs to be done?' and click Add or press Enter.",
    "Star a task to pin it above the rest, tick it complete, or edit its text inline; every change saves to this browser's local storage.",
    "Switch between the All, Active, Important and Completed tabs — each carries a live count of matching tasks.",
  ],
  intro:
    "To Do List is a checklist that keeps starred tasks pinned to the top: every item can be completed, starred as important, renamed inline or deleted, and the list sorts important first and then newest first. Four filter tabs — All, Active, Important and Completed — carry live counts, matched by four stat cards above the list. Everything is saved to this browser's local storage as you type, with no account and no sync.",
  useCases: [
    "Clearing a workday: dump everything into the list first thing, star the two things that actually have to happen today, and work the Important tab instead of the full list.",
    "Keeping a running errands or shopping list on your phone that survives closing the tab, because it is written to local storage on every change rather than held in memory.",
    "Checking at the end of the week how much you actually finished — the Completed count stays visible in the stat row instead of items vanishing once ticked.",
  ],
  benefits: [
    [
      "Starred tasks sort themselves to the top",
      "Important items are pinned above the rest automatically, so the thing you flagged does not sink as you add more.",
    ],
    [
      "The Important tab hides what you already did",
      "The important count and filter exclude completed items, so the number tells you what is still outstanding rather than how many things you once starred.",
    ],
    [
      "Edit in place, no reopening",
      "Task text is editable inline, so fixing a typo or adding a detail takes a click rather than delete-and-retype.",
    ],
  ],
  faqs: [
    [
      "Do my tasks stay after I close the browser?",
      "Yes. The list is written to this browser's local storage under the key simpleTasks on every change, so it is there when you come back on the same device and browser. Clearing site data or using private browsing wipes it.",
    ],
    [
      "Does it sync between my phone and my laptop?",
      "No. Local storage is per browser and per device, so there is no sync and no account — a list added on your phone will not appear on your laptop.",
    ],
    [
      "How are tasks ordered?",
      "Important tasks come first, and within each group the newest task is at the top. There is no manual drag-to-reorder — starring an item is how you move it up.",
    ],
    [
      "What is the difference between Active and Important?",
      "Active is everything not yet ticked off; Important is the subset of those you have starred. A completed task drops out of both counts but stays visible under the Completed tab.",
    ],
  ],
};

export default seo;
