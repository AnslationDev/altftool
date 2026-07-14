"use client";

import { useState, useEffect } from "react";
import { Trophy, Minus } from "lucide-react";

const ResultsChart = ({ poll }) => {
  const [animatedWidths, setAnimatedWidths] = useState(
    poll.options.map(() => 0)
  );

  const maxVotes = Math.max(...poll.votes, 1);
  const winnerIndex = poll.votes.indexOf(Math.max(...poll.votes));
  const isTie = poll.votes.filter((v) => v === Math.max(...poll.votes)).length > 1;

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedWidths(
        poll.options.map((_, i) =>
          poll.totalVotes > 0 ? (poll.votes[i] / poll.totalVotes) * 100 : 0
        )
      );
    }, 100);
    return () => clearTimeout(timer);
  }, [poll.votes, poll.totalVotes, poll.options]);

  return (
    <div className="space-y-3">
      {poll.options.map((option, index) => {
        const percentage = poll.totalVotes > 0
          ? ((poll.votes[index] / poll.totalVotes) * 100).toFixed(1)
          : 0;
        const isWinner = !isTie && poll.votes[index] === Math.max(...poll.votes) && poll.totalVotes > 0;

        return (
          <div key={index} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-(--foreground) flex items-center gap-1.5">
                {option}
                {isWinner && (
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-[var(--anslation-ds-warning-soft)] text-[var(--anslation-ds-warning)] text-xs font-semibold">
                    <Trophy size={10} /> Winner
                  </span>
                )}
              </span>
              <span className="text-sm text-(--muted-foreground)">
                {poll.votes[index]} vote{poll.votes[index] !== 1 ? "s" : ""} ({percentage}%)
              </span>
            </div>
            <div className="w-full h-3 rounded-full bg-(--muted) overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${animatedWidths[index]}%`,
                  backgroundColor: isWinner
                    ? "var(--anslation-ds-primary)"
                    : "var(--anslation-ds-secondary)",
                }}
              />
            </div>
          </div>
        );
      })}

      <div className="flex items-center justify-center gap-4 pt-3 border-t border-(--border) mt-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-(--foreground)">{poll.totalVotes}</p>
          <p className="text-xs text-(--muted-foreground)">Total Votes</p>
        </div>
        {isTie && poll.totalVotes > 0 && (
          <div className="flex items-center gap-1.5 text-sm text-(--muted-foreground)">
            <Minus size={14} /> Tie detected
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultsChart;
