const seo = {
  title: "Study Distraction Log – Rate per Hour & Time Lost",
  metaDescription:
    "Tally distractions by category for one study session to get interruptions per hour, minutes lost (3 min per event by default) and top 3 triggers.",
  steps: [
    "Enter your 'Study session length (minutes)' and adjust 'Minutes lost per distraction' — the default is a conservative 3 minutes.",
    "Tally how many times each category happened — Phone notifications / checking, Noise around you, Mind wandering / daydreaming and the rest.",
    "Read interruptions per hour, estimated minutes lost as a share of the session and your ranked top three triggers with a fix for each, then click Copy result.",
  ],
  intro:
    "This log turns a tally of study-session distractions into three actionable numbers: your interruption rate per hour, your top three triggers ranked by frequency, and an estimate of time lost computed as distraction count times an adjustable per-event cost (3 minutes by default). It is for students who feel a session 'disappeared' and want to see, in numbers, exactly where the time went.",
  useCases: [
    "A student tallying phone checks, family interruptions and daydreaming across a 2-hour evening session to find the biggest leak",
    "An exam aspirant comparing the interruption rate of morning versus late-night study slots before fixing a timetable",
    "A hostel resident quantifying noise and roommate interruptions to justify moving sessions to the library",
  ],
  benefits: [
    ["Rate, not vibe", "Distractions per hour is comparable across sessions, unlike a vague feeling of a bad day."],
    ["Triggers ranked", "The top three categories are sorted by count, each paired with one concrete countermeasure."],
    ["Cost made visible", "Estimated minutes lost — and effective study time remaining — are computed for every session."],
  ],
  faqs: [
    [
      "How do I find out what distracts me while studying?",
      "Keep a tally sheet during one real session and mark a stroke each time focus breaks, sorted into categories like phone, people, noise and mind-wandering. Enter the tallies here and the top three triggers are ranked automatically — most students find one category accounts for the majority of events.",
    ],
    [
      "How many distractions per hour is normal when studying?",
      "There is no official norm, but as a working rubric: under 2 interruptions per hour still allows 30-minute unbroken stretches suitable for deep work, while more than 12 means a break every 5 minutes and effectively no depth. This tool bands your rate on that scale.",
    ],
    [
      "How much time does one distraction actually cost?",
      "More than the interruption itself, because you also pay a refocusing cost to re-enter the problem. This tool defaults to a conservative 3 minutes per event; interruption research, such as Gloria Mark's workplace studies, found full recovery from major task switches can take over 20 minutes, so adjust the figure to your experience.",
    ],
    [
      "What is the fastest way to reduce phone distractions during study?",
      "Physical separation beats willpower: putting the phone in another room removes both notifications and the reflex check. Do Not Disturb plus out-of-sight placement typically eliminates the largest single distraction category students log.",
    ],
  ],
};

export default seo;
