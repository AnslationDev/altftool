"use client";
import TaskItem from "./TaskItem";

export default function TaskList({ tasks, ...actions }) {
  if (tasks.length === 0)
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">📝</div>
        <p className="text-xl text-(--muted-foreground) ">No tasks here</p>
      </div>
    );

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} {...actions} />
      ))}
    </div>
  );
}
