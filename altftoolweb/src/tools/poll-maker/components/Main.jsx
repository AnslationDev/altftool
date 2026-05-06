"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import PollChart from "./PollChart";
import Description from "../components/Description";
import Comments from "../components/Comments";
import TrendingPolls from "../components/TrendingPolls";
import VoteAnimation from "../components/VoteAnimation";
import PredictMode from "../components/PredictMode";
import Gamification from "../components/Gamification";
import Insights from "../components/Insights";
import useReactions from "../components/Reactions";
import VoiceRecorder from "../components/VoiceRecorder";
import ShareCard from "../components/ShareCard";
import PollTimer from "../components/PollTimer";
import GuessWinner from "../components/GuessWinner";
import VoterSystem from "../components/VoterSystem";
import ThemeSelector from "../components/ThemeSelector";
import ImageUploader from "../components/ImageUploader";
import RandomPoll from "../components/RandomPoll";

import { ThumbsUp, Heart, Laugh, Angry, Flame, TrendingDown, Zap } from "lucide-react";
import ManagedImage from "@/components/ui/ManagedImage";

const Confetti = dynamic(() => import("react-confetti"), { ssr: false });

export default function PollMaker() {
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState(["", ""]);
  const [votes, setVotes] = useState([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [isExpired, setIsExpired] = useState(false);
  const { activeIndex, triggerAnimation } = VoteAnimation();
  const { hideResults, setHideResults, hasVoted, setHasVoted } = PredictMode();
  const { points, message, updateGamification } = Gamification();
  const { insight, generateInsights } = Insights();
  const { reactions, addReaction } = useReactions();
  const guessRef = useRef(null);
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [voters, setVoters] = useState({});
  const [theme, setTheme] = useState("dark");
  const [optionImages, setOptionImages] = useState([]);
  const [showSavedMsg, setShowSavedMsg] = useState(false);
  const [showDraftSaved, setShowDraftSaved] = useState(false);

  const mockUsers = [
    "Aman",
    "Riya",
    "Rahul",
    "Sneha",
    "Karan",
    "Priya",
    "Arjun",
    "Neha",
    "Vikas",
    "Simran",
  ];

  // (icon mapping)
  const reactionIcons = {
  like: { icon: ThumbsUp, color: "text-blue-500" },
  love: { icon: Heart, color: "text-red-500" },
  laugh: { icon: Laugh, color: "text-yellow-500" },
  angry: { icon: Angry, color: "text-orange-500" },
  shocked: { icon: Flame, color: "text-purple-500" },
};

  useEffect(() => {
    const updateSize = () =>
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // FIX: load voters from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("poll_voters");
    if (saved) {
      setVoters(JSON.parse(saved));
    }
  }, []);

  // NEW: LOAD DRAFT
  useEffect(() => {
    const savedDraft = localStorage.getItem("poll_draft");

    if (savedDraft) {
      const parsed = JSON.parse(savedDraft);

      if (parsed.pollQuestion) setPollQuestion(parsed.pollQuestion);
      if (parsed.pollOptions) setPollOptions(parsed.pollOptions);
      if (parsed.optionImages) setOptionImages(parsed.optionImages);
      if (parsed.theme) setTheme(parsed.theme);
    }
  }, []);

  //  AUTO SAVE
  useEffect(() => {
    const draft = {
      pollQuestion,
      pollOptions,
      optionImages,
      theme,
    };

    localStorage.setItem("poll_draft", JSON.stringify(draft));
    setShowSavedMsg(true);

    setTimeout(() => {
      setShowSavedMsg(false);
    }, 1500);
  }, [pollQuestion, pollOptions, optionImages, theme]);

  const handleOptionChange = (index, value) => {
    const newOptions = [...pollOptions];
    newOptions[index] = value;
    setPollOptions(newOptions);
  };

  const addOption = () => setPollOptions([...pollOptions, ""]);

  const createPoll = () => {
    if (
      pollQuestion.trim() === "" ||
      pollOptions.some((opt) => opt.trim() === "")
    ) {
      alert("Please enter question and all options!");
      return;
    }
    setVotes(new Array(pollOptions.length).fill(0));
  };
  // handle multi select click
  const handleSelectOption = (index) => {
    if (selectedOptions.includes(index)) {
      setSelectedOptions(selectedOptions.filter((i) => i !== index));
    } else {
      setSelectedOptions([...selectedOptions, index]);
    }
  };

  const handleVote = (index) => {
    triggerAnimation(index);
    setHasVoted(true);

    const newVotes = [...votes];
    newVotes[index] += 1;

    setVotes(newVotes);
    updateGamification(newVotes, index);
    generateInsights(pollOptions, newVotes);

    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 1500);

    if (guessRef.current) {
      guessRef.current.lockGuess();
    }

    if (!isAnonymous) {
      let randomUser; 

      const usedUsers = Object.values(voters).flat();

      const availableUsers = mockUsers.filter(
        (user) => !usedUsers.includes(user),
      );

      if (availableUsers.length === 0) {
        const currentOptionUsers = voters[index] || [];

        const reusableUsers = mockUsers.filter(
          (user) => !currentOptionUsers.includes(user),
        );

        randomUser =
          reusableUsers[Math.floor(Math.random() * reusableUsers.length)];
      } else {
        randomUser =
          availableUsers[Math.floor(Math.random() * availableUsers.length)];
      }

      //  STEP 5: update voters
      const updated = {
        ...voters,
        [index]: [...(voters[index] || []), randomUser],
      };

      setVoters(updated);
      localStorage.setItem("poll_voters", JSON.stringify(updated));
    }
  };

  //  submit multi votes
  const handleMultiVote = () => {
    if (selectedOptions.length === 0) {
      alert("Select at least one option");
      return;
    }

    const newVotes = [...votes];

    selectedOptions.forEach((index) => {
      newVotes[index] += 1;
    });

    setVotes(newVotes);
    setHasVoted(true);
    updateGamification(newVotes, selectedOptions[0]);
    generateInsights(pollOptions, newVotes);

    setSelectedOptions([]);

    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 1500);
  };
  return (
    <div
      className={`min-h-screen text-(--foreground)  px-4 py-10
  ${theme === "dark" ? "bg-(--background)" : ""}
  ${theme === "gradient" ? "bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500" : ""}
  ${theme === "glass" ? "bg-(--background)" : ""}
  ${theme === "neon" ? "bg-black" : ""}
`}
    >
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={80}
        />
      )}

      <div className="max-w-3xl mx-auto space-y-8">
        {/* Title */}
        <h1 className="heading text-center">Poll Maker</h1>
        {/*  Draft Saved Message BELOW HEADING */}
        {showDraftSaved && (
          <div className="flex justify-center mt-2">
            <p className="text-sm text-green-500 font-medium animate-fade-in">
               Draft saved
            </p>
          </div>
        )}

        <p className="description mt-4 max-w-2xl mx-auto text-center">
          Create interactive polls quickly and collect real-time responses.
        </p>
        {/* Create Poll Card */}
        <div
          className={`rounded-2xl p-6 shadow-md space-y-4 border
  ${
    theme === "glass"
      ? "bg-white/10 backdrop-blur-md border-white/20"
      : "bg-(--card) border-(--border)"
  }
  ${theme === "neon" ? "border-pink-500 shadow-[0_0_20px_#ff00ff]" : ""}
`}
        >
          <input
            type="text"
            placeholder="Enter your question"
            value={pollQuestion}
            onChange={(e) => setPollQuestion(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-(--background) border border-(--border) focus:ring-2 focus:ring-(--primary) outline-none transition"
          />
          <RandomPoll
            setPollQuestion={setPollQuestion}
            setPollOptions={setPollOptions}
            setVotes={setVotes}
          />
          <VoiceRecorder />

          {pollOptions.map((option, index) => (
            <div key={index}>
              <input
                type="text"
                placeholder={`Option ${index + 1}`}
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-(--background) border border-(--border) focus:ring-2 focus:ring-(--primary) outline-none transition"
              />

              {/*  ImageUploader */}
              <ImageUploader
                index={index}
                optionImages={optionImages}
                setOptionImages={setOptionImages}
              />
            </div>
          ))}

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={addOption}
              className="flex-1 px-4 py-3 rounded-xl bg-(--primary) text-white font-medium hover:opacity-90 transition cursor-pointer"
            >
              <span className="text-2xl"> + </span> Add Option
            </button>

            <button
              onClick={createPoll}
              className="flex-1 px-4 py-3 rounded-xl bg-linear-to-r from-green-600 to-emerald-600 text-white font-medium hover:opacity-90 transition cursor-pointer"
            >
              Create Poll
            </button>
            <div className="flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                checked={hideResults}
                onChange={(e) => setHideResults(e.target.checked)}
                className="cursor-pointer"
              />
              <label className="text-sm text-(--muted-foreground)">
                Hide results until vote
              </label>

              <div className="flex items-center gap-2 mt-1">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="cursor-pointer"
                />
                <label className="text-sm text-(--muted-foreground)">
                  Anonymous voting
                </label>
              </div>
            </div>
          </div>
        </div>
        {/* Theme Selector BELOW */}
        <div className="bg-(--card) border border-(--border) rounded-2xl p-4 shadow-sm">
          <ThemeSelector theme={theme} setTheme={setTheme} />
        </div>

        {/* Voting Card */}
        {votes.length > 0 && (
          <div
            className={`rounded-2xl p-6 shadow-md space-y-4 border
  ${
    theme === "glass"
      ? "bg-white/10 backdrop-blur-md border-white/20"
      : "bg-(--card) border-(--border)"
  }
  ${theme === "neon" ? "border-pink-500 shadow-[0_0_20px_#ff00ff]" : ""}
`}
          >
            <h2 className="text-xl font-semibold text-center">
              {pollQuestion}
            </h2>
            <PollTimer duration={60} onExpire={() => setIsExpired(true)} />
            <GuessWinner ref={guessRef} options={pollOptions} votes={votes} />

            <div className="flex flex-col gap-3 ">
              {pollOptions.map((option, index) => (
                <button
                  key={index}
                  onClick={() => !isExpired && handleVote(index)}
                  disabled={isExpired}
                  className={`px-4 py-3 rounded-xl bg-(--muted) hover:bg-(--primary) hover:text-white transition font-medium cursor-pointer ${
                    theme === "neon"
                      ? "bg-black border border-pink-500 text-pink-400 hover:bg-pink-500 hover:text-white"
                      : "bg-(--muted) hover:bg-(--primary) hover:text-white"
                  }
                    activeIndex === index ? "animate-pulse-soft" : ""
                  } `}
                >
                  {/*  ImageUpload + Text */}
                  <div className="flex flex-col items-center gap-2">
                    {optionImages[index] && (
                      <ManagedImage
                        src={optionImages[index]}
                        alt="option"
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    )}
                    <span>{option}</span>
                  </div>
                </button>
              ))}
            </div>
            <VoterSystem
              pollOptions={pollOptions}
              voters={voters}
              setVoters={setVoters}
              isAnonymous={isAnonymous}
            />
            {/* vote points */}
            {message && (
              <div className="text-center mt-4 space-y-1">
                <p className="text-(--foreground) font-semibold">{message}</p>
                <p className="text-sm text-(--muted-foreground)">
                  ⭐ Points: {points}
                </p>
              </div>
            )}
            {/* Insights  */}
            {insight && (
              <div className="text-center mt-4 space-y-1 text-sm sm:text-base">
                <p>🔥 Most popular: {insight.popular}</p>
                <p>🐢 Underdog: {insight.underdog}</p>
                {insight.close && <p>⚡ Close competition</p>}
              </div>
            )}
          </div>
        )}

        {/* Chart */}
        {votes.length > 0 && (!hideResults || hasVoted) && (
          <div
            className={`p-4 rounded-2xl  border flex justify-center items-center
    ${
      theme === "glass"
        ? "bg-white/10 backdrop-blur-md border-white/20"
        : "bg-(--card) border-(--border)"
    }
    ${theme === "neon" ? "border-pink-500 shadow-[0_0_20px_#ff00ff]" : ""}
  `}
          >
            <div className="w-full max-w-[500px] flex justify-center ">
              <PollChart options={pollOptions} votes={votes} />
            </div>
          </div>
        )}
        {/* Share Card */}
        {votes.length > 0 && (
          <ShareCard
            question={pollQuestion}
            options={pollOptions}
            votes={votes}
          />
        )}

        {/* reactions  */}
        {votes.length > 0 && (
          <div className="flex justify-center gap-4 mt-4 flex-wrap">
            {Object.entries(reactions).map(([type, count]) => {
              const {icon: Icon, color } = reactionIcons[type];

              return (
                <button
                  key={type}
                  onClick={() => addReaction(type)}
                  className={`px-3 py-2 rounded-full transition cursor-pointer text-sm sm:text-base flex items-center gap-2
${
  theme === "neon"
    ? "bg-black border border-pink-500 text-pink-400 hover:bg-pink-500 hover:text-white"
    : "bg-(--muted) hover:bg-(--primary) hover:text-white"
}
`}
                >
                  <Icon size={16} className={color} />
                  {count}
                </button>
              );
            })}
          </div>
        )}
        {/* Comments */}
        {votes.length > 0 && <Comments />}
        {/* rending Polls */}
        {votes.length > 0 && <TrendingPolls />}

        <Description />
      </div>
    </div>
  );
}
