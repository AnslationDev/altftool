const seo = {
  intro:
    "The Potluck Dish Assigner takes your guest list with each person's dietary tags, the courses you need covered, and who has offered what, then returns a table showing every dish against the dietary needs it is not labelled for, plus a verdict naming any course still missing. It is for whoever ended up organising the shared meal and is trying to work out whether four people all bringing dessert leaves anyone with nothing they can eat. The check is tag-based: a dish only counts as covering 'vegan' or 'nut-free' if you have labelled it that way.",
  useCases: [
    "Twelve people are coming to a team lunch, the thread has produced six offers, and you need to see in one line that nobody has claimed a main course.",
    "One guest is vegan and another is nut-free, and you want a per-dish column showing exactly which of those needs each offered dish is not marked as meeting.",
    "You are chasing the last two people for offers and want a printable list of who is bringing what, in which course, so nobody arrives with a duplicate salad.",
  ],
  benefits: [
    [
      "Course gaps named, not implied",
      "The verdict either reads 'All entered courses covered' or lists the specific courses with no offer against them, so you know who to chase and for what.",
    ],
    [
      "Dietary needs matched per dish",
      "Every tag on the guest list is checked against each dish's own tags, and the review column lists the ones that dish does not claim to cover rather than giving a single pass/fail.",
    ],
    [
      "Unlabelled offers are flagged, not assumed safe",
      "A dish submitted with no dietary tags shows as 'Unlabelled', so a missing label never quietly reads as a dish that is fine for everyone.",
    ],
  ],
  faqs: [
    [
      "How do I enter the guest list and offers?",
      "One line per entry, pipe-separated. Guests are 'Person | dietary tags' — for example 'Chirag | vegan' — and offers are 'Person | dish | course | dietary tags', such as 'Asha | lentil salad | starter | vegan,nut-free'. Use 'none' for a guest with no restriction; it is ignored in the matching.",
    ],
    [
      "How does it decide a dish is safe for someone?",
      "It compares the set of dietary tags collected from all guests against the tags on each dish, and reports any guest-list tag the dish is not labelled with. It reads labels only — it does not know ingredients, so an unlabelled nut-free dish will show 'nut-free' as unreviewed.",
    ],
    [
      "Can it assign dishes to people automatically?",
      "It works from the offers you enter rather than allocating dishes for you, then shows which of your listed courses still have no offer. That keeps who-brings-what a human decision while making the gap obvious.",
    ],
    [
      "Is this safe to rely on for allergies?",
      "No — treat it strictly as a planning aid. It cannot verify ingredients, cross-contact in a shared kitchen, preparation, storage, transport or labelling, and anyone with a serious allergy or a medical dietary requirement should confirm details directly with the person cooking and follow their own medical advice.",
    ],
  ],
};

export default seo;
