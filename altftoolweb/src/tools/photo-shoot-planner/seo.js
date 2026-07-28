const seo = {
  title: "Photo Shoot Planner — Free Shot List & Call Sheet",
  h1: "Photo Shoot Planner: Shot List, Timeline and Call Sheet",
  metaDescription:
    "Plan a shoot in timed blocks: fashion, product, wedding, travel or portrait shot lists, timeline, risk score, CSV/JSON export. Free, in-browser.",
  intro:
    "Photo Shoot Planner turns a start time, a block count and a block length into a back-to-back call sheet. It runs a minutes-past-midnight cursor forward one block duration at a time and formats each window as a zero-padded HH:MM range, so eight 30-minute blocks from 07:00 lay out as 07:00-07:30, 07:30-08:00 and so on. Choosing a shoot type fills every block from a five-shot library cycled by a modulo index, alternates the owner between Photographer and Assistant, and flags the first two blocks High priority; alongside it the tool computes total runtime (blocks x minutes + setup + buffer), a budget-per-hour rate and a 5-100 risk score. The whole plan is calculated in the page and autosaved to your browser's localStorage — the planner makes no network requests, so nothing is uploaded.",
  useCases: [
    "Build a wedding call sheet from a 7:00 AM start: set the block count, print the plan, and hand the CSV shot list to the second shooter.",
    "Cost a product shoot before quoting — enter the budget and see the effective rate per hour once setup time and buffer are folded into the runtime.",
    "Stress-test a thin schedule: a two-person crew running 25-minute blocks with no buffer pushes the risk score up before you commit to the day.",
  ],
  benefits: [
    [
      "A timeline that actually adds up",
      "Blocks run back-to-back from your start time, and total runtime is blocks x minutes per block, plus setup minutes, plus a buffer taken as a percentage of shooting time — so the finish time on the sheet is the real one.",
    ],
    [
      "Shot lists that match the shoot type",
      "Fashion, product, wedding, travel and portrait each carry a five-shot library that cycles across as many blocks as you create, with owners alternating and High/Medium/Low priorities assigned automatically.",
    ],
    [
      "A risk score before the shoot day",
      "A 5-100 tightness figure adds 8 points per block and stacks penalties for blocks under 40 minutes, a crew under three, and a buffer under 10% — so you can see a fragile schedule while it is still editable.",
    ],
    [
      "Exports the whole crew can use",
      "Copy a plain-text summary to the clipboard, download a six-column CSV shot list or the full plan as JSON, or print the page straight to paper or PDF as a call sheet.",
    ],
  ],
  faqs: [
    [
      "How do I make a shot list for a photo shoot?",
      "Pick a shoot type and set how many timeline blocks you need — the planner fills each block for you. Fashion, product, wedding, travel and portrait each have a five-shot library (product, for example, runs front hero, 45-degree angle, macro texture, in-use lifestyle and packaging flat lay), and the list repeats in order once you go past five blocks.",
    ],
    [
      "Is this photo shoot planner free, and do I need an account?",
      "It is free with no sign-up. The plan is computed entirely in the page — the tool makes no network requests — and is saved only to your own browser under the localStorage key photo-shoot-planner-v1, so it survives a closed tab and the Reset button clears it.",
    ],
    [
      "How is total shoot time calculated?",
      "Total = (blocks x minutes per block) + setup minutes + buffer, where buffer is a percentage of shooting time only. Eight 30-minute blocks with 45 minutes of setup and a 15% buffer gives 240 + 45 + 36 = 321 minutes. Blocks default to 30 minutes and are floored at 15 if you enter less.",
    ],
    [
      "What does the risk score mean?",
      "It is a 5-100 measure of how tight your schedule is, not a prediction about the shoot. It adds 8 points per timeline block, 15 more if blocks are shorter than 40 minutes, 20 if the team is smaller than three, and 20 if the buffer is under 10%, then caps at 100. Longer blocks, more crew or a bigger buffer bring it down.",
    ],
    [
      "Can I export the shot list to CSV or a call sheet?",
      "Yes. Export CSV downloads photo-shoot-shotlist.csv with Block, Time, Shot, Owner, Priority and Completed columns, which opens in Excel, Numbers or Google Sheets. Export JSON saves the full plan as photo-shoot-plan.json, and Print Plan sends the page to your printer or a PDF.",
    ],
    [
      "What lighting guidance does it give?",
      "One direction note per style. Daylight suggests reflectors and soft diffusion between 9 and 11 AM; studio starts at a 2:1 key-to-fill ratio with a rim light for separation; golden hour prioritises backlight, exposing for skin and keeping white balance warm; mixed light says lock white balance, flag practicals and gel the key to match ambient.",
    ],
    [
      "Can I tick off shots during the shoot?",
      "Yes. Every block has a Done checkbox, and the header shows completion as a percentage of blocks checked. Those ticks save with the rest of the plan in your browser and appear as a Yes/No Completed column in the CSV export.",
    ],
    [
      "What currency does the budget field use?",
      "Indian rupees — the input is labelled Budget (INR) and the Budget per Hour metric is displayed in INR. The figure itself is just budget divided by total runtime in hours, so it reads correctly as a rate per hour if you enter another currency's amount.",
    ],
  ],
  steps: [
    "Enter the project name, location, date and start time, then choose a shoot type (fashion, product, wedding, travel or portrait) and a lighting style.",
    "Set the number of timeline blocks, minutes per block, team size, setup time, buffer percent and budget — the timeline, shot list, metrics and risk score recalculate as you type.",
    "Copy the summary, export JSON or CSV, or hit Print Plan to hand the call sheet to your crew; the plan stays saved in your browser until you press Reset.",
  ],
};

export default seo;
