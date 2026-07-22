// Central place mapping a 0-100 score (or a letter grade) to one of the four
// semantic tones defined in globals.css (success/info/warning/danger), so
// every card, gauge and chip in this tool agrees on what "good" looks like.

export const TONE_CLASSES = {
  success: { text: "text-success", bg: "bg-success", soft: "bg-success-soft", stroke: "stroke-success", ring: "ring-success/30" },
  info: { text: "text-info", bg: "bg-info", soft: "bg-info-soft", stroke: "stroke-info", ring: "ring-info/30" },
  warning: { text: "text-warning", bg: "bg-warning", soft: "bg-warning-soft", stroke: "stroke-warning", ring: "ring-warning/30" },
  danger: { text: "text-danger", bg: "bg-danger", soft: "bg-danger-soft", stroke: "stroke-danger", ring: "ring-danger/30" },
};

// `invert` is for metrics where a higher raw number is worse (Spam Risk).
export function toneForScore(value, { invert = false } = {}) {
  const goodness = invert ? 100 - value : value;
  if (goodness >= 80) return "success";
  if (goodness >= 60) return "info";
  if (goodness >= 40) return "warning";
  return "danger";
}

export function toneForGrade(grade) {
  if (grade === "A+" || grade === "A") return "success";
  if (grade === "B") return "info";
  if (grade === "C") return "warning";
  return "danger";
}
