const seo = {
  intro:
    "This generator builds a pre-production, shoot-day and post-production checklist for a specific video and attaches a time estimate to every task. It works from two ratios you can measure — the shooting ratio (minutes of footage per finished minute) and the editing ratio (minutes of editing per minute of footage) — then adds fixed setup costs, a contingency buffer and a sequential call-sheet timeline from your call time. Aimed at solo creators and small crews who keep underestimating post.",
  useCases: [
    "Quote a client honestly for a ten-minute talking-head video, post included.",
    "Build a call sheet for a two-camera interview and know when the day actually wraps.",
    "Show a stakeholder why a five-minute event edit costs more hours than the event itself.",
    "Hand a new editor a task list with the time each stage is budgeted for.",
  ],
  benefits: [
    ["Estimates from footage, not vibes", "Editing time is derived from how much you will record, so it scales properly."],
    ["Conditional tasks", "Location, multicam and graphics each add only the steps they actually require."],
    ["A real timeline", "Shoot tasks run sequentially from the call time, so you can see the wrap before you commit."],
  ],
  faqs: [
    [
      "How long does it take to edit one minute of video?",
      "For most online formats it lands between three and six minutes of editing per minute of raw footage, not per finished minute — which is why a tight shooting ratio saves more time than a fast computer. A ten-minute talking-head at a 3:1 shooting ratio means 30 minutes of footage and roughly two hours of editing.",
    ],
    [
      "What is a shooting ratio and what should mine be?",
      "It is minutes of footage recorded per finished minute. Scripted talking-head work runs about 3:1, interviews around 6:1 and event coverage 10:1 or more, because you cannot ask the event for another take.",
    ],
    [
      "What should be on a shoot-day checklist?",
      "Lighting, audio rig and level check, exposure and locked white balance, a test take you actually play back, the main record, safety takes of the open and close, cutaways, 60 seconds of room tone, and a verified card copy to two drives before the set is struck.",
    ],
    [
      "How much contingency should I add to a video schedule?",
      "Around 20% is a reasonable default for a familiar format in a controlled space, and 25 to 30% for location or event work where you do not control the variables. The buffer here is applied to every phase, not only the shoot.",
    ],
  ],
};

export default seo;
