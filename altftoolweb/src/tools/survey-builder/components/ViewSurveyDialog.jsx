"use client";
import React, { useState } from "react";
import { X } from "lucide-react";

export default function ViewSurveyDialog({ open, onClose, survey, onSubmit }) {
  const [answers, setAnswers] = useState({});

  if (!open || !survey) return null;

  const handleChange = (questionId, value) => {
    setAnswers({ ...answers, [questionId]: value });
  };

  const handleCheckboxChange = (questionId, option) => {
    const current = answers[questionId] || [];
    const newValue = current.includes(option)
      ? current.filter((o) => o !== option)
      : [...current, option];
    setAnswers({ ...answers, [questionId]: newValue });
  };

  const handleSubmit = () => {
    // Required validation
    for (const q of survey.questions) {
      if (q.required && !answers[q.id]) {
        alert(`Please answer: ${q.label}`);
        return;
      }
    }

    const response = {
      // eslint-disable-next-line react-hooks/purity
      id: `response_${Date.now()}`,
      surveyId: survey.id,
      submittedAt: new Date().toISOString(),
      answers,
    };

    onSubmit(response);
    handleClose();
  };

  const handleClose = () => {
    setAnswers({});
    onClose();
  };

  return (
    <div
      className="
        fixed inset-0 z-50 flex items-center justify-center 
        bg-black/50 backdrop-blur-sm
      "
    >
      {/* Dialog Wrapper */}
      <div
        className="
          w-full max-w-3xl max-h-[90vh] overflow-y-auto
          bg-(--card) border border-(--border)
          rounded-2xl shadow-xl
        "
      >
        {/* Header */}
        <div
          className="
            flex items-center justify-between
            p-5 border-b border-(--border)
            bg-(--background)
          "
        >
          <div>
            <h2 className="text-xl font-bold text-(--foreground)">
              {survey.title}
            </h2>
            {survey.description && (
              <p className="text-(--muted-foreground) text-sm mt-1">
                {survey.description}
              </p>
            )}
          </div>

          <button
            onClick={handleClose}
            className="
              p-2 rounded-lg hover:bg-(--muted)
              text-(--foreground)
            "
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5">
          {survey.questions.map((question, index) => (
            <div
              key={question.id}
              className="
                p-5 rounded-xl 
                bg-(--background)
                border border-(--border)
              "
            >
              <label className="font-semibold text-(--foreground)">
                {index + 1}. {question.label}
                {question.required && (
                  <span className="text-red-500 ml-1">*</span>
                )}
              </label>

              {/* Short text */}
              {question.type === "short_text" && (
                <input
                  type="text"
                  value={answers[question.id] || ""}
                  onChange={(e) => handleChange(question.id, e.target.value)}
                  placeholder={question.placeholder || "Your answer"}
                  className="
                    w-full mt-2 p-3 rounded-xl
                    bg-(--card) border border-(--border)
                    text-(--foreground)
                    focus:ring-2 focus:ring-(--primary)
                    outline-none
                  "
                />
              )}

              {/* Paragraph */}
              {question.type === "paragraph" && (
                <textarea
                  rows={4}
                  value={answers[question.id] || ""}
                  onChange={(e) => handleChange(question.id, e.target.value)}
                  placeholder={question.placeholder || "Your answer"}
                  className="
                    w-full mt-2 p-3 rounded-xl
                    bg-(--card) border border-(--border)
                    text-(--foreground)
                    focus:ring-2 focus:ring-(--primary)
                    outline-none resize-none
                  "
                />
              )}

              {/* Radio (multiple choice) */}
              {question.type === "radio" && (
                <div className="mt-3 space-y-2">
                  {question.options.map((option, idx) => (
                    <label
                      key={idx}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name={question.id}
                        value={option}
                        checked={answers[question.id] === option}
                        onChange={(e) =>
                          handleChange(question.id, e.target.value)
                        }
                        className="w-4 h-4 text-(--primary)"
                      />
                      <span className="text-(--foreground)">{option}</span>
                    </label>
                  ))}
                </div>
              )}

              {/* Checkbox */}
              {question.type === "checkbox" && (
                <div className="mt-3 space-y-2">
                  {question.options.map((option, idx) => (
                    <label
                      key={idx}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={(answers[question.id] || []).includes(option)}
                        onChange={() =>
                          handleCheckboxChange(question.id, option)
                        }
                        className="w-4 h-4 text-(--primary)"
                      />
                      <span className="text-(--foreground)">{option}</span>
                    </label>
                  ))}
                </div>
              )}

              {/* Rating (1–5 stars) */}
              {question.type === "rating" && (
                <div className="mt-3 flex items-center gap-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleChange(question.id, star)}
                      className={`
                        text-2xl transition 
                        ${
                          answers[question.id] >= star
                            ? "text-yellow-400"
                            : "text-(--muted-foreground)"
                        }
                      `}
                    >
                      ★
                    </button>
                  ))}

                  <span className="text-(--muted-foreground) text-sm">
                    {answers[question.id]
                      ? `${answers[question.id]} / 5`
                      : "Not rated"}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div
          className="
            p-4 border-t border-(--border)
            flex justify-end gap-3 bg-(--card)
          "
        >
          <button
            onClick={handleClose}
            className="
              px-5 py-2 rounded-xl border border-(--border)
              text-(--foreground) hover:bg-(--muted)
              transition
            "
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className="
              px-5 py-2 rounded-xl
              bg-(--primary) text-(--primary-foreground)
              hover:opacity-90 transition
            "
          >
            Submit Response
          </button>
        </div>
      </div>
    </div>
  );
}
