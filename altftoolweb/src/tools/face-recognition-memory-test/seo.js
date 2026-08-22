const seo = {
  title: "Face Recognition Memory Test: Old/New Score",
  metaDescription:
    "Study faces, sit a 15-second distraction task, then mark each face seen or not. Scored as hits, misses, false alarms and correct rejections.",
  steps: [
    "Under Choose Difficulty pick Beginner (10 faces), Intermediate (20 faces) or Expert (40 faces), then press Start Memory Test.",
    "Press Begin Challenge, memorise the Study These Faces grid before the countdown ends, then tap the named colour through the 15-second Distraction Game.",
    "Answer each face with Yes, I saw or No, I didn't; the result gives accuracy plus hits, misses, false alarms and correct rejections.",
  ],
  intro:
    "The Face Recognition Memory Test runs the classic old/new recognition paradigm used in memory research: you study a set of faces for a timed period, sit through a 15-second colour-matching distraction task to clear working memory, then judge one face at a time as seen or not seen. Your answers are scored as hits, misses, false alarms and correct rejections, and overall accuracy is the share of correct calls across the whole test — 85% or above is graded Excellent, 70% Good and 55% Average. Three levels set how much you have to hold: 10 faces studied for 20 seconds at Beginner, 20 faces in 20 seconds at Intermediate, and a longer set at Expert.",
  useCases: [
    "You keep blanking on people's faces at work events and want to know whether you are genuinely poor at it or just not paying attention when you meet them.",
    "You want a repeatable drill before a conference where you will meet fifty people in two days, and a score you can compare across sessions.",
    "You are curious whether your errors are misses or false alarms — forgetting real faces versus 'recognising' strangers — because the two point at different habits.",
  ],
  benefits: [
    ["Scored the way memory studies score it", "Results split into hits, misses, false alarms and correct rejections, so you learn the shape of your errors rather than a single pass/fail number."],
    ["A real interference gap", "A 15-second colour task sits between study and test, so you are recalling from memory rather than reading answers off a still-fresh screen."],
    ["Timed responses", "Each judgement is timed to a tenth of a second and capped at 10 seconds, which shows whether your accuracy is fast recognition or slow deliberation."],
  ],
  faqs: [
    [
      "How is the score calculated?",
      "Accuracy is (hits + correct rejections) divided by the total number of faces shown, as a percentage. Grades break at 85% for Excellent, 70% for Good and 55% for Average; below 55% is graded Below Average.",
    ],
    [
      "What is the difference between a miss and a false alarm?",
      "A miss is a face you studied but marked as new; a false alarm is a face you never saw but marked as seen. Lots of false alarms usually mean you are matching on a general impression, while lots of misses mean the faces were not encoded well in the first place.",
    ],
    [
      "How long does the test take?",
      "Roughly two minutes at Beginner and three at Intermediate. That covers the study window, the fixed 15-second distraction task and the judgement round, which shows the faces you studied mixed with an equal number you have not seen.",
    ],
    [
      "Can this diagnose face blindness?",
      "No. Prosopagnosia is diagnosed with validated instruments such as the Cambridge Face Memory Test administered by a clinician, and a low score here can equally come from tiredness, a rushed study phase or unfamiliarity with the task. If you genuinely cannot recognise close family or colleagues, speak to a doctor or neuropsychologist.",
    ],
  ],
};

export default seo;
