export const calculateStressCorrelation = (answers) => {

  const stressQuestionIds = [2, 5, 7]; // ids of stress related questions

  let stressScore = 0;
  let maxStressScore = stressQuestionIds.length * 5; // if max option value = 5

  answers.forEach((ans) => {
    if (stressQuestionIds.includes(ans.questionId)) {
      stressScore += ans.value;
    }
  });

  const percentage = Math.round((stressScore / maxStressScore) * 100);

  return percentage || 0;
};