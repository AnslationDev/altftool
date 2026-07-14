"use client";

import { useState, useEffect } from "react";
import {
  Vote,
  Clock,
  Users,
  BarChart3,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import ResultsChart from "./ResultsChart";

const PollCard = ({ poll, session, onVote }) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const votedOption = session[poll.id];
  const isClosed = poll.status === "closed";
  const isExpired = poll.deadline && new Date(poll.deadline) < new Date();
  const isDisabled = isClosed || isExpired || hasVoted || votedOption !== undefined;

  useEffect(() => {
    if (votedOption !== undefined) {
      setHasVoted(true);
      setShowResults(true);
    }
  }, [votedOption]);

  const formatDeadline = (dateStr) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    const now = new Date();
    const diff = date - now;
    if (diff <= 0) return "Expired";
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    if (days > 0) return `${days}d ${hours}h remaining`;
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${mins}m remaining`;
  };

  const deadlineText = formatDeadline(poll.deadline);

  const handleVoteClick = () => {
    if (selectedOption === null) return;
    setShowConfirm(true);
  };

  const confirmVote = () => {
    const success = onVote(poll.id, selectedOption);
    if (success) {
      setHasVoted(true);
      setShowResults(true);
    }
    setShowConfirm(false);
  };

  return (
    <div className="rounded-2xl p-6 shadow-md border bg-(--card) border-(--border) space-y-4">
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-bold text-(--foreground)">{poll.title}</h3>
          <span
            className={`shrink-0 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
              isClosed
                ? "bg-[var(--anslation-ds-danger-soft)] text-[var(--anslation-ds-danger)]"
                : "bg-[var(--anslation-ds-success-soft)] text-[var(--anslation-ds-success)]"
            }`}
          >
            {isClosed ? "Closed" : "Active"}
          </span>
        </div>

        {poll.description && (
          <p className="text-sm text-(--muted-foreground)">{poll.description}</p>
        )}

        <div className="flex flex-wrap items-center gap-3 text-xs text-(--muted-foreground)">
          {poll.organizer && (
            <span className="flex items-center gap-1">
              <Users size={12} /> {poll.organizer}
            </span>
          )}
          <span className="flex items-center gap-1">
            <BarChart3 size={12} /> {poll.totalVotes} vote{poll.totalVotes !== 1 ? "s" : ""}
          </span>
          {deadlineText && (
            <span className={`flex items-center gap-1 ${isExpired ? "text-[var(--anslation-ds-danger)]" : ""}`}>
              <Clock size={12} /> {deadlineText}
            </span>
          )}
          {poll.anonymous && (
            <span className="px-1.5 py-0.5 rounded bg-(--muted) text-(--muted-foreground)">Anonymous</span>
          )}
        </div>
      </div>

      {!showResults && !isDisabled && (
        <div className="space-y-2">
          {poll.options.map((option, index) => (
            <button
              key={index}
              onClick={() => setSelectedOption(index)}
              className={`w-full text-left px-4 py-3 rounded-xl border transition font-medium cursor-pointer ${
                selectedOption === index
                  ? "bg-(--primary) text-(--primary-foreground) border-(--primary)"
                  : "bg-(--muted) text-(--foreground) border-(--border) hover:border-(--primary)"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      )}

      {!showResults && !isDisabled && (
        <button
          onClick={handleVoteClick}
          disabled={selectedOption === null}
          className={`w-full px-4 py-3 rounded-xl font-medium transition cursor-pointer flex items-center justify-center gap-2 ${
            selectedOption !== null
              ? "bg-(--primary) text-(--primary-foreground) hover:opacity-90"
              : "bg-(--muted) text-(--muted-foreground) cursor-not-allowed"
          }`}
        >
          <Vote size={18} /> Submit Vote
        </button>
      )}

      {isDisabled && !showResults && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-(--muted) text-(--muted-foreground) text-sm">
          {isClosed ? (
            <><AlertCircle size={16} /> This poll is closed</>
          ) : isExpired ? (
            <><Clock size={16} /> Voting deadline has passed</>
          ) : (
            <><CheckCircle2 size={16} /> You have already voted</>
          )}
        </div>
      )}

      {showResults && (
        <ResultsChart poll={poll} />
      )}

      {!showResults && !isDisabled && hasVoted && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-(--anslation-ds-success-soft) text-[var(--anslation-ds-success)] text-sm font-medium">
          <CheckCircle2 size={16} /> Vote recorded successfully!
        </div>
      )}

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowConfirm(false)} />
          <div className="relative w-full max-w-sm rounded-2xl bg-(--card) border border-(--border) shadow-2xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-(--foreground)">Confirm Your Vote</h3>
            <p className="text-sm text-(--muted-foreground)">
              You are voting for: <span className="font-semibold text-(--foreground)">{poll.options[selectedOption]}</span>
            </p>
            <p className="text-xs text-(--muted-foreground)">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 px-4 py-2.5 rounded-lg border border-(--border) text-(--foreground) hover:bg-(--muted) transition font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmVote}
                className="flex-1 px-4 py-2.5 rounded-lg bg-(--primary) text-(--primary-foreground) hover:opacity-90 transition font-medium cursor-pointer"
              >
                Confirm Vote
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PollCard;
