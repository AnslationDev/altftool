const STORAGE_KEY = "symptom_diary_logs";

export const getLogs = () => {
  if (typeof window === "undefined") return [];
  const logs = localStorage.getItem(STORAGE_KEY);
  return logs ? JSON.parse(logs) : [];
};

export const saveLogs = (logs) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
};

export const addLog = (log) => {
  const logs = getLogs();
  const newLogs = [log, ...logs];
  saveLogs(newLogs);
  return newLogs;
};

export const updateLog = (updatedLog) => {
  const logs = getLogs();
  const newLogs = logs.map((log) => (log.id === updatedLog.id ? updatedLog : log));
  saveLogs(newLogs);
  return newLogs;
};

export const deleteLog = (id) => {
  const logs = getLogs();
  const newLogs = logs.filter((log) => log.id !== id);
  saveLogs(newLogs);
  return newLogs;
};
