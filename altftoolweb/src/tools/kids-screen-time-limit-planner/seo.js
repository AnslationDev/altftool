const seo = {
  title: "Kids' Screen Time Limits by Age, from WHO",
  metaDescription:
    "Turns a child's age into a daily recreational screen budget from WHO and AAP guidance, split by purpose, with sleep and screens-off checks.",
  steps: [
    "Under The day, set Child's age (years) from 0 to 17, School or childcare (hours), Wake time, Bedtime, Physical activity planned (min) and Daytime naps, if any (min).",
    "Under Screen minutes by purpose, enter Shows and video (min), Games (min) and Social and chat (min), plus Homework / study on a screen (min) and Video calls with family (min), which are tracked outside the recreational cap.",
    "Read Recreational screen time today against the guideline for that age, then the Screens off by time, the sleep window and activity rows, and A suggested split of the allowance, and press Copy plan.",
  ],
  intro:
    "Kids Screen Time Limit Planner converts a child's age into a daily recreational screen budget and splits that budget across shows, games and social use, while counting homework screens and family video calls separately. The limits come from WHO's under-5 guidance (no screen time below 2 years, up to 1 hour for ages 2-4), the AAP's 1-hour recommendation for ages 2-5, and the Canadian 24-Hour Movement Guidelines' 2-hour recreational ceiling, which this planner applies from age 6 onward since the AAP figure already covers age 5. It also tests the day against sleep ranges from the American Academy of Sleep Medicine — including a field for daytime naps, since the youngest bands' sleep targets assume naps are part of the total — and WHO physical activity targets, so a parent can see whether the plan still leaves room for sleep, movement and free play.",
  useCases: [
    "Agree a written screen deal with a 9-year-old before term starts, showing exactly how the 2 hours split between video, games and messaging.",
    "Check whether a 4-year-old's tablet routine fits inside the WHO 1-hour ceiling once shared cartoon time and grandparent video calls are separated out.",
    "Work out how late a teenager can game and still reach the 8-10 hours of sleep recommended for 13-17 year olds.",
    "Send a co-parent or grandparent one shareable summary of the agreed daily limits and the screens-off time.",
  ],
  benefits: [
    [
      "Purpose-aware budget",
      "Homework and live video calls sit outside the recreational cap, the way AAP guidance frames them.",
    ],
    [
      "Whole-day view",
      "Sleep window, activity minutes and remaining free time are checked alongside the screen total, not in isolation.",
    ],
    [
      "Wind-down time calculated",
      "Gives the exact clock time screens should go off to leave a 60-minute buffer before bed.",
    ],
  ],
  faqs: [
    [
      "How much screen time should a child have per day?",
      "WHO advises no screen time below 2 years and no more than 1 hour a day for ages 2-4; the AAP uses the same 1-hour figure for ages 2-5, and the Canadian 24-Hour Movement Guidelines cap recreational screen time at 2 hours a day, officially for ages 5-17. Because the AAP and Canadian guidelines overlap at age 5, this planner uses the AAP's 1-hour figure through age 5 and switches to the Canadian 2-hour cap from age 6 onward. Homework and video chatting with relatives are normally counted separately from that recreational limit.",
    ],
    [
      "Does homework on a laptop count as screen time?",
      "No — these guidelines target recreational entertainment screen time, so schoolwork is tracked separately here. It still adds to total sitting time, so pair long homework sessions with movement breaks rather than borrowing from the recreational allowance.",
    ],
    [
      "Why should screens go off an hour before bed?",
      "Evening screen use delays sleep onset through both light exposure and mental stimulation, which is why the AAP recommends a media curfew and keeping devices out of the bedroom. This planner subtracts 60 minutes from the bedtime you enter to give a concrete screens-off time.",
    ],
    [
      "Is video calling grandparents bad for a toddler?",
      "No. The AAP explicitly exempts live video-chatting from the under-18-month restriction because it is interactive and usually supported by an adult, which is why video calls sit outside the recreational cap here. Passive background video is the thing to limit.",
    ],
  ],
};

export default seo;
