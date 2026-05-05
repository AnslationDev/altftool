// Question category mapping
const triggerQuestions = {
  workStress: [2, 3],
  relationshipIssues: [6, 7],
  dailyFrustrations: [1, 4, 10],
};

const controlQuestions = {
  impulseControl: [8],
  emotionalAwareness: [5],
  patienceLevel: [9],
};

// percentage calculate
const calculatePercentage = (values) => {
  if (!values.length) return 0;

  const maxScore = values.length * 5;
  const total = values.reduce((sum, v) => sum + v, 0);

  return Math.round((total / maxScore) * 100);
};

// convert percentage → level
const getLevel = (percent) => {
  if (percent <= 40) return "Low";
  if (percent <= 70) return "Medium";
  return "High";
};

// main report generator
export const generateDetailedReport = (answers) => {

  const getValues = (ids) =>
    answers
      .filter((a) => ids.includes(a.questionId))
      .map((a) => a.value);

  // trigger percentages
  const workStressPercent = calculatePercentage(
    getValues(triggerQuestions.workStress)
  );

  const relationshipIssuesPercent = calculatePercentage(
    getValues(triggerQuestions.relationshipIssues)
  );

  const dailyFrustrationsPercent = calculatePercentage(
    getValues(triggerQuestions.dailyFrustrations)
  );

  // control percentages
  const impulseControlPercent = calculatePercentage(
    getValues(controlQuestions.impulseControl)
  );

  const emotionalAwarenessPercent = calculatePercentage(
    getValues(controlQuestions.emotionalAwareness)
  );

  const patienceLevelPercent = calculatePercentage(
    getValues(controlQuestions.patienceLevel)
  );

  return {
    triggers: [
      { label: "Work Stress", value: workStressPercent },
      { label: "Relationship Issues", value: relationshipIssuesPercent },
      { label: "Daily Frustrations", value: dailyFrustrationsPercent },
    ],

    control: [
      { label: "Impulse Control", value: getLevel(impulseControlPercent) },
      { label: "Emotional Awareness", value: getLevel(emotionalAwarenessPercent) },
      { label: "Patience Level", value: getLevel(patienceLevelPercent) },
    ],
  };
};