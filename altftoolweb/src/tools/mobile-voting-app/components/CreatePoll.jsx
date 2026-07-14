"use client";

import { useState } from "react";
import { Plus, Trash2, Calendar, Shield, FileText, User } from "lucide-react";

const CreatePoll = ({ onCreate }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [organizer, setOrganizer] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [deadline, setDeadline] = useState("");
  const [anonymous, setAnonymous] = useState(true);

  const handleOptionChange = (index, value) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  };

  const addOption = () => {
    if (options.length >= 10) return;
    setOptions([...options, ""]);
  };

  const removeOption = (index) => {
    if (options.length <= 2) return;
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    const success = onCreate({ title, description, organizer, options, deadline, anonymous });
    if (success) {
      setTitle("");
      setDescription("");
      setOrganizer("");
      setOptions(["", ""]);
      setDeadline("");
      setAnonymous(true);
    }
  };

  return (
    <div className="rounded-2xl p-6 shadow-md space-y-5 border bg-(--card) border-(--border)">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-(--primary) text-(--primary-foreground)">
          <FileText size={20} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-(--foreground)">Create New Poll</h2>
          <p className="text-sm text-(--muted-foreground)">Set up your poll and start collecting votes</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-(--foreground) mb-1.5">Poll Title *</label>
          <input
            type="text"
            placeholder="e.g. Best Framework for 2025"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-(--background) border border-(--border) focus:ring-2 focus:ring-(--primary) outline-none transition text-(--foreground)"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-(--foreground) mb-1.5">Description</label>
          <textarea
            placeholder="Describe what this poll is about..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full px-4 py-3 rounded-lg bg-(--background) border border-(--border) focus:ring-2 focus:ring-(--primary) outline-none transition text-(--foreground) resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-(--foreground) mb-1.5">
            <span className="flex items-center gap-1.5"><User size={14} /> Organizer Name</span>
          </label>
          <input
            type="text"
            placeholder="e.g. John Doe"
            value={organizer}
            onChange={(e) => setOrganizer(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-(--background) border border-(--border) focus:ring-2 focus:ring-(--primary) outline-none transition text-(--foreground)"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-(--foreground) mb-2">Voting Options *</label>
          <div className="space-y-2">
            {options.map((option, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  placeholder={`Option ${index + 1}`}
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  className="flex-1 px-4 py-3 rounded-lg bg-(--background) border border-(--border) focus:ring-2 focus:ring-(--primary) outline-none transition text-(--foreground)"
                />
                {options.length > 2 && (
                  <button
                    onClick={() => removeOption(index)}
                    className="p-3 rounded-lg border border-(--border) text-(--muted-foreground) hover:text-[var(--anslation-ds-danger)] hover:border-[var(--anslation-ds-danger)] hover:bg-[var(--anslation-ds-danger-soft)] transition cursor-pointer"
                    aria-label={`Remove option ${index + 1}`}
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            ))}
          </div>
          {options.length < 10 && (
            <button
              onClick={addOption}
              className="mt-3 flex items-center gap-2 px-4 py-2.5 rounded-lg border border-dashed border-(--border) text-(--muted-foreground) hover:text-(--primary) hover:border-(--primary) hover:bg-(--primary-soft) transition text-sm font-medium cursor-pointer"
            >
              <Plus size={16} /> Add Option
            </button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-(--foreground) mb-1.5">
              <span className="flex items-center gap-1.5"><Calendar size={14} /> Voting Deadline (optional)</span>
            </label>
            <input
              type="datetime-local"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-(--background) border border-(--border) focus:ring-2 focus:ring-(--primary) outline-none transition text-(--foreground)"
            />
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2.5 px-4 py-3 rounded-lg border border-(--border) cursor-pointer hover:bg-(--muted) transition">
              <input
                type="checkbox"
                checked={anonymous}
                onChange={(e) => setAnonymous(e.target.checked)}
                className="cursor-pointer accent-[var(--primary)]"
              />
              <span className="flex items-center gap-1.5 text-sm font-medium text-(--foreground)">
                <Shield size={14} /> Anonymous Voting
              </span>
            </label>
          </div>
        </div>
      </div>

      <button
        onClick={handleSubmit}
        className="w-full px-4 py-3 rounded-xl bg-(--primary) text-(--primary-foreground) font-medium hover:opacity-90 transition cursor-pointer"
      >
        Create Poll
      </button>
    </div>
  );
};

export default CreatePoll;
