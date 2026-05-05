export function calculateFocusTime(totalMinutes, focusMinutes, breakMinutes) {
  if (
    totalMinutes <= 0 ||
    focusMinutes <= 0 ||
    breakMinutes < 0
  ) {
    return null;
  }

  let used = 0;
  let sessions = 0;
  let breakUsed = 0;

  while (used + focusMinutes <= totalMinutes) {
    used += focusMinutes;
    sessions++;

    if (used + breakMinutes + focusMinutes > totalMinutes) break;

    used += breakMinutes;
    breakUsed += breakMinutes;
  }

  return {
    sessions,
    totalFocus: sessions * focusMinutes,
    totalBreak: breakUsed,
    remainingTime: totalMinutes - used,
  };
}
