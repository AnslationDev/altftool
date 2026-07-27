const seo = {
  intro:
    "Scores every half-hour of daylight on a beach against the four things that do not peak at the same moment: UV, which is highest at solar noon — the exact midpoint of sunrise and sunset, not 12:00 on the clock; air temperature, which lags the sun by roughly two to three hours; crowds, which peak just after midday; and the tide, projected from one known high water on the semidiurnal interval of 12 hours 25 minutes and interpolated with the rule of twelfths. The result is the best continuous window for the length of visit you want.",
  useCases: [
    "Choosing between a morning and an afternoon beach trip when low tide and the crowd peak fall at different times",
    "Timing a rock-pooling walk for the hour either side of low water rather than guessing",
    "Planning a family beach day that avoids the strongest UV without wasting the whole afternoon",
  ],
  benefits: [
    ["Solar noon, not clock noon", "UV is centred on the true midpoint of sunrise and sunset, which can be an hour or more off 12:00."],
    ["Tides by the standard rule", "Projects high and low water on the 12 h 25 min interval and interpolates with the rule of twelfths."],
    ["Heat lag handled separately", "The hottest air arrives well after the strongest sun, so the two effects are scored at their own peaks."],
  ],
  faqs: [
    [
      "What time is the tide lowest?",
      "About 6 hours 12 minutes after high water on a semidiurnal coast, because successive high waters are 12 hours 25 minutes apart — the tide follows the 24 hour 50 minute lunar day, not the solar one. That also means the tide shifts roughly 50 minutes later each day, so yesterday's timing is not today's.",
    ],
    [
      "What is the rule of twelfths?",
      "A navigational approximation for how far the tide has moved between low and high water: over the six hours of a tide the range is covered 1/12, 2/12, 3/12, 3/12, 2/12 and 1/12 in successive hours. The water barely moves in the first and last hour and moves fastest in the middle two, which is why a sandbank can cut off far quicker than people expect around mid-tide.",
    ],
    [
      "When is UV strongest at the beach?",
      "At solar noon, the midpoint between sunrise and sunset, with the strongest band running roughly three hours either side. WHO and WMO guidance under the Global Solar UV Index is that protection is needed from UV Index 3 upwards and that midday exposure should be limited. The shadow rule is the practical version: if your shadow is shorter than you are, the sun is above 45 degrees and UV is high. Sand and water both reflect UV, so shade alone is not full protection.",
    ],
    [
      "Why is the afternoon hotter than midday?",
      "Because the ground keeps releasing heat after the sun's peak. Solar radiation is strongest at solar noon, but air temperature carries on rising while incoming energy still exceeds what the surface radiates away, so the hottest part of the day usually falls two to three hours later. That is why mid-afternoon can feel worse than midday even though the UV has already started to drop.",
    ],
  ],
};

export default seo;
