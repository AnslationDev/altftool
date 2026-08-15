const seo = {
  title: "Leh Ladakh Trip Budget: Per Person and Per Day Cost",
  metaDescription:
    "Costs the taxi per vehicle, not per head, separates rest days from touring days, and adds the Inner Line Permit levies. Splits by person and by day.",
  steps: [
    "Pick 'Travel style (sets the starting rates)' — Backpacker, Comfort or Premium — plus 'How you get around' and 'Season (moves the room rate)'.",
    "Enter 'Travellers', 'Nights in Ladakh' and 'Of those days, rest days in Leh'; taxis are charged per vehicle by seat count and rest days carry no vehicle.",
    "Read the Group, Per person and Share columns with 'Vehicle cost per head per touring day' and 'Permits and levies', then press 'Copy result'.",
  ],
  intro:
    "This planner costs a Leh Ladakh trip the way Ladakh actually bills it: the taxi is charged per vehicle at ceil(travellers ÷ seats) × touring days × day rate rather than per head, acclimatisation days are separated from touring days so a rest day is not charged a vehicle, and the Inner Line Permit levies appear as their own line. Rooms are billed for nights while food is billed for nights + 1 days, and the season factor moves only the room rate, which is the line Ladakh reprices between the June-to-August peak and the shoulder months.",
  useCases: [
    "Splitting a taxi fairly among four friends, and seeing exactly what the same itinerary costs if only two go.",
    "Pricing the two rest days in Leh that most itineraries need before Khardung La or Pangong.",
    "Comparing a rented Royal Enfield against a private SUV with driver over the same number of touring days.",
  ],
  benefits: [
    ["Vehicle charged per vehicle", "The single biggest modelling error in Ladakh budgets, fixed — seats decide the cost per head."],
    ["Rest days priced separately", "Acclimatisation days cost a room and food but no taxi, so they show their real cost."],
    ["Permit levies included", "One-time environmental fee plus the per-person-per-day levy, both editable."],
  ],
  faqs: [
    [
      "How much does a Leh Ladakh trip cost per person?",
      "On the comfort defaults here — a Leh hotel shared two-up in peak season, a private SUV with driver for five touring days, Nubra and Pangong, and two rest days — a seven-day trip works out near ₹80,000 per person including a return Delhi–Leh airfare, permits and a 12% buffer. A guesthouse-and-shared-taxi version lands closer to ₹44,000 per person; a luxury-camp version runs past ₹1.4 lakh. The vehicle is the swing factor: it is charged for the car, so doubling the group roughly halves that line per head.",
    ],
    [
      "Do I need a permit for Ladakh, and what does it cost?",
      "Indian travellers need an Inner Line Permit for the protected areas — Nubra, Pangong, Tso Moriri, Dah-Hanu and the Changthang — applied for online through the Leh district administration or through your taxi operator; foreign nationals need a Protected Area Permit instead. The charge is a one-time environmental fee per visitor plus a small per-person-per-day wildlife and Red Cross levy, both collected when the permit is issued. The hill council revises the amounts, so confirm them on the official permit portal before you budget.",
    ],
    [
      "How many days should I spend acclimatising in Leh?",
      "The standard advice is at least two full days resting in Leh, which sits at roughly 3,500 m, before crossing anything higher — Khardung La and Chang La are both above 5,300 m. Flying straight in and driving to Pangong the next morning is the most common way people end up with acute mountain sickness. This is general information rather than medical advice: talk to a doctor about altitude illness and any medication before you go, particularly if you have heart or lung conditions or are travelling with children.",
    ],
    [
      "Is it cheaper to fly to Leh or drive from Manali or Srinagar?",
      "The road is cheaper in fares and far more expensive in days. The Manali and Srinagar highways are normally open only from about late May to October and each takes two days each way with an overnight stop, so four extra days of food, stay and vehicle usually outweigh the airfare saved unless you were going to make the drive the point of the trip. Flying also skips the gradual altitude gain, which is exactly why fliers need the rest days built in.",
    ],
  ],
};

export default seo;
