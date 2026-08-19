const seo = {
  title: "Marksheet Percentage Calculator & Visualizer",
  metaDescription:
    "Enter subject-wise marks to get the correct mark-weighted overall percentage, bars per subject, strongest and weakest subjects and Indian division bands.",
  steps: [
    "Fill in each Subject with its Obtained marks and the Out of maximum - five rows (Mathematics to Hindi) are preloaded, and Add subject or the remove button changes the list.",
    "The visualizer draws a percentage bar per subject, painting anything under the 33% pass mark red, and computes the mark-weighted Overall percentage as total obtained over total maximum.",
    "Read Strongest subject, Weakest subject and the Spread (standard deviation), check the Division bands used table (Distinction 75%, First division 60%, Pass 33%), then press Copy result for a text summary.",
  ],
  intro:
    "This visualizer converts subject-wise marks into percentage bars and a mark-weighted overall percentage (total obtained ÷ total maximum × 100), instantly showing your strongest subject, weakest subject and how evenly performance is spread. It applies the standard Indian division bands — 75% distinction, 60% first division, 50% second division, 33% pass — and is built for students and parents reading a board, school or semester marksheet.",
  useCases: [
    "A class 10 student turning five subject scores into a bar chart to decide which subject needs the most revision time",
    "A parent checking whether a marksheet's overall percentage crosses the 60% first-division line",
    "A semester student with different maximum marks per paper computing the correct mark-weighted overall percentage instead of averaging subject percentages",
  ],
  benefits: [
    ["Correct overall percentage", "Uses total obtained ÷ total maximum, which is right even when subjects have different maximum marks."],
    ["Strengths and weaknesses at a glance", "Bars plus a standard-deviation spread figure show whether performance is even or lopsided."],
    ["Standard division bands", "Distinction, first, second and pass thresholds are applied to every subject and the overall score."],
  ],
  faqs: [
    [
      "How do I calculate overall percentage from a marksheet?",
      "Divide total marks obtained by total maximum marks and multiply by 100. Do not average the subject percentages — that gives a wrong answer whenever subjects carry different maximum marks, because it ignores each subject's weight.",
    ],
    [
      "What percentage is a first division in India?",
      "60% or more is the long-standing first-division threshold in Indian boards and universities, with 75% commonly treated as distinction, 50% as second division and 33% as the pass mark. Individual boards can differ, so check your board's official rule for certificates.",
    ],
    [
      "What is the pass mark in CBSE?",
      "33% is the standard CBSE pass criterion in class 10 and 12, applied to each subject (theory and internal components per the year's scheme). State boards vary — some use 35% — so verify with your own board's current examination bye-laws.",
    ],
    [
      "How do I identify my weakest subject from marks?",
      "Compare subject percentages, not raw marks — 60/80 (75%) is stronger than 65/100 (65%) even though the raw mark is lower. This tool computes each subject's percentage, flags the lowest, and shows the spread so you can see whether one subject is dragging the total or performance is uniformly moderate.",
    ],
  ],
};

export default seo;
