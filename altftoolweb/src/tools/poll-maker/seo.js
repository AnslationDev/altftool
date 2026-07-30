const seo = {
  title: "Free Poll Maker — On-Screen Voting with Pictures",
  h1: "Free Poll Maker — On-Screen Live Voting",
  metaDescription:
    "Free poll maker for a shared screen — add a question and picture options, get a 60-second timer, watch the bars fill live, then export a PNG card.",
  intro:
    "Poll Maker builds a live voting board in the page: type a question, add as many options as you like with an optional image on each, and tally votes as people click, with a 60-second countdown that locks the poll when it expires. Results appear as a live bar chart of the vote counts, with a most-popular and underdog readout, and the finished result can be exported as a PNG card. It suits anyone running a quick vote on a shared screen — a classroom, a team stand-up, a stream — rather than collecting answers from remote devices.",
  useCases: [
    "You are teaching and want the class to vote on which worked example to do next, with the tally visible on the projector as hands go up.",
    "A team meeting stalls on two options, so you run a timed 60-second vote on the shared screen and settle it before the slot ends.",
    "You want a results graphic for a social post, so you run the poll, then export the question and percentages as a PNG card to attach.",
  ],
  benefits: [
    [
      "Timed and lockable",
      "A 60-second countdown runs with the poll and disables every option the moment it hits zero, so late clicks cannot change the outcome.",
    ],
    [
      "Hides results until people commit",
      "Turn on hide-results-until-vote and the bars stay hidden until the first vote is cast on the shared screen, so nobody anchors on an early tally.",
    ],
    [
      "Draft survives a refresh",
      "The question, the options and the theme are written to browser storage as you type, so an accidental reload does not cost you the wording — only the option pictures need re-picking.",
    ],
    [
      "A picture on every option",
      "Each option takes its own image from your device and shows it above the label on the voting card. The downloadable PNG card is text only — it carries the question, the options and the tally, not the pictures.",
    ],
  ],
  faqs: [
    [
      "Can people vote from their own phones with a link?",
      "No — votes are counted in the browser tab where the poll is open, so this is a shared-screen or single-device poll. If you need remote respondents on separate devices, use a hosted survey service instead.",
    ],
    [
      "How long does a poll stay open?",
      "60 seconds from the moment the poll is created. When the countdown reaches zero the poll is marked Ended and the option buttons stop accepting clicks. Reload the page to run another round.",
    ],
    [
      "How many options can I add?",
      "It starts with two and you can keep adding more with no fixed ceiling, but every option needs text before the poll will start — a blank field blocks creation. Each option can also carry its own image thumbnail.",
    ],
    [
      "Where is my poll data stored?",
      "In your own browser's local storage, not on a server. The draft question, options and theme come back the next time you open the tool on that device; the option pictures do not, because they are held as temporary blob URLs that stop resolving once the page is closed. Clearing site data removes the draft entirely.",
    ],
    [
      "Can I make a poll with pictures?",
      "Yes. Every option has its own Upload Image control, and the picture you pick is shown above that option's label on the voting card. It is not included in the downloadable PNG, which is text only. Images are read straight from your device as object URLs, so they are never uploaded anywhere.",
    ],
    [
      "Is this poll maker free?",
      "Yes — free, with no signup, no email step and no cap on how many polls you run. Everything happens in the page: creating the poll, counting the votes, drawing the chart and rendering the PNG card.",
    ],
    [
      "Can I save the result to share afterwards?",
      "Yes. Once votes are in, Download Card renders the question and the percentage bars to an image and saves it as poll-card.png, which is what you attach to a post or a recap message.",
    ],
    [
      "Can I change how the poll looks?",
      "Four themes are built in — Dark, Gradient, Glass and Neon — and the choice is saved with your draft, so a poll on a projector can be styled for the room before you start it.",
    ],
  ],
  steps: [
    "Type your question, fill in the options — add more with + Add Option and give any of them a picture with Upload Image — or press the dice for a ready-made question.",
    "Tick Hide results until vote if you do not want early bars swaying the room, pick a theme, then press Create Poll to start the 60-second countdown.",
    "Let people tap their choice on the shared screen, read the vote-count chart with its most-popular and underdog lines, and press Download Card to save the result as a PNG.",
  ],
};

export default seo;
