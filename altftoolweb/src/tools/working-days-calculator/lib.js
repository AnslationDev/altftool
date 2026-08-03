export function parseWorkingHours(value) {
  const source = String(value ?? "").trim();
  if (!source) {
    return { ok: false, error: "Enter hours per working day, or enter 0 if you only need a day count." };
  }
  const hours = Number(source);
  if (!Number.isFinite(hours) || hours < 0 || hours > 24) {
    return { ok: false, error: "Hours per working day must be between 0 and 24." };
  }
  return { ok: true, value: hours };
}

export default parseWorkingHours;
