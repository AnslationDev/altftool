const seo = {
  title: "F1 Score Calculator: Precision, Recall, F-beta",
  metaDescription:
    "Enter TP, FP, FN and TN to get precision, recall, F1, F-beta, balanced accuracy, MCC and Cohen's kappa; zero denominators show as undefined.",
  steps: [
    "Enter the four confusion-matrix counts: True positives, False positives, False negatives and True negatives.",
    "Set Beta, or click a preset — F0.5 when precision matters twice as much, F1 for equal weighting, F2 when recall matters twice as much.",
    "Read the F1 score headline with Precision, Recall, Specificity, Accuracy, Balanced accuracy, MCC and Cohen's kappa; metrics with a zero denominator read undefined, and Copy result copies the set.",
  ],
  intro:
    "Precision Recall F1 Calculator turns the four cells of a binary confusion matrix into every standard classification metric: precision as TP/(TP+FP), recall as TP/(TP+FN), F1 as their harmonic mean, and the F-beta generalisation that lets you weight recall above precision or the reverse. It also reports specificity, negative predictive value, balanced accuracy, the Matthews correlation coefficient and Cohen's kappa, which is what you need when accuracy alone is flattering an imbalanced dataset. Metrics with a zero denominator are labelled undefined rather than silently shown as zero.",
  useCases: [
    "Check a spam filter reporting 95% accuracy on a 9% positive rate, where balanced accuracy of 87% and MCC of 0.71 tell the real story.",
    "Decide between two model checkpoints when one wins on precision and the other on recall, using F0.5 or F2 to encode which error costs more.",
    "Recompute metrics by hand after a threshold change, without rerunning the evaluation pipeline.",
    "Sanity-check a metric printed by a training script that disagrees with what you expected from the raw counts.",
  ],
  benefits: [
    [
      "Undefined is shown as undefined",
      "A model that predicts no positives has no precision at all, and reporting that as 0.00 hides a broken model.",
    ],
    [
      "Imbalance-aware metrics included",
      "MCC and Cohen's kappa both fall sharply on a majority-class predictor that accuracy would rate highly.",
    ],
    [
      "F-beta with any weighting",
      "Set beta to 2 when a missed positive costs more than a false alarm, or 0.5 when the reverse is true.",
    ],
  ],
  faqs: [
    [
      "How do you calculate F1 score from precision and recall?",
      "F1 is the harmonic mean: 2 x precision x recall divided by (precision + recall). It is algebraically identical to 2TP/(2TP+FP+FN), which is the safer form to compute because it stays defined when precision itself is not. Precision 0.70 and recall 0.778 give an F1 of 0.7368.",
    ],
    [
      "What is the difference between precision and recall?",
      "Precision asks what share of your positive predictions were correct, so it is TP/(TP+FP) and it punishes false alarms. Recall asks what share of the real positives you caught, so it is TP/(TP+FN) and it punishes misses. Raising a decision threshold usually raises precision and lowers recall.",
    ],
    [
      "When should I use F2 instead of F1?",
      "Use F2 when a missed positive is worse than a false alarm — screening, fraud detection, safety alerts. F-beta weights recall beta times as heavily as precision, so beta of 2 gives recall four times the weight in the denominator. With precision 0.70 and recall 0.778, F1 is 0.7368 but F2 rises to 0.7609.",
    ],
    [
      "Why is my accuracy 95% but the model still bad?",
      "Because accuracy counts true negatives, and a rare positive class makes them easy to collect. On 1,000 cases with only 90 real positives, predicting negative every time already scores 91%. Balanced accuracy, MCC and Cohen's kappa all correct for this: MCC and kappa sit near 0 for a model that has learned nothing, no matter how high its accuracy looks.",
    ],
  ],
};

export default seo;
