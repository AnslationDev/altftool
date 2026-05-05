"use client";
import React, { useState } from "react";
import Header from "../components/Header";
import Stats from "../components/Stats";
import AddTask from "../components/AddTask";
import FilterTabs from "../components/FilterTabs";
import TaskList from "../components/TaskList";
import FooterNote from "../components/FooterNote";
import useTasks from "../hooks/useTasks";
import Features from "../components/Features";

export default function SimpleTaskManager() {
  const {
    stats,
    filter,
    setFilter,
    addTask,
    deleteTask,
    toggleComplete,
    toggleImportant,
    editTask,
    filteredTasks,
  } = useTasks();

  const [input, setInput] = useState("");

  return (
    <div className=" bg-(--background) text-(--foreground) transition-colors py-6 px-4">
      <div className="mx-auto max-w-5xl">
        <Header />

        <Stats stats={stats} />

        <div className="rounded-2xl overflow-hidden border border-(--border) bg-(--card) shadow-md transition-colors">
          <AddTask
            input={input}
            setInput={setInput}
            addTask={() => {
              addTask(input);
              setInput("");
            }}
          />

          <FilterTabs filter={filter} setFilter={setFilter} stats={stats} />

          <div className="p-6">
            <TaskList
              tasks={filteredTasks}
              deleteTask={deleteTask}
              toggleComplete={toggleComplete}
              toggleImportant={toggleImportant}
              editTask={editTask}
            />
          </div>
        </div>

        <FooterNote />
        <Features/>
      </div>
    </div>
  );
}
