const seo = {
  intro:
    "The Oven Temperature Converter links Celsius, Fahrenheit, fan/convection Celsius and British gas marks in one live set of fields, using °F = °C × 9/5 + 32, fan °C = conventional °C − 20, and gas mark = (°F − 250) / 25 for marks 1 and above. Type into any box and the other three update, along with the heat zone the setting falls in and what that zone is good for. It is for anyone cooking from recipes written for a different country's oven.",
  useCases: [
    "You are following an American recipe that says 375°F and your dial is in Celsius, and you want the conventional and fan numbers before the butter softens.",
    "An old British cookbook calls for gas mark 6 and you have an electric fan oven, so you need both the conventional equivalent and the reduced fan setting.",
    "You are adapting a conventional recipe to a fan oven and want to confirm the drop is 20°C — and check whether the recipe already assumed fan-forced.",
  ],
  benefits: [
    ["All four scales stay in sync", "Celsius, Fahrenheit, fan Celsius and gas mark update together from whichever field you edit, so there is no chain of separate conversions to get wrong."],
    ["Tells you what the setting is for", "Every result is placed in a named heat zone — from very cool at 100–119°C to extremely hot at 230°C and above — with the foods that zone suits."],
    ["Honest about gas marks", "Gas dials have no in-between positions, so the nearest mark is shown and flagged as approximate rather than pretending 187°C has a mark of its own."],
  ],
  faqs: [
    [
      "What is 180°C in Fahrenheit and gas mark?",
      "180°C is 350°F and gas mark 4 — the standard moderate setting for most cakes and everyday baking. On a fan oven use 160°C for the same result.",
    ],
    [
      "How much do I reduce the temperature for a fan oven?",
      "Drop the conventional temperature by 20°C. Fan ovens circulate air, so they cook faster at the same dial number; also start checking 5–10 minutes before the stated time. If the recipe already says fan-forced or convection, its number is the reduced one — do not subtract again.",
    ],
    [
      "How does the gas mark scale work?",
      "Gas mark 1 is 275°F and each mark above it adds 25°F, so mark 4 is 350°F and mark 9 is 475°F. Below mark 1 there are gas ¼ (225°F) and gas ½ (250°F) for very cool settings such as meringues and slow drying.",
    ],
    [
      "Why do recipes say 180°C when gas mark 4 is really 176.7°C?",
      "Because 350°F converts to 176.7°C, and cookbooks round to the 10°C steps that oven dials actually offer. The difference is smaller than the error in most home ovens, which commonly run 10–20°C off — an oven thermometer on the middle shelf is worth more than the extra decimal place.",
    ],
  ],
};

export default seo;
