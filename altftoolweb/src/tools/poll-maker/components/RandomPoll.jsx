"use client";

import { Dices } from "lucide-react";

export default function RandomPoll({
  setPollQuestion,
  setPollOptions,
  setVotes,
}) {
  //  Dummy polls
  const polls = [
    {
      question: "Tea or Coffee?",
      options: ["Tea", "Coffee"],
    },
    {
      question: "iOS vs Android?",
      options: ["iOS", "Android"],
    },
    {
      question: "Work from Home, Office or Hybrid?",
      options: ["WFH", "Office", "Hybrid"],
    },
    {
      question: "Netflix or YouTube?",
      options: ["Netflix", "YouTube"],
    },
    {
    question: "Best Programming Language?",
    options: ["JavaScript", "Python", "Java", "C++"],
  },
  {
    question: "Favorite Social Media?",
    options: ["Instagram", "Twitter", "LinkedIn"],
  },
  {
    question: "What do you watch most?",
    options: ["Movies", "Web Series", "YouTube", "TV Shows", "Anime"],
  },
  {
    question: "Best Meal of the Day?",
    options: ["Breakfast", "Lunch", "Dinner"],
  },

  ];

  const handleRandomPoll = () => {
    const random = polls[Math.floor(Math.random() * polls.length)];

    setPollQuestion(random.question);
    setPollOptions(random.options);

    //  Reset votes (fresh poll)
    setVotes([]);
  };

  return (
    <button
      onClick={handleRandomPoll}
      className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-(--muted) hover:bg-(--primary) hover:text-white transition"
    >
      <Dices className="text-purple-500" size={18} />
      Show Random Poll
    </button>
  );
}