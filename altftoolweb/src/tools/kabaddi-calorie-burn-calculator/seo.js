const seo = {
  intro:
    "The Kabaddi Calorie Burn Calculator estimates the energy cost of raiding, defending or playing all-rounder from your body weight and the minutes you actually spent on the mat, using the MET equation kcal/min = MET x 3.5 x kg / 200. Because the Compendium of Physical Activities has no kabaddi entry, each role is anchored to a listed sport with the same sprint-and-grapple demand — competitive rugby union at 8.3 METs, touch rugby at 6.3 and wrestling at 6.0 — and the tool states which anchor it used. It is built for players and coaches sizing up the load of a standard two-by-twenty-minute match.",
  useCases: [
    "Estimate what a full 40-minute match costs a 75 kg raider compared with a defender of the same weight.",
    "Add up a tournament day of three matches plus the minutes spent sitting out after being declared out.",
    "Compare an hour of practice drills and holds against the intensity of competitive match play.",
    "Give a school or college squad a shared basis for planning post-match refuelling.",
  ],
  benefits: [
    ["Role-specific", "Raiders, defenders and all-rounders get different intensities instead of one blanket value."],
    ["Honest about sourcing", "Every MET value names the published sport it is borrowed from, since kabaddi has none."],
    ["Bench time counted", "Minutes spent out of play are priced at the 1.3 MET standing rate, not the match rate."],
  ],
  faqs: [
    [
      "How many calories does a kabaddi match burn?",
      "Roughly 440 kcal for a 75 kg raider across a standard match of two 20-minute halves plus the interval, using an 8.3 MET intensity borrowed from competitive rugby union. A defender at the same weight lands nearer 385 kcal for the same mat time.",
    ],
    [
      "Do raiders burn more calories than defenders in kabaddi?",
      "Yes. A raid is a repeated maximal sprint into contact with a hold and escape, while defenders spend more time in a set position before an explosive few seconds, so raiding is modelled about 15% higher — 8.3 METs against 7.2.",
    ],
    [
      "How long is a kabaddi match?",
      "Standard senior kabaddi is two halves of 20 minutes with a five-minute interval, so 40 minutes of playing time. Youth and some school formats use shorter halves, so enter your own mat time rather than assuming 40 minutes.",
    ],
    [
      "Why does this calculator borrow MET values from other sports?",
      "The Compendium of Physical Activities, the standard reference for activity energy costs, does not list kabaddi. Inventing a number would be worse than borrowing a transparent one, so each role uses a named entry for a sport with the same movement pattern and says so on screen. Treat the output as an informational range.",
    ],
  ],
};

export default seo;
