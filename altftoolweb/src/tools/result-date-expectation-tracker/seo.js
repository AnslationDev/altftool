const seo = {
  intro:
    "This tracker projects when an exam result is realistically due by adding the minimum, median and maximum exam-to-result gaps from past cycles to this cycle's exam date. The median is used for the 'most likely' date because it resists a single delayed outlier year. It is for aspirants tired of refreshing result pages — the tracker says whether today is before, inside or past the historically expected window.",
  useCases: [
    "An SSC aspirant enters the last three cycles' exam-to-result gaps and learns the window has not even opened yet",
    "A banking candidate sees today is past the historical latest date and knows a delay announcement or court matter is worth checking for",
    "A parent tracking a board result gets one likely date to plan admission-form logistics around instead of daily rumours",
  ],
  benefits: [
    ["Window, not a guess", "Earliest, most likely and latest dates computed from real past gaps you supply."],
    ["Outlier-resistant", "The likely date uses the median gap, so one delayed cycle does not distort it."],
    ["Refresh-rationality check", "Tells you plainly whether checking the result page today makes sense."],
  ],
  faqs: [
    [
      "How do I find the past exam-to-result gaps for my exam?",
      "Look up the exam date and result-declaration date for each of the last two or three cycles (both are usually in the body's press releases or archived notices) and subtract: result date minus exam date, in days. Enter those numbers, comma-separated, and the tracker builds the window.",
    ],
    [
      "How accurate is a result window projected from past cycles?",
      "It is a historical pattern, not a promise — most cycles land inside their past min-max range, but litigation, re-exams and normalisation disputes can blow past it. Treat the window as a planning aid and the official website as the only authority.",
    ],
    [
      "Why does the tool use the median gap instead of the average?",
      "Because one abnormal cycle skews an average badly: gaps of 30, 32 and 90 days average to 51 while the median stays 32, which better reflects a typical cycle. The average is still shown alongside for comparison.",
    ],
    [
      "What should I do if the expected result window has passed?",
      "First check the body's official website and press-release section for a delay notice, then its verified social media handles. Result delays of weeks usually trace to answer-key objections, court orders or normalisation exercises, all of which get announced.",
    ],
  ],
};

export default seo;
