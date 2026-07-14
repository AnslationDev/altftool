"use client";

import { useState, useEffect, useCallback } from "react";
import { loadPolls, savePolls, loadSession, saveSession } from "../utils/storage";

const generateId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

export default function usePolls() {
  const [polls, setPolls] = useState([]);
  const [session, setSession] = useState({});
  const [toast, setToast] = useState({ open: false, message: "", type: "info" });

  useEffect(() => {
    setPolls(loadPolls());
    setSession(loadSession());
  }, []);

  useEffect(() => {
    if (polls.length > 0) savePolls(polls);
  }, [polls]);

  useEffect(() => {
    if (Object.keys(session).length > 0) saveSession(session);
  }, [session]);

  const showToast = useCallback((message, type = "info") => {
    setToast({ open: true, message, type });
    setTimeout(() => setToast({ open: false, message: "", type: "info" }), 3000);
  }, []);

  const createPoll = useCallback((pollData) => {
    const { title, description, organizer, options, deadline, anonymous } = pollData;

    if (!title.trim()) {
      showToast("Please enter a poll title", "error");
      return false;
    }

    const validOptions = options.filter((o) => o.trim());
    if (validOptions.length < 2) {
      showToast("Please add at least 2 voting options", "error");
      return false;
    }

    const lowerOptions = validOptions.map((o) => o.trim().toLowerCase());
    const uniqueOptions = new Set(lowerOptions);
    if (uniqueOptions.size !== lowerOptions.length) {
      showToast("Voting options must be unique", "error");
      return false;
    }

    const newPoll = {
      id: generateId(),
      title: title.trim(),
      description: description.trim(),
      organizer: organizer.trim(),
      options: validOptions.map((o) => o.trim()),
      votes: new Array(validOptions.length).fill(0),
      deadline: deadline || null,
      anonymous: anonymous,
      status: "active",
      createdAt: new Date().toISOString(),
      totalVotes: 0,
    };

    setPolls((prev) => [newPoll, ...prev]);
    showToast("Poll created successfully!", "success");
    return true;
  }, [showToast]);

  const votePoll = useCallback((pollId, optionIndex) => {
    if (session[pollId]) {
      showToast("You have already voted in this poll", "error");
      return false;
    }

    setPolls((prev) =>
      prev.map((poll) => {
        if (poll.id !== pollId) return poll;
        const newVotes = [...poll.votes];
        newVotes[optionIndex] += 1;
        return { ...poll, votes: newVotes, totalVotes: poll.totalVotes + 1 };
      })
    );

    setSession((prev) => ({ ...prev, [pollId]: optionIndex }));
    showToast("Vote submitted successfully!", "success");
    return true;
  }, [session, showToast]);

  const deletePoll = useCallback((pollId) => {
    setPolls((prev) => prev.filter((poll) => poll.id !== pollId));
    setSession((prev) => {
      const next = { ...prev };
      delete next[pollId];
      return next;
    });
    showToast("Poll deleted", "success");
  }, [showToast]);

  const resetVotes = useCallback((pollId) => {
    setPolls((prev) =>
      prev.map((poll) => {
        if (poll.id !== pollId) return poll;
        return { ...poll, votes: new Array(poll.options.length).fill(0), totalVotes: 0 };
      })
    );
    setSession((prev) => {
      const next = { ...prev };
      delete next[pollId];
      return next;
    });
    showToast("Votes reset successfully", "success");
  }, [showToast]);

  const closePoll = useCallback((pollId) => {
    setPolls((prev) =>
      prev.map((poll) => (poll.id === pollId ? { ...poll, status: "closed" } : poll))
    );
    showToast("Poll closed", "success");
  }, [showToast]);

  const reopenPoll = useCallback((pollId) => {
    setPolls((prev) =>
      prev.map((poll) => (poll.id === pollId ? { ...poll, status: "active" } : poll))
    );
    showToast("Poll reopened", "success");
  }, [showToast]);

  const exportResults = useCallback((pollId, format = "json") => {
    const poll = polls.find((p) => p.id === pollId);
    if (!poll) return;

    let content;
    let filename;
    let mimeType;

    if (format === "csv") {
      const header = "Option,Votes,Percentage\n";
      const rows = poll.options
        .map((opt, i) => {
          const pct = poll.totalVotes > 0 ? ((poll.votes[i] / poll.totalVotes) * 100).toFixed(1) : 0;
          return `"${opt}",${poll.votes[i]},${pct}%`;
        })
        .join("\n");
      content = `Poll: ${poll.title}\nDescription: ${poll.description}\nOrganizer: ${poll.organizer}\nStatus: ${poll.status}\nTotal Votes: ${poll.totalVotes}\n\n${header}${rows}`;
      filename = `${poll.title.replace(/\s+/g, "_")}_results.csv`;
      mimeType = "text/csv";
    } else {
      content = JSON.stringify(poll, null, 2);
      filename = `${poll.title.replace(/\s+/g, "_")}_results.json`;
      mimeType = "application/json";
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Results exported as ${format.toUpperCase()}`, "success");
  }, [polls, showToast]);

  return {
    polls,
    session,
    toast,
    createPoll,
    votePoll,
    deletePoll,
    resetVotes,
    closePoll,
    reopenPoll,
    exportResults,
    showToast,
  };
}
