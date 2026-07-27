const seo = {
  intro:
    "A washing machine's kg rating is the maximum weight of dry laundry it can wash in one cycle, so this selector works backwards from that definition: it adds up your household's weekly laundry from typical dry garment weights (a shirt 0.2 kg, jeans 0.7 kg, a double sheet 0.8 kg), divides by the number of washes you want to run, then divides again by a 0.85 fill factor because a drum packed to its rating cannot tumble. The result is matched to capacities actually sold, from 6 kg to 12 kg. It is aimed at anyone choosing between a 6.5 kg and an 8 kg machine without guessing.",
  useCases: [
    "Decide whether a couple who washes twice a week really needs an 8 kg machine or a 6.5 kg one.",
    "Size a machine for a family of four that also washes bed linen for two beds every week.",
    "Check what capacity is needed before buying if you wash double quilts at home instead of sending them out.",
  ],
  benefits: [
    ["Built from garment weights", "Uses real dry weights rather than a vague family-size lookup table."],
    ["Accounts for the fill factor", "Shows the usable load, not just the number on the badge."],
    ["Linen and bulky items included", "Bed changeovers and double quilts are sized separately because they drive drum volume."],
  ],
  faqs: [
    [
      "What size washing machine do I need for a family of 4?",
      "Around 7 to 8 kg for most families of four washing three times a week. That household generates roughly 18 kg of dry laundry a week, which is about 6 kg a wash, and a 7 to 7.5 kg drum carries that with room to tumble.",
    ],
    [
      "Is 6.5 kg enough for a couple?",
      "Yes, for two adults washing twice a week including one bed's linen — that works out to about 5.2 kg a load, which a 6.5 kg drum handles comfortably. Move to 8 kg if you wash only once a week or put double quilts in the machine.",
    ],
    [
      "Does the kg rating mean dry or wet clothes?",
      "Dry. Manufacturers rate capacity as the weight of dry laundry loaded before the cycle starts; the same load can weigh two to three times more once soaked. Weigh clothes dry if you want to check what actually fits.",
    ],
    [
      "Should I fill the washing machine to its full rated capacity?",
      "No — leave roughly a hand's width of space above the load, about 85% of the rating. A packed drum stops the clothes moving through the water, so detergent does not circulate and the spin comes out unbalanced. Running consistently under half full wastes water and energy instead.",
    ],
  ],
};

export default seo;
