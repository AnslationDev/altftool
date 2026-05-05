"use client";
import React, { useState } from "react";
import { X, Plus, Trash, GripVertical, ListChecks } from "lucide-react";

/*  
  NOTE:
  Uses your global theme:
  - bg-(--background)
  - bg-(--card)
  - text-(--primary)
  - border-(--border)
*/

export default function CreateSurveyDialog({ open, onClose, onSave }) {
  const [surveyTitle, setSurveyTitle] = useState("");
  const [surveyDescription, setSurveyDescription] = useState("");
  const [questions, setQuestions] = useState([]);

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const showToast = (msg, type = "success") => {
    setToast({ show: true, message: msg, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 2500);
  };

  const handleClose = () => {
    setSurveyTitle("");
    setSurveyDescription("");
    setQuestions([]);
    onClose();
  };

  const questionTypes = [
    { value: "short_text", label: "📝 Short Text" },
    { value: "paragraph", label: "📄 Paragraph" },
    { value: "radio", label: "🔘 Multiple Choice" },
    { value: "checkbox", label: "☑️ Checkboxes" },
    { value: "rating", label: "⭐ Rating (1–5)" },
  ];

  const needsOptions = (type) => type === "radio" || type === "checkbox";

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: `q_${Date.now()}`,
        type: "short_text",
        label: "",
        required: false,
        placeholder: "",
        options: ["Option 1", "Option 2"],
      },
    ]);
  };

  const updateQuestion = (id, field, value) => {
    setQuestions(
      questions.map((q) => (q.id === id ? { ...q, [field]: value } : q)),
    );
  };

  const deleteQuestion = (id) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const addOption = (questionId) => {
    setQuestions(
      questions.map((q) =>
        q.id === questionId
          ? { ...q, options: [...q.options, `Option ${q.options.length + 1}`] }
          : q,
      ),
    );
  };

  const updateOption = (questionId, index, value) => {
    setQuestions(
      questions.map((q) =>
        q.id === questionId
          ? {
              ...q,
              options: q.options.map((opt, i) => (i === index ? value : opt)),
            }
          : q,
      ),
    );
  };

  const deleteOption = (questionId, index) => {
    setQuestions(
      questions.map((q) =>
        q.id === questionId && q.options.length > 2
          ? { ...q, options: q.options.filter((_, i) => i !== index) }
          : q,
      ),
    );
  };

  const saveSurvey = () => {
    if (!surveyTitle.trim())
      return showToast("Please enter a survey title", "error");
    if (questions.length === 0)
      return showToast("Please add at least one question", "error");

    if (questions.some((q) => !q.label.trim()))
      return showToast("Fill all question labels", "error");

    onSave({
      id: `survey_${Date.now()}`,
      title: surveyTitle,
      description: surveyDescription,
      createdAt: new Date().toISOString(),
      questions,
    });

    handleClose();
  };

  if (!open) return null;

  return (
    <>
      {/* ================= OVERLAY ================= */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-fadeIn" />

      {/* ================= MODAL ================= */}
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4 animate-scaleIn">
        <div className="w-full max-w-3xl rounded-2xl bg-(--card) border border-(--border) shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-(--border)">
            <h2 className="text-xl font-bold text-(--primary)">
              {/* <span className="">
                <ListChecks />
              </span>{" "} */}
              Create New Survey
            </h2>
            <button
              onClick={handleClose}
              className="p-2 text-(--foreground) hover:bg-(--muted) rounded-lg"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            {/* Survey Title */}
            <div className="space-y-1">
              <label className="text-sm font-semibold text-(--foreground)">
                Survey Title *
              </label>
              <input
                className="w-full px-4 py-2 rounded-xl border border-(--border) bg-(--background) text-(--foreground)"
                placeholder="Customer Satisfaction Survey"
                value={surveyTitle}
                onChange={(e) => setSurveyTitle(e.target.value)}
              />
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="text-sm font-semibold text-(--foreground)">
                Description
              </label>
              <textarea
                rows={2}
                className="w-full px-4 py-2 rounded-xl border border-(--border) bg-(--background) text-(--foreground)"
                placeholder="Describe your survey..."
                value={surveyDescription}
                onChange={(e) => setSurveyDescription(e.target.value)}
              />
            </div>

            <hr className="border-(--border)" />

            {/* Question Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-(--foreground)">
                Questions ({questions.length})
              </h3>
              <button
                onClick={addQuestion}
                className=" cursor-pointer flex items-center gap-2 bg-(--primary) text-(--primary-foreground) px-4 py-2 rounded-lg shadow hover:shadow-lg"
              >
                <Plus size={18} /> Add Question
              </button>
            </div>

            {/* Empty State */}
            {questions.length === 0 && (
              <div className="p-6 text-center border border-dashed border-(--border) rounded-xl">
                <p className="text-(--muted-foreground)">
                  No questions yet. Click “Add Question”.
                </p>
              </div>
            )}

            {/* Questions */}
            <div className="space-y-4">
              {questions.map((q, index) => (
                <div
                  key={q.id}
                  className="p-4 border border-(--border) bg-(--background) rounded-xl shadow-sm"
                >
                  {/* Question Header */}
                  <div className="flex items-center gap-2 mb-3">
                    <GripVertical className="text-(--muted-foreground)" />
                    <div className="px-3 py-1 text-sm bg-(--primary)/15 text-(--primary) rounded-lg">
                      Q{index + 1}
                    </div>

                    <button
                      onClick={() => deleteQuestion(q.id)}
                      className="ml-auto text-red-500 hover:bg-red-500/10 p-2 rounded-lg cursor-pointer"
                    >
                      <Trash size={18} />
                    </button>
                  </div>

                  {/* Type Select */}
                  <div className="mb-3">
                    <select
                      value={q.type}
                      onChange={(e) =>
                        updateQuestion(q.id, "type", e.target.value)
                      }
                      className="w-full px-4 py-2 rounded-xl border border-(--border) bg-(--background) text-(--foreground)"
                    >
                      {questionTypes.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Question Label */}
                  <div className="mb-3">
                    <input
                      className="w-full px-4 py-2 rounded-xl border border-(--border) bg-(--background)"
                      value={q.label}
                      placeholder="Enter question"
                      onChange={(e) =>
                        updateQuestion(q.id, "label", e.target.value)
                      }
                    />
                  </div>

                  {/* Placeholder (short/paragraph) */}
                  {(q.type === "short_text" || q.type === "paragraph") && (
                    <input
                      className="w-full px-4 py-2 rounded-xl border border-(--border) bg-(--background)"
                      placeholder="Placeholder"
                      value={q.placeholder}
                      onChange={(e) =>
                        updateQuestion(q.id, "placeholder", e.target.value)
                      }
                    />
                  )}

                  {/* Options */}
                  {needsOptions(q.type) && (
                    <div>
                      <p className="text-sm font-semibold mb-2">Options</p>

                      {q.options.map((op, i) => (
                        <div key={i} className="flex items-center gap-2 mb-2">
                          <input
                            className="flex-1 px-4 py-2 rounded-xl border border-(--border) bg-(--background)"
                            value={op}
                            onChange={(e) =>
                              updateOption(q.id, i, e.target.value)
                            }
                          />

                          {q.options.length > 2 && (
                            <button
                              onClick={() => deleteOption(q.id, i)}
                              className="text-red-500 hover:bg-red-500/10 p-2 rounded-lg cursor-pointer"
                            >
                              <Trash size={16} />
                            </button>
                          )}
                        </div>
                      ))}

                      <button
                        onClick={() => addOption(q.id)}
                        className="mt-1 text-(--primary) text-sm font-medium"
                      >
                        + Add Option
                      </button>
                    </div>
                  )}

                  {/* Required checkbox */}
                  <label className="flex items-center gap-2 mt-3">
                    <input
                      type="checkbox"
                      checked={q.required}
                      onChange={(e) =>
                        updateQuestion(q.id, "required", e.target.checked)
                      }
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-(--foreground)">
                      Required
                    </span>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 px-6 py-4 border-t border-(--border)">
            <button
              onClick={handleClose}
              className="px-5 py-2 rounded-lg border border-(--border) text-(--foreground) cursor-pointer"
            >
              Cancel
            </button>

            <button
              onClick={saveSurvey}
              className="px-5 py-2 rounded-lg bg-(--primary) text-(--primary-foreground) shadow hover:shadow-lg cursor-pointer"
            >
              Create Survey
            </button>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast.show && (
        <div
          className={`
          fixed bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-xl shadow-lg 
          text-white z-999 
          ${toast.type === "error" ? "bg-red-500" : "bg-green-500"}
        `}
        >
          {toast.message}
        </div>
      )}
    </>
  );
}
