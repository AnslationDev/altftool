const seo = {
  title: "Guest Room Checklist With Towel and Linen Counts",
  metaDescription:
    "Enter adults, children and nights: towels are counted on a three-night change, linen on four nights, water at 2.5 litres per person per day.",
  steps: [
    "Set Adults, Children, Nights they stay and Season, then tick the ones that apply — Private bathroom, An elderly guest, Bringing a pet.",
    "Read the quantities it derives: Bath towels to set out, Hand towels, Bed linen sets, Toilet rolls, Drinking water in litres and Hangers.",
    "Tick each item off as you prepare the room, then press Copy result to paste the whole checklist as text.",
  ],
  intro:
    "This generator builds a guest room checklist with real quantities rather than a generic list of nouns. Towels are counted on a three-night change interval and bed linen on a four-night one, the intervals used in ordinary housekeeping, so towels come out as guests × ceil(nights ÷ 3) and linen sets as beds × ceil(nights ÷ 4). Toilet rolls assume one roll per person per four days and drinking water 2.5 litres per person per day. Season, a shared bathroom, an infant, an elderly guest, a working guest or a pet each add their own items.",
  useCases: [
    "Prepare a room for in-laws staying a week without discovering on day four that there are no clean towels.",
    "Work out exactly how many towels and linen sets to wash before a family visit.",
    "Hand a house-help or family member a printable list of what the guest room still needs.",
  ],
  benefits: [
    ["Quantities, not just items", "Every line carries a number worked out from the guest count and the length of stay."],
    ["Adapts to the guests", "An infant, an elderly guest, a shared bathroom or a monsoon arrival each change the list."],
    ["Tick as you go", "Check items off in the browser and copy the whole list as text for anyone helping."],
  ],
  faqs: [
    [
      "How many towels should I put out for a guest?",
      "One bath towel and one hand towel per guest, replaced every third night. For three guests staying four nights that is six bath towels and six hand towels in total — two sets each — which is why a single set per person runs out halfway through a longer stay.",
    ],
    [
      "How often should guest bed sheets be changed?",
      "Every fourth night is the usual interval, so a week-long stay needs two linen sets per bed. Change them sooner if a guest is unwell, and always start the stay on freshly laundered sheets rather than ones that have been sitting made up for weeks.",
    ],
    [
      "What should always be in a guest room?",
      "Drinking water and a glass at the bedside, a free charging point, a working bedside lamp with a switch the guest can reach, hangers and an empty shelf, and the Wi-Fi password written down. Those five cover the things guests most often need and are least likely to ask for.",
    ],
    [
      "How much drinking water should I leave in a guest room?",
      "Around 2.5 litres per person per day as a base — so two guests staying two nights need roughly 10 litres available, not one bottle. Raise that in summer or if the room has no easy access to a kitchen at night.",
    ],
  ],
};

export default seo;
