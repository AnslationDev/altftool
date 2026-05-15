export const GRADE_POINTS = {
  "O": 10,
  "A+": 9,
  "A": 8,
  "B+": 7,
  "B": 6,
  "C": 5,
  "P": 4,
  "F": 0
};

export const getPerformanceLabel = (gpa) => {
  if (gpa >= 9) return { label: "Outstanding", color: "text-emerald-500", bg: "bg-emerald-500/10" };
  if (gpa >= 8) return { label: "Excellent", color: "text-blue-500", bg: "bg-blue-500/10" };
  if (gpa >= 7) return { label: "Very Good", color: "text-cyan-500", bg: "bg-cyan-500/10" };
  if (gpa >= 6) return { label: "Good", color: "text-yellow-500", bg: "bg-yellow-500/10" };
  if (gpa >= 5) return { label: "Average", color: "text-orange-500", bg: "bg-orange-500/10" };
  return { label: "Needs Improvement", color: "text-red-500", bg: "bg-red-500/10" };
};

export const calculateGPA = (subjects) => {
  let totalCredits = 0;
  let weightedPoints = 0;

  subjects.forEach(sub => {
    const credits = parseFloat(sub.credits) || 0;
    const gradePoint = GRADE_POINTS[sub.grade] || 0;
    totalCredits += credits;
    weightedPoints += (credits * gradePoint);
  });

  const gpa = totalCredits > 0 ? weightedPoints / totalCredits : 0;
  return {
    gpa: parseFloat(gpa.toFixed(2)),
    totalCredits
  };
};

export const calculateCGPA = (semesters) => {
  let totalCredits = 0;
  let weightedGPA = 0;

  semesters.forEach(sem => {
    const gpa = parseFloat(sem.gpa) || 0;
    const credits = parseFloat(sem.credits) || 0;
    totalCredits += credits;
    weightedGPA += (gpa * credits);
  });

  const cgpa = totalCredits > 0 ? weightedGPA / totalCredits : 0;
  return {
    cgpa: parseFloat(cgpa.toFixed(2)),
    totalCredits
  };
};

export const convertToPercentage = (cgpa) => {
  if (!cgpa) return 0;
  return parseFloat(((cgpa - 0.75) * 10).toFixed(2));
};

export const predictRequiredGPA = (currentCGPA, currentCredits, targetCGPA, upcomingCredits) => {
  const curCGPA = parseFloat(currentCGPA) || 0;
  const curCredits = parseFloat(currentCredits) || 0;
  const tgtCGPA = parseFloat(targetCGPA) || 0;
  const upCredits = parseFloat(upcomingCredits) || 0;

  if (upCredits <= 0) return null;

  const totalCredits = curCredits + upCredits;
  const requiredWeightedPoints = (tgtCGPA * totalCredits) - (curCGPA * curCredits);
  const requiredGPA = requiredWeightedPoints / upCredits;

  return requiredGPA > 10 ? "Impossible" : requiredGPA < 0 ? 0 : parseFloat(requiredGPA.toFixed(2));
};
