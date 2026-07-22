"use client";

import React from "react";
import { HelpCircle, Play } from "lucide-react";

export default function QuizCard({ quiz, onClick }) {
  return (
    <article className="bf-card bf-quiz-card" onClick={onClick}>
      <div className="bf-card-image-wrap">
        <img src={quiz.image} alt={quiz.title} className="bf-card-image" />
        <span className="bf-category-badge bf-badge-quizzes">
          <HelpCircle size={12} className="bf-quiz-badge-icon" />
          QUIZ
        </span>
        <div className="bf-quiz-play-overlay">
          <div className="bf-play-btn">
            <Play size={24} fill="#ffffff" />
          </div>
          <span className="bf-play-text">PLAY QUIZ</span>
        </div>
      </div>
      <div className="bf-card-content">
        <span className="bf-quiz-type-label">
          {quiz.quizType === "personality" ? "Personality Quiz" : "Trivia Challenge"}
        </span>
        <h3 className="bf-card-title bf-quiz-title">{quiz.title}</h3>
        <p className="bf-card-excerpt">{quiz.excerpt}</p>
        <div className="bf-card-meta">
          <span className="bf-meta-author">By {quiz.author}</span>
          <span className="bf-meta-time">{quiz.readTime}</span>
        </div>
      </div>
    </article>
  );
}
