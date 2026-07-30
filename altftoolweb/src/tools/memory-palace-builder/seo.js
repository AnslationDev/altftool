const seo = {
  intro:
    "The Memory Palace Builder is a three-level outliner for the method of loci: you create palaces, add ordered rooms inside them, and place objects in each room with an association and optional notes. A built-in review mode then walks every object in room order, showing the object name first and hiding the association until you press Reveal, so you can self-test recall rather than reread. Students, speakers and competitive memorisers get a structured palace that saves to the browser and exports as JSON.",
  useCases: [
    "You are memorising the cranial nerves for an anatomy exam and want each nerve pegged to a specific object in your childhood kitchen, in a fixed walking order you can rehearse.",
    "You have a 20-minute talk to give without notes and want to anchor each section to a room so you can walk the route on stage instead of tracking slides.",
    "You built a palace on your laptop and want to carry it to another machine, so you export the JSON and import it there rather than retyping every locus.",
  ],
  benefits: [
    ["Order is the point", "Rooms and objects can be moved up or down, so the walking route stays fixed — the sequencing the method of loci depends on."],
    ["Recall test, not just storage", "Review mode shows the object and hides the association behind a Reveal button, with a progress bar across all objects in the palace."],
    ["Portable palaces", "Everything exports to a dated JSON file and imports back, so a palace survives a new browser, machine or profile."],
  ],
  faqs: [
    [
      "What is the method of loci?",
      "It is a mnemonic technique where you attach each item you want to remember to a distinct location along a familiar route, then mentally walk the route to retrieve them in order. It works because spatial and visual memory is far easier to traverse than an abstract list, which is why the ordering of rooms and objects matters here.",
    ],
    [
      "Where is my palace stored?",
      "In your browser's localStorage under the key altf-memory-palace-data, saved automatically after every edit. Nothing is sent to a server, but clearing site data or browsing in a private window will remove it, so export the JSON if the palace matters.",
    ],
    [
      "How many objects should I put in one room?",
      "Keep it small — most practitioners place roughly 3 to 5 distinct loci per room so no two objects blur together at the same spot. There is no hard cap in the builder, so if a room feels crowded, split it into two rooms rather than stacking objects.",
    ],
    [
      "What is the difference between the object name and the association?",
      "The object is the physical anchor already in the room (the lamp, the doorknob); the association is the vivid image linking that anchor to what you are memorising. Review mode shows the object and hides the association, so writing them the other way round makes self-testing useless.",
    ],
  ],
};

export default seo;
