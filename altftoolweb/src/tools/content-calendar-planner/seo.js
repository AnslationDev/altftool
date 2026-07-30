const seo = {
  intro:
    "Content Calendar Planner is a month-grid editorial calendar where each piece carries a platform, content type, publish date, status, budget, target reach, notes and its own production checklist. It covers six channels — blog, YouTube, Instagram, LinkedIn, Twitter/X and newsletter — and pre-fills each with that channel's usual production steps, then rolls the whole plan up into total budget, total target reach and an average completion percentage. It is for solo creators and small marketing teams who need one view of what ships when and how much of it is actually done.",
  useCases: [
    "You are running blog, newsletter and YouTube in parallel and want to see, on one month grid, whether you have accidentally stacked three launches into the same week.",
    "A client asks what the quarter's content spend is going toward, and you need the per-piece budget figures totalled with the target reach beside them.",
    "A video is marked scheduled for Friday but the thumbnail and upload steps are still unticked, and you want that gap visible before the publish date arrives.",
  ],
  benefits: [
    ["Checklists arrive pre-filled per platform", "Pick YouTube and you get script, record, edit, thumbnail and upload steps; pick blog and you get keyword research through CMS publish — no rebuilding the same list each time."],
    ["Progress is measured from real subtasks", "Average progress is the mean of each post's completed-task ratio, so a piece with one of five steps done cannot look as ready as one with four."],
    ["Filter by day, platform and status together", "Clicking a calendar date narrows the list to that day, and the platform and status filters stack on top of it plus a text search across title, type and notes."],
  ],
  faqs: [
    [
      "Which platforms does the planner cover?",
      "Six: blog, YouTube, Instagram, LinkedIn, Twitter/X and newsletter. Each has its own colour, badge and default task list — Instagram, LinkedIn and X get four default steps, while blog, YouTube and newsletter get five.",
    ],
    [
      "How is the overall progress percentage calculated?",
      "It averages the completion ratio of each post's checklist, not the raw task count. A post with two of four tasks done contributes 50 percent regardless of how many tasks other posts have, so one long checklist cannot dominate the number.",
    ],
    [
      "Do my posts survive a page refresh?",
      "Yes — the calendar saves to your browser's local storage and reloads it on your next visit. It is per-browser, so a teammate opening the same page sees their own calendar, not yours.",
    ],
    [
      "What are the three statuses for?",
      "Draft, Scheduled and Published mark where a piece sits in the pipeline, and each has its own colour on the calendar and in the list. Filtering to Draft close to a publish date is the quickest way to find work that has not moved.",
    ],
  ],
};

export default seo;
