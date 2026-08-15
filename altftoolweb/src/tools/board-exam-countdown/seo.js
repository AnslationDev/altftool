const seo = {
  title: "Board Exam Countdown with Free Study Days Between Papers",
  metaDescription:
    "Enter your Class 10 or 12 datesheet to see days to each paper, free study days between papers, and the theory marks a target percentage demands.",
  steps: [
    "Pick your \"Class and stream\" preset and set each paper's date under \"Paper dates from your datesheet\" — clear a date to leave that paper out.",
    "Set \"Study hours on a free day\", and optionally a Subject, \"Target overall percentage\" and the internal or practical marks secured.",
    "Read \"Days to the first paper\", the Datesheet view's free days and study hours before each paper, and the theory marks needed, then click \"Copy result\".",
  ],
  intro:
    "This countdown turns a Class 10 or Class 12 board datesheet into the numbers that matter: days to each paper and the free study days sitting between papers, counting out the exam days themselves. It is built for CBSE and state-board students planning a paper-by-paper revision schedule, and it also inverts the percentage formula to show the theory marks a target percentage demands once internal or practical marks are locked in, against the 33% pass requirement.",
  useCases: [
    "A Class 12 science student mapping how many free days sit between the Physics and Chemistry papers on the CBSE datesheet",
    "A Class 10 student converting free days into study hours to decide which subject gets the biggest gap",
    "A student with 18/20 internals checking what theory score a 90% overall target requires in each subject",
  ],
  benefits: [
    ["Gap-wise, not just day-wise", "Shows free study days before every paper, because the datesheet — not the total countdown — decides your revision order."],
    ["Marks target inverted", "Computes the theory marks needed for any overall percentage after internals, and flags targets that full theory marks cannot reach."],
    ["Any board's datesheet", "Papers, dates and the theory-internal split are all editable, so state-board schemes fit as well as CBSE's 80+20 and 70+30."],
  ],
  faqs: [
    [
      "How are free study days between board exam papers calculated?",
      "Free days before a paper are the days between the previous paper and this one, minus one — the day of the previous paper is spent writing it and the exam day itself is not a study day. For the first paper still ahead, every day from today up to the paper counts. A five-day gap between two papers therefore gives four free study days.",
    ],
    [
      "What is the passing mark in CBSE board exams?",
      "33% is the passing requirement in CBSE board exams. In subjects with a practical or internal component, a candidate must score 33% in the theory paper and the practical separately as well as in the aggregate. This tool shows the theory marks that 33% works out to for each subject's split.",
    ],
    [
      "How much time do you get in a CBSE board exam paper?",
      "A standard CBSE theory paper runs 3 hours (180 minutes), preceded by 15 minutes of reading time during which candidates may read the question paper but not write in the answer book. Some shorter papers run 2 hours — the datesheet and question paper state the duration for each subject.",
    ],
    [
      "How do I calculate the marks I need in theory to get 90% overall?",
      "Multiply the target percentage by the subject's total marks, then subtract the internal or practical marks already secured. In an 80+20 subject with 18/20 internals, 90% overall means 90 marks, so 90 − 18 = 72 of 80 in theory. If the answer exceeds the theory maximum, the target is arithmetically out of reach in that subject — this tool flags that instead of showing an impossible number.",
    ],
  ],
};

export default seo;
