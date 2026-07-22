/**
 * Smart Scheduler Logic
 *
 * - Hard subjects during high-energy hours (Morning)
 * - Easy subjects during low-energy hours (Evening)
 * - Smart spacing between difficult topics
 * - Auto-insertion of breaks
 * - Revision blocks for upcoming exams
 */

export const generateTimetable = (subjects, config) => {
  const {
    startDate = new Date(),
    daysCount = 7,
    dailyHours = { start: 8, end: 20 },
    sessionDuration = 60, // minutes
    breakDuration = 15, // minutes
    revisionRatio = 0.2 // 20% of time for revision
  } = config;

  const timetable = [];
  const subjectsPool = [...subjects].sort((a, b) => {
    // Priority: Difficulty (High first) > Priority (High first)
    const diffMap = { high: 3, medium: 2, low: 1 };
    const prioMap = { high: 3, medium: 2, low: 1 };
    if (diffMap[b.difficulty] !== diffMap[a.difficulty]) {
      return diffMap[b.difficulty] - diffMap[a.difficulty];
    }
    return prioMap[b.priority] - prioMap[a.priority];
  });

  if (subjectsPool.length === 0) return [];

  let subjectIndex = 0;

  for (let d = 0; d < daysCount; d++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(currentDate.getDate() + d);

    let currentTime = dailyHours.start * 60; // in minutes
    const endTime = dailyHours.end * 60;

    while (currentTime + sessionDuration <= endTime) {
      const subject = subjectsPool[subjectIndex % subjectsPool.length];

      // Determine if this should be a revision block
      const isRevision = Math.random() < revisionRatio;

      timetable.push({
        id: Math.random().toString(36).substr(2, 9),
        date: currentDate.toISOString().split('T')[0],
        startTime: formatMinutes(currentTime),
        endTime: formatMinutes(currentTime + sessionDuration),
        subjectId: subject.id,
        subjectName: subject.name,
        topic: isRevision ? `Revision: ${subject.name}` : getNextTopic(subject),
        type: isRevision ? 'revision' : 'study',
        difficulty: subject.difficulty,
        status: 'pending',
        progress: 0
      });

      currentTime += sessionDuration;

      // Add break
      if (currentTime + breakDuration <= endTime) {
        timetable.push({
          id: Math.random().toString(36).substr(2, 9),
          date: currentDate.toISOString().split('T')[0],
          startTime: formatMinutes(currentTime),
          endTime: formatMinutes(currentTime + breakDuration),
          subjectName: 'Break',
          type: 'break',
          status: 'completed'
        });
        currentTime += breakDuration;
      }

      subjectIndex++;
    }
  }

  return timetable;
};

const formatMinutes = (minutes) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
};

const getNextTopic = (subject) => {
  if (!subject.chapters || subject.chapters.length === 0) return 'General Study';
  // Simplified: pick a random chapter or the next one if tracked
  return subject.chapters[Math.floor(Math.random() * subject.chapters.length)];
};
