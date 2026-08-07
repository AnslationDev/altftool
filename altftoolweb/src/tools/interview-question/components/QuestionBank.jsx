"use client";

import React, { useState } from 'react';
import { questionsData, domains } from '../data/questions';

import { Search, ChevronDown, ChevronUp, ArrowLeft, Filter } from 'lucide-react';

const DIFFICULTY_BADGE_CLASSES = {
  beginner: 'bg-(--success-soft) text-(--success-text)',
  intermediate: 'bg-(--warning-soft) text-(--warning-text)',
  advanced: 'bg-(--danger-soft) text-(--danger-text)',
};

const QuestionBank = ({ selectedDomainId, onBack }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('All');
  const [visibleAnswerId, setVisibleAnswerId] = useState(null);

  const currentDomain = domains.find(d => d.id === selectedDomainId);

  const filteredQuestions = questionsData.filter((q) => {
    const matchesDomain = q.domain === selectedDomainId;
    const matchesSearch = q.question.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = filterDifficulty === 'All' || q.difficulty === filterDifficulty;
    
    return matchesDomain && matchesSearch && matchesDifficulty;
  });

  const toggleAnswer = (id) => {
    setVisibleAnswerId(visibleAnswerId === id ? null : id);
  };

  return (
    <div className=" m-8 bg-(--background) text-(--foreground) border border-(--border)">
      
      <div className=" m-8  bg-(--card) p-8 rounded-2xl shadow-sm border border-(--border) mb-12">
        <button className="flex items-center gap-2 cursor-pointer text-text-medium font-semibold text-sm hover:text-primary transition mb-6" onClick={onBack}>
          <ArrowLeft size={20} /> Back to Domains
        </button>
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3
            border-b-2 border-(--border) pb-4 mb-6">
          <h2 className="flex  flex-wrap subheading  gap-4">
            <span className="">{currentDomain?.icon}</span> 
            {currentDomain?.name} Questions
          </h2>
          <span className="question-count">{filteredQuestions.length} results</span>
        </div>

        <div className="flex flex-wrap gap-4 border bg-(--background) border-(--border) rounded-xl p-4">
          {/* Search Input with Icon */}
          <div className="relative flex-1 min-w-60
">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2  pointer-events-none
" size={18} />
            <input
              type="text"
              placeholder="Search keywords..."
              aria-label="Search keywords"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-(--card) rounded-xl border-2 border-(--border) "
            />
          </div>

          {/* Filter Select with Icon */}
          <div className="flex flex-wrap gap-4 border border-(--border) rounded-lg p-3
">
            {/* <Filter className=" left-3.5 top-2 -translate-y-1/2  pointer-events-none" size={18} /> */}
            <select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              aria-label="Filter by difficulty"
              className="bg-(--card) border border-(--border) rounded-lg px-3 py-2 text-sm cursor-pointer"
            >
              <option value="All">All Difficulties</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1  sm:grid-cols-2 md:grid-cols-3 gap-5 m-8 bg-(--background) text-(--foreground)">
        {filteredQuestions.length > 0 ? (
          filteredQuestions.map((q) => {
            const isAnswerVisible = visibleAnswerId === q.id;
            const answerBoxId = `answer-box-${q.id}`;
            return (
              <div key={q.id} className={`bg-(--card) p-8 rounded-2xl shadow-sm border border-slate-200 transition-all duration-300 ease-in-out relative
 ${isAnswerVisible ? 'ring-2 ring-(--primary)' : ''}`}>
                <div className="flex justify-between mb-4
">
                  <span className={`inline-block px-3 p-1.5 rounded-full text-xs font-bold uppercase tracking-wide
 ${DIFFICULTY_BADGE_CLASSES[q.difficulty.toLowerCase()] || 'bg-(--background)'}`}>
                    {q.difficulty}
                  </span>
                </div>

                <h3 className="text-xl font-bold  leading-snug mb-6
">{q.question}</h3>

                <button
                  className="inline-flex items-center gap-2 rounded-md border border-(--border) bg-(--background) px-4 py-2 text-sm font-semibold text-(--foreground) transition hover:border-(--primary) focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)/35 cursor-pointer"
                  onClick={() => toggleAnswer(q.id)}
                  aria-expanded={isAnswerVisible}
                  aria-controls={answerBoxId}
                >
                  {isAnswerVisible ? 'Hide Answer' : 'Show Answer'}
                  {isAnswerVisible ? <ChevronUp size={18}/> : <ChevronDown size={18}/>}
                </button>

                {isAnswerVisible && (
                  <div id={answerBoxId} className="mt-4 pt-4 border-t border-(--border) transition-all duration-300 ease-in-out">
                    <p>{q.answer}</p>
                  </div>
                )}
              </div>
            )
          })
        ) : (
          <div className="flex flex-col items-center gap-4 text-center p-16  bg-(--card) rounded-2xl border-2 border-dashed border-slate-200 text-lg
">
            <Search size={40} style={{opacity: 0.3}} />
            <p>No questions found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionBank;