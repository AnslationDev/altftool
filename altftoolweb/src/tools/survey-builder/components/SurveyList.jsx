"use client";
import React from "react";
import { Copy, Trash2, Eye, BarChart3 } from "lucide-react";

export default function SurveyList({
  surveys,
  responses,
  onDelete,
  onDuplicate,
  onView,
  onAnalytics,
}) {
  const getResponseCount = (surveyId) => {
    return responses.filter((r) => r.surveyId === surveyId).length;
  };

  if (surveys.length === 0) {
    return (
      <section id="surveys" className="max-w-6xl mx-auto px-4 py-10">
        <div
          className="
            p-10 text-center 
            border-2 border-(--border) border-dashed 
            bg-(--card)
            rounded-2xl
          "
        >
          <h3 className="text-2xl font-semibold text-(--muted-foreground)">
            📋 No surveys yet
          </h3>
          <p className="text-(--muted-foreground) mt-2">
            Create your first survey to get started!
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="surveys" className="max-w-6xl mx-auto px-4 py-10 mt-[-40]">
      <h2 className="text-3xl font-bold text-center text-(--foreground)">
        📋 Your Surveys ({surveys.length})
      </h2>
      <p className="text-(--muted-foreground) text-center mt-1 mb-6">
        Manage, view, and analyze your surveys
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {surveys.map((survey) => (
          <div
            key={survey.id}
            className="
              bg-(--card) 
              border border-(--border) 
              p-5 rounded-2xl shadow-sm 
              transition-all
              hover:shadow-md hover:-translate-y-1
            "
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <span
                className="
                  px-3 py-1 rounded-full text-xs 
                  bg-(--primary)/10 text-(--primary)
                "
              >
                {survey.questions.length} Questions
              </span>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => onDuplicate(survey.id)}
                  className="
                    p-2 rounded-lg hover:bg-(--muted)
                    text-(--foreground) transition cursor-pointer
                  "
                >
                  <Copy size={16} />
                </button>

                <button
                  onClick={() => onDelete(survey.id)}
                  className="
                    p-2 rounded-lg hover:bg-red-100 
                    text-red-600 transition cursor-pointer
                  "
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {/* Title */}
            <h3 className="text-lg font-semibold text-(--foreground)">
              {survey.title}
            </h3>

            {/* Description */}
            {survey.description && (
              <p
                className="
                  text-(--muted-foreground) text-sm mt-1 mb-2
                  line-clamp-2
                "
              >
                {survey.description}
              </p>
            )}

            {/* Stats */}
            <div className="mb-3">
              <span
                className="
                  px-3 py-1 rounded-full text-xs 
                  border border-(--border)
                  text-(--foreground)
                "
              >
                {getResponseCount(survey.id)} Responses
              </span>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => onView(survey)}
                className="
                  flex-1 px-4 py-2 text-sm rounded-xl  
                  border border-(--border)
                  text-(--foreground) 
                  hover:bg-(--muted)
                  transition
                  flex items-center justify-center gap-2 cursor-pointer
                "
              >
                <Eye size={16} /> Take
              </button>

              <button
                onClick={() => onAnalytics(survey)}
                className="
                  flex-1 px-4 py-2 text-sm rounded-xl  
                  bg-(--primary) text-(--primary-foreground)
                  hover:opacity-90
                  transition
                  flex items-center justify-center gap-2 cursor-pointer
                "
              >
                <BarChart3 size={16} /> Analytics
              </button>
            </div>

            {/* Date */}
            <p className="text-(--muted-foreground) text-xs mt-3">
              Created: {new Date(survey.createdAt).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
