const seo = {
  title: "Sleep CSV Analyzer for Oura, Whoop and Fitbit Exports",
  metaDescription:
    "Paste one night per line — date, sleep minutes, efficiency, resting HR, HRV — for averages plus each night's sleep measured against your own mean.",
  intro:
    "Wearable Sleep CSV Analyzer turns exported sleep rows — date, sleep minutes, efficiency percent, resting heart rate and HRV, one night per line — into a mean for each column plus a per-night table showing how far that night's sleep sat above or below your own average in minutes. It is for people who already track with an Oura ring, a Whoop strap or a Fitbit and want the numbers compared against themselves rather than against an app's badge. The output is a personal trend summary, not a clinical reading.",
  useCases: [
    "You cut caffeine after 2pm for two weeks and want to see whether the mean sleep duration and efficiency across those nights actually moved",
    "A block of hard training left you flat, so you line up resting heart rate and HRV against the nights you slept least to see whether they track together",
    "You are switching devices and want one place to compare a month of Oura rows against a month of Fitbit rows on the same five columns",
  ],
  benefits: [
    [
      "Every night measured against your own mean",
      "The table's last column is that night's sleep minus the average of all the nights you entered, so a bad night is expressed as a deficit in minutes rather than a vague score.",
    ],
    [
      "Device-neutral input",
      "It takes five plain pipe-separated values, so rows from any tracker — or from a paper log — can be compared side by side without matching one vendor's export schema.",
    ],
    [
      "Four averages at once",
      "Duration, efficiency, resting heart rate and HRV are summarised together, which is where the useful pattern usually lives — short nights that also show a raised resting HR read differently from short nights that do not.",
    ],
  ],
  faqs: [
    [
      "What format do the rows need to be in?",
      "One night per line as: date | sleep minutes | efficiency % | resting HR | HRV, separated by the pipe character — for example 2026-07-20 | 420 | 85 | 72 | 55. Any line where the four numeric fields are not all valid numbers is skipped, and sleep is entered in minutes, then reported back in hours.",
    ],
    [
      "What is sleep efficiency and what number is normal?",
      "Sleep efficiency is time actually asleep divided by time in bed, expressed as a percentage; sleep research commonly treats around 85% or above as the rough marker of consolidated sleep, and repeated low values are one of the signs used when screening for insomnia. Trackers estimate it from movement and heart-rate signals rather than measuring sleep directly, so treat the figure as a trend indicator and discuss persistent problems with a clinician.",
    ],
    [
      "What does the baseline nights setting do?",
      "It records the number of nights you consider your personal reference window — 7 by default, minimum 2 — and is carried into the summary alongside the averages. The averages themselves are computed across every valid row you paste in, so paste only the window you want summarised.",
    ],
    [
      "Can this tell me if I have a sleep disorder?",
      "No. It arithmetically summarises numbers you paste in and cannot diagnose anything; wearable sleep staging in particular disagrees with polysomnography often enough that it is not used clinically. Persistent short sleep, loud snoring with pauses, daytime sleepiness, or sudden changes in resting heart rate are reasons to see a doctor or sleep specialist.",
    ],
  ],
};

export default seo;
