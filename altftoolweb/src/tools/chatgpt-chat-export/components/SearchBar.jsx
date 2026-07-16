"use client";

import { Search, X, Filter, User, Bot, Code, MessageSquare, HelpCircle } from "lucide-react";

export default function SearchBar({
  searchQuery,
  onSearchChange,
  filterRole,
  onFilterRoleChange,
  filterCode,
  onFilterCodeChange,
  totalMessages,
}) {
  const filters = [
    { value: "all", label: "All", icon: MessageSquare },
    { value: "user", label: "User", icon: User },
    { value: "assistant", label: "Assistant", icon: Bot },
  ];

  const codeFilters = [
    { value: "", label: "All", icon: MessageSquare },
    { value: "has-code", label: "Has Code", icon: Code },
    { value: "questions", label: "Questions", icon: HelpCircle },
    { value: "answers", label: "Answers", icon: MessageSquare },
  ];

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[--muted]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search messages..."
          className="w-full rounded-lg border border-[--border] bg-[--surface] py-2.5 pl-10 pr-10 text-sm text-[--foreground] placeholder:text-[--muted] focus:border-primary focus:outline-none focus:ring-3 focus:ring-primary/20"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-0.5 text-[--muted] transition-colors hover:text-[--foreground]"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <div className="flex items-center gap-1.5">
          <Filter className="h-3.5 w-3.5 text-[--muted]" />
          <span className="text-xs font-medium text-[--muted]">Role:</span>
        </div>
        {filters.map((f) => {
          const Icon = f.icon;
          const isActive = filterRole === f.value || (!filterRole && f.value === "all");
          return (
            <button
              key={f.value}
              onClick={() => onFilterRoleChange(f.value === "all" ? "" : f.value)}
              className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                isActive
                  ? "bg-primary text-white"
                  : "bg-[--surface-soft] text-[--muted] hover:text-[--foreground]"
              }`}
            >
              <Icon className="h-3 w-3" />
              {f.label}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2">
        <div className="flex items-center gap-1.5">
          <Code className="h-3.5 w-3.5 text-[--muted]" />
          <span className="text-xs font-medium text-[--muted]">Type:</span>
        </div>
        {codeFilters.map((f) => {
          const Icon = f.icon;
          const isActive = filterCode === f.value || (!filterCode && f.value === "");
          return (
            <button
              key={f.value}
              onClick={() => onFilterCodeChange(f.value === "" ? "" : f.value)}
              className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                isActive
                  ? "bg-primary text-white"
                  : "bg-[--surface-soft] text-[--muted] hover:text-[--foreground]"
              }`}
            >
              <Icon className="h-3 w-3" />
              {f.label}
            </button>
          );
        })}
      </div>

      <p className="text-xs text-[--muted]">
        {totalMessages} messages in conversation
      </p>
    </div>
  );
}
