const seo = {
  title: "Dataset Class Balance Checker: Imbalance Ratio & Weights",
  metaDescription:
    "Paste labels as lines, a CSV column or JSONL to get the imbalance ratio, entropy, baseline accuracy and scikit-learn balanced class weights.",
  steps: [
    "Pick the 'Input format' - One label per line, CSV column or JSONL property - and paste your labels into the Labels box (CSV needs the label column plus the 'First row is a header' checkbox).",
    "Set 'Cross-validation folds' (default 5) and the 'Case sensitive' toggle that decides whether 'Spam' and 'spam' are different classes.",
    "Read the imbalance ratio with its severity label, majority-class baseline accuracy, entropy, Gini and per-class balanced weights, then press 'Copy report' for the tab-separated summary.",
  ],
  intro:
    "The Dataset Class Balance Checker reads a list of classification labels and reports the imbalance ratio, normalised Shannon entropy, Gini impurity and the majority-class baseline accuracy for the dataset. It also prints scikit-learn's balanced class weights, n_samples / (n_classes x n_class_rows), and the row counts you would end up with after oversampling or undersampling. Labels are parsed in your browser from plain lines, a CSV column or a JSONL property, so no data leaves the page.",
  useCases: [
    "Checking a scraped support-ticket dataset before fine-tuning, to see whether one intent accounts for most rows",
    "Working out why a model scores 96% accuracy but never predicts the class you actually care about",
    "Confirming every class has at least five rows before running 5-fold StratifiedKFold, which fails when a class is smaller than the fold count",
  ],
  benefits: [
    ["Runs on your labels only", "Parsing and maths happen client-side, so private datasets never leave the browser."],
    ["Weights you can paste in", "Copy the balanced class weights straight into class_weight or a loss function."],
    ["Flags the real risks", "Warns about rare classes, unusable cross-validation splits and misleading accuracy."],
  ],
  faqs: [
    [
      "What is a good class imbalance ratio?",
      "An imbalance ratio at or below 1.5:1 behaves like a balanced dataset, and up to about 3:1 rarely needs special handling. Beyond roughly 10:1, plain accuracy stops being informative and you should switch to macro-F1, balanced accuracy or PR-AUC and consider resampling or class weights.",
    ],
    [
      "How are balanced class weights calculated?",
      "scikit-learn's class_weight=\"balanced\" sets each class weight to n_samples / (n_classes x n_rows_in_class). With 100 rows split 90/10 across two classes, the majority weight is 100 / (2 x 90) = 0.56 and the minority weight is 100 / (2 x 10) = 5.0.",
    ],
    [
      "How many examples does each class need?",
      "At minimum, each class needs as many rows as your cross-validation fold count, because StratifiedKFold cannot split a class with fewer members than n_splits (the default is 5). In practice fewer than about 10 rows in a class makes per-class precision and recall too noisy to compare between runs.",
    ],
    [
      "Should I balance the test set as well?",
      "No. Resample only the training split and leave validation and test at the real-world distribution, otherwise your reported metrics describe a dataset that does not exist in production. Class weights are often preferred over oversampling because they leave the data untouched.",
    ],
  ],
};

export default seo;
