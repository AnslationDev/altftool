"use client";

import { useState, useMemo } from "react";
import { PlusCircle, BarChart3, Vote } from "lucide-react";
import usePolls from "../hooks/usePolls";
import CreatePoll from "./CreatePoll";
import PollCard from "./PollCard";
import PollSearch from "./PollSearch";
import AdminPanel from "./AdminPanel";
import Description from "./Description";

export default function Main() {
  const {
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
  } = usePolls();

  const [showCreate, setShowCreate] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [activeTab, setActiveTab] = useState("polls");

  const filteredPolls = useMemo(() => {
    let result = [...polls];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          (p.organizer && p.organizer.toLowerCase().includes(q))
      );
    }

    if (statusFilter !== "all") {
      result = result.filter((p) => p.status === statusFilter);
    }

    result.sort((a, b) => {
      if (sortBy === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
      return new Date(a.createdAt) - new Date(b.createdAt);
    });

    return result;
  }, [polls, searchQuery, statusFilter, sortBy]);

  const stats = useMemo(() => {
    const total = polls.length;
    const active = polls.filter((p) => p.status === "active").length;
    const closed = polls.filter((p) => p.status === "closed").length;
    const totalVotes = polls.reduce((sum, p) => sum + p.totalVotes, 0);
    return { total, active, closed, totalVotes };
  }, [polls]);

  return (
    <div className="min-h-screen bg-(--background) text-(--foreground) px-4 py-10">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="heading">Mobile Voting App</h1>
          <p className="description mt-4 max-w-2xl mx-auto text-center">
            Create real-time voting and polling apps for elections, team decisions, live events, and community feedback.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total Polls", value: stats.total, icon: BarChart3 },
            { label: "Active", value: stats.active, icon: Vote },
            { label: "Closed", value: stats.closed, icon: BarChart3 },
            { label: "Total Votes", value: stats.totalVotes, icon: Vote },
          ].map((stat, i) => (
            <div
              key={i}
              className="rounded-xl p-4 border bg-(--card) border-(--border) shadow-sm text-center"
            >
              <stat.icon size={18} className="mx-auto mb-1.5 text-(--primary)" />
              <p className="text-xl font-bold text-(--foreground)">{stat.value}</p>
              <p className="text-xs text-(--muted-foreground)">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => setShowCreate(!showCreate)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition cursor-pointer ${
              showCreate
                ? "bg-(--muted) text-(--muted-foreground) border border-(--border)"
                : "bg-(--primary) text-(--primary-foreground) hover:opacity-90"
            }`}
          >
            <PlusCircle size={18} />
            {showCreate ? "Close Form" : "Create New Poll"}
          </button>

          <div className="flex bg-(--card) border border-(--border) rounded-xl overflow-hidden">
            {["polls", "admin"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 px-4 py-3 text-sm font-medium transition cursor-pointer ${
                  activeTab === tab
                    ? "bg-(--primary) text-(--primary-foreground)"
                    : "text-(--muted-foreground) hover:text-(--foreground)"
                }`}
              >
                {tab === "polls" ? "All Polls" : "Admin"}
              </button>
            ))}
          </div>
        </div>

        {showCreate && (
          <CreatePoll onCreate={(data) => {
            const success = createPoll(data);
            if (success) setShowCreate(false);
          }} />
        )}

        {polls.length > 0 && (
          <PollSearch
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            sortBy={sortBy}
            setSortBy={setSortBy}
          />
        )}

        {activeTab === "admin" && polls.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-(--foreground)">Admin Panel</h2>
            {polls.map((poll) => (
              <AdminPanel
                key={poll.id}
                poll={poll}
                onDelete={deletePoll}
                onResetVotes={resetVotes}
                onClose={closePoll}
                onReopen={reopenPoll}
                onExport={exportResults}
              />
            ))}
          </div>
        )}

        {activeTab === "polls" && (
          <div className="space-y-4">
            {filteredPolls.length === 0 ? (
              <div className="p-10 text-center border-2 border-(--border) border-dashed bg-(--card) rounded-2xl">
                <h3 className="text-2xl font-semibold text-(--muted-foreground)">
                  {polls.length === 0 ? "No polls yet" : "No matching polls"}
                </h3>
                <p className="text-(--muted-foreground) mt-2">
                  {polls.length === 0
                    ? "Create your first poll to get started!"
                    : "Try adjusting your search or filter criteria."}
                </p>
              </div>
            ) : (
              filteredPolls.map((poll) => (
                <PollCard
                  key={poll.id}
                  poll={poll}
                  session={session}
                  onVote={votePoll}
                />
              ))
            )}
          </div>
        )}

        <Description />
      </div>

      {toast.open && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50">
          <div
            className={`px-5 py-3 rounded-lg shadow-lg text-sm flex items-center gap-3 text-white ${
              toast.type === "success"
                ? "bg-[var(--anslation-ds-success)]"
                : toast.type === "error"
                ? "bg-[var(--anslation-ds-danger)]"
                : "bg-[var(--anslation-ds-info)]"
            }`}
          >
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}
