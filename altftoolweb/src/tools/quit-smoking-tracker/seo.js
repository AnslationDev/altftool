const seo = {
  intro:
    "The Quit Smoking Tracker counts the time since your quit moment to the second, then turns your usual habit into three running totals: cigarettes not smoked, money kept, and life-time regained at the widely cited estimate of about 11 minutes per cigarette. It also unlocks eleven recovery milestones as you pass them, from 20 minutes when heart rate and blood pressure start dropping through to 15 years, and includes a 3-minute craving timer for the moment an urge hits. Everything is saved in your own browser, and it is general health information rather than medical advice - talk to a doctor or a quitline about medication and support.",
  useCases: [
    "You stopped three days ago, withdrawal is peaking, and you want to see the 72-hour milestone land and how many cigarettes you have already skipped.",
    "A craving hits at your usual smoking time, so you start the 3-minute timer, get a random distraction suggestion, and wait out the peak rather than deciding in the moment.",
    "You are saving toward something specific - a phone, a trip - and want the tracker to project the date your avoided spend reaches that amount at your current pack price.",
  ],
  benefits: [
    ["Milestones tied to your actual clock", "Eleven evidence-based recovery points from 20 minutes to 15 years unlock as your elapsed time passes them, with a progress bar to the next one."],
    ["Money math from your real prices", "Savings are built from pack cost divided by cigarettes per pack, times your daily count, so changing any of the three updates the totals and the goal date."],
    ["A craving plan, not just a counter", "The 3-minute timer, the four Ds, and a rotating list of distractions are there for the minutes when the numbers alone are not enough."],
  ],
  faqs: [
    [
      "How does it work out the time I have gained back?",
      "It multiplies the cigarettes you have avoided by 11 minutes, a commonly cited estimate of the life expectancy lost per cigarette. It is a population-level average used to make the total tangible, not a prediction about any individual.",
    ],
    [
      "How long does a cigarette craving actually last?",
      "Most cravings peak and fade within about 3 to 5 minutes whether or not you smoke, which is why the built-in timer runs for 3 minutes and chimes when it ends. The four Ds - delay, deep breathe, drink water, distract - are there to fill it.",
    ],
    [
      "What are the main milestones after quitting?",
      "The tracker follows the standard sequence: 20 minutes for heart rate and blood pressure, 12 hours for carbon monoxide clearing, 24 hours for heart attack risk starting to fall, 48 hours for taste and smell, 72 hours for easier breathing, 2 weeks to 3 months for circulation and lung function, then 1 year, 5 years, 10 years and 15 years for heart, stroke and cancer risk.",
    ],
    [
      "Is my quit date and spending saved if I close the tab?",
      "Yes - the quit timestamp, cigarettes per day, pack cost, pack size, goal and attempt count are written to your browser's local storage on this device. Nothing is sent to a server, so clearing site data or using another device starts a fresh tracker.",
    ],
  ],
};

export default seo;
