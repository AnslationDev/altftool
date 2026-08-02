const seo = {
  intro:
    "This planner works backwards from a flight's scheduled departure at Jaipur International Airport (JAI) to the minute you should leave home, allowing for how Jaipur traffic changes by hour of day. It applies three separate cutoffs — the check-in and bag-drop close, the boarding gate close, and the airline's 2-hour domestic or 3-hour international arrival advice — and then adds the terminal-side queue for entry, bag drop, security, emigration and the walk to the gate. The drive itself is simulated minute by minute across the city's morning and evening peaks rather than being taken as a flat average.",
  useCases: [
    "A 06:20 IndiGo departure with a checked bag from a hotel on MI Road, where the drive is quick at 03:30 but the counters shut at 05:35.",
    "An evening international flight from a resort on Delhi Road at Kukas, when the run into Sanganer crosses the whole of Jaipur's 18:00-20:30 peak.",
    "Deciding whether an auto-rickshaw or a pre-booked car is safe for a first-bank departure when the forecast is for heavy monsoon rain.",
  ],
  benefits: [
    [
      "Traffic by the hour, not an average",
      "The drive is simulated minute by minute, so only the part that falls inside the peak is charged at peak speed.",
    ],
    [
      "Three cutoffs, not one",
      "Shows which of the check-in close, gate close or arrival advice is actually binding on your flight.",
    ],
    [
      "A last-chance time as well as a plan",
      "Alongside the recommended departure you get the latest possible one, so you know exactly how much slack you are holding.",
    ],
  ],
  faqs: [
    [
      "How early should I reach Jaipur airport?",
      "Two hours before a domestic departure and three hours before an international one is the standard airline advice. Counter-intuitively, that arrival-advice window is usually the figure that actually decides your departure here, not the check-in close: 120 or 180 minutes before departure is simply a bigger number than check-in-close-plus-processing-time or gate-close-plus-processing-time comes to at JAI, so the advice window ends up the tighter, binding cutoff in practice. The planner works out all three cutoffs for your specific flight and tells you which one is genuinely binding.",
    ],
    [
      "How long does it take to get to Jaipur airport from the city centre?",
      "From MI Road or C-Scheme it is about 13 km, which runs in roughly 25-30 minutes on empty early-morning roads and can take 45 minutes or more in the 18:00-20:30 evening peak. Amer and the Delhi Road resorts at Kukas are 23-31 km out and should be treated as an hour-plus transfer in daylight.",
    ],
    [
      "Does the Jaipur Metro go to the airport?",
      "No. The Jaipur Metro's Pink Line runs between Mansarovar and the walled city and does not serve Sanganer or the airport, so every route to JAI is by road — app cab, auto-rickshaw, hotel car, own car or a city bus.",
    ],
    [
      "What time does the boarding gate close at Jaipur airport?",
      "Indian carriers generally close the gate 25 minutes before scheduled departure, with boarding starting around 40 minutes before on a domestic flight. Clearing the terminal entry check, bag drop, security and the walk to the gate takes roughly 40 minutes when nothing goes wrong, which is why the planner works the gate cutoff back to a kerbside arrival time rather than treating airside as safe.",
    ],
  ],
};

export default seo;
