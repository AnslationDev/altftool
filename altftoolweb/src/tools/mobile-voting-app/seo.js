const seo = {
  title: "Mobile Voting App: Run a Poll on One Device",
  metaDescription:
    "Build a poll with 2-10 options, pass one device round for single-tap votes, and export the tally as CSV or JSON. Everything stays in local storage.",
  steps: [
    "Fill in Poll Title, Organizer Name and at least two Voting Options — Add Option takes you up to 10 — plus an optional Voting Deadline.",
    "Press Create Poll, hand the device round, and each person taps an option, then Submit Vote and Confirm Vote.",
    "Counts and percentages update on the poll card; the admin panel's CSV and JSON buttons save Poll_Title_results.csv with percentages to one decimal place.",
  ],
  intro:
    "The Mobile Voting App is a browser-based polling station: you create a poll with a title, an organiser, 2 to 10 unique options and an optional closing deadline, then collect single-tap votes and watch live counts and percentages update as they come in. It is built for the person running a team decision, a classroom vote or a stall at a live event who wants a ballot in under a minute. Polls and the record of who has already voted are kept in this browser's local storage, so it works as a shared voting device or kiosk rather than a hosted link you email out.",
  useCases: [
    "You are chairing a committee meeting and need a show-of-hands replaced by a real count — create the motion as a poll, pass the tablet round the table, and each device is blocked from voting twice.",
    "You run a workshop and want the room to pick the next session topic; you set a deadline 10 minutes out, let people tap an option, then project the live bar chart when the timer expires.",
    "You need to file the outcome of a club election — close the poll from the admin panel and export a CSV that lists every option with its vote count and percentage to one decimal place.",
  ],
  benefits: [
    ["One vote per device, enforced", "Each poll id is written to the browser session, so a second attempt on the same device is rejected instead of silently double-counting."],
    ["Full organiser controls", "Close, reopen, reset the tally to zero, or delete a poll outright without rebuilding it from scratch."],
    ["Results you can hand over", "Export any poll as CSV or JSON with the title, organiser, status, total votes and per-option percentages already computed."],
  ],
  faqs: [
    [
      "How many options can one poll have?",
      "Between 2 and 10. The form starts with two blank options and refuses to create the poll until at least two are filled in; duplicate options are rejected as well, and the check ignores letter case, so 'Yes' and 'yes' count as the same choice.",
    ],
    [
      "Can someone vote twice?",
      "Not from the same browser. When a vote is submitted the poll id and chosen option are stored in that browser's session record, and any later attempt shows an 'already voted' message. A different browser, device or private window is a fresh voter, so treat it as a device-level guard rather than identity verification.",
    ],
    [
      "Do votes from other people's phones show up automatically?",
      "No. Every poll and every vote lives in the local storage of the browser it was cast in, with nothing sent to a server. To gather votes from a group you pass one device around or run it on a shared screen; there is no live sync between separate phones.",
    ],
    [
      "What happens when the voting deadline passes?",
      "The poll stops accepting votes and the card switches to a 'voting deadline has passed' state, while the results stay visible. The deadline is optional — leave it blank and the poll runs until you close it manually from the admin panel.",
    ],
  ],
};

export default seo;
