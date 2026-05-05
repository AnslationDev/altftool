export const loadTasks = () => {
  try {
    const stored = localStorage.getItem("simpleTasks");
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export const saveTasks = (tasks) => {
  localStorage.setItem("simpleTasks", JSON.stringify(tasks));
};
