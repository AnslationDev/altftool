"use client";
import { useState, useEffect } from "react";
import { loadTasks, saveTasks } from "../utils/storage";

export default function useTasks() {
  const [tasks, setTasks] = useState(loadTasks());
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  const addTask = (text) => {
    if (!text.trim()) return;
    setTasks([
      ...tasks,
      { id: Date.now(), text, completed: false, important: false },
    ]);
  };

  const deleteTask = (id) => setTasks(tasks.filter((t) => t.id !== id));

  const toggleComplete = (id) =>
    setTasks(
      tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );

  const toggleImportant = (id) =>
    setTasks(
      tasks.map((t) => (t.id === id ? { ...t, important: !t.important } : t))
    );

  const editTask = (id, newText) =>
    setTasks(tasks.map((t) => (t.id === id ? { ...t, text: newText } : t)));

  const stats = {
    total: tasks.length,
    active: tasks.filter((t) => !t.completed).length,
    completed: tasks.filter((t) => t.completed).length,
    important: tasks.filter((t) => t.important && !t.completed).length,
  };

  const filteredTasks = (() => {
    let filtered = [...tasks];

    if (filter === "active") filtered = filtered.filter((t) => !t.completed);
    else if (filter === "completed")
      filtered = filtered.filter((t) => t.completed);
    else if (filter === "important")
      filtered = filtered.filter((t) => t.important && !t.completed);

    // Sort important tasks first
    return filtered.sort((a, b) => {
      if (a.important && !b.important) return -1;
      if (!a.important && b.important) return 1;
      return b.id - a.id;
    });
  })();

  return {
    tasks,
    stats,
    filter,
    setFilter,
    addTask,
    deleteTask,
    toggleComplete,
    toggleImportant,
    editTask,
    filteredTasks,
  };
}
