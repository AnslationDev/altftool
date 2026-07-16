"use client";

import { useMemo } from "react";
import {
  MessageSquare,
  User,
  Bot,
  Type,
  FileCode,
  Table,
  Image,
  Link,
  Clock,
  BookOpen,
  BarChart3,
} from "lucide-react";
import { extractStats } from "../utils/parser";

export default function Statistics({ conversation }) {
  const stats = useMemo(
    () => extractStats(conversation),
    [conversation]
  );

  if (!conversation?.messages?.length) return null;

  const statItems = [
    { label: "Total Messages", value: stats.totalMessages, icon: MessageSquare, color: "text-primary" },
    { label: "User Messages", value: stats.userMessages, icon: User, color: "text-blue-500" },
    { label: "Assistant Messages", value: stats.assistantMessages, icon: Bot, color: "text-emerald-500" },
    { label: "Word Count", value: stats.wordCount.toLocaleString(), icon: BookOpen, color: "text-violet-500" },
    { label: "Character Count", value: stats.charCount.toLocaleString(), icon: Type, color: "text-amber-500" },
    { label: "Code Blocks", value: stats.codeBlocks, icon: FileCode, color: "text-cyan-500" },
    { label: "Tables", value: stats.tables, icon: Table, color: "text-rose-500" },
    { label: "Images", value: stats.images, icon: Image, color: "text-pink-500" },
    { label: "Links", value: stats.links, icon: Link, color: "text-indigo-500" },
    { label: "Reading Time", value: `${stats.readingTime} min`, icon: Clock, color: "text-orange-500" },
  ];

  return (
    <div className="rounded-xl border border-[--border] bg-[--surface] p-4">
      <div className="mb-3 flex items-center gap-2">
        <BarChart3 className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold text-[--foreground]">
          Statistics
        </h3>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {statItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="flex flex-col items-center gap-1 rounded-lg bg-[--surface-soft] p-3 text-center"
            >
              <Icon className={`h-4 w-4 ${item.color}`} />
              <span className="text-lg font-bold text-[--foreground]">
                {item.value}
              </span>
              <span className="text-xs text-[--muted]">{item.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
