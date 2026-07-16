"use client";

import { useState } from "react";
import {
  Search,
  Replace,
  Trash2,
  Merge,
  Split,
  PenLine,
  Star,
  Bookmark,
  ArrowUpDown,
} from "lucide-react";
import toast from "react-hot-toast";

export default function ToolsPanel({ conversation, onConversationChange }) {
  const [searchText, setSearchText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [replaceWith, setReplaceWith] = useState("");

  const handleReplace = () => {
    if (!searchText) return;
    const updated = {
      ...conversation,
      messages: conversation.messages.map((m) => ({
        ...m,
        content: m.content.replaceAll(searchText, replaceWith),
      })),
    };
    onConversationChange(updated);
    toast.success(`Replaced all occurrences of "${searchText}"`);
  };

  const handleRemoveEmpty = () => {
    const updated = {
      ...conversation,
      messages: conversation.messages.filter(
        (m) => m.content?.trim()
      ),
    };
    onConversationChange(updated);
    toast.success("Removed empty messages");
  };

  const handleDeleteMessage = (id) => {
    const updated = {
      ...conversation,
      messages: conversation.messages.filter((m) => m.id !== id),
    };
    onConversationChange(updated);
    toast.success("Message deleted");
  };

  if (!conversation?.messages?.length) return null;

  return (
    <div className="space-y-4">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-[--foreground]">
        <ArrowUpDown className="h-4 w-4 text-primary" />
        Tools
      </h3>

      <div className="space-y-3 rounded-lg border border-[--border] bg-[--surface] p-3">
        <div>
          <label className="mb-1 text-xs font-medium text-[--muted]">
            Search & Replace
          </label>
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search text..."
            className="mb-2 w-full rounded-lg border border-[--border] bg-[--page] px-3 py-1.5 text-sm text-[--foreground] placeholder:text-[--muted] focus:border-primary focus:outline-none focus:ring-3 focus:ring-primary/20"
          />
          <div className="flex gap-2">
            <input
              type="text"
              value={replaceWith}
              onChange={(e) => setReplaceWith(e.target.value)}
              placeholder="Replace with..."
              className="flex-1 rounded-lg border border-[--border] bg-[--page] px-3 py-1.5 text-sm text-[--foreground] placeholder:text-[--muted] focus:border-primary focus:outline-none focus:ring-3 focus:ring-primary/20"
            />
            <button
              onClick={handleReplace}
              disabled={!searchText}
              className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              Replace
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleRemoveEmpty}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[--border] bg-[--surface] px-3 py-2 text-xs font-medium text-[--foreground] transition-colors hover:bg-red-50 hover:border-red-200 hover:text-red-600"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Remove Empty
        </button>
        <button
          onClick={() => toast.success("Feature coming soon")}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[--border] bg-[--surface] px-3 py-2 text-xs font-medium text-[--foreground] transition-colors hover:bg-[--surface-soft]"
        >
          <Merge className="h-3.5 w-3.5" />
          Merge Chats
        </button>
        <button
          onClick={() => toast.success("Feature coming soon")}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[--border] bg-[--surface] px-3 py-2 text-xs font-medium text-[--foreground] transition-colors hover:bg-[--surface-soft]"
        >
          <Split className="h-3.5 w-3.5" />
          Split Chat
        </button>
        <button
          onClick={() => {
            const name = prompt("New conversation name:", conversation.title);
            if (name) {
              onConversationChange({ ...conversation, title: name });
              toast.success("Conversation renamed");
            }
          }}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[--border] bg-[--surface] px-3 py-2 text-xs font-medium text-[--foreground] transition-colors hover:bg-[--surface-soft]"
        >
          <PenLine className="h-3.5 w-3.5" />
          Rename
        </button>
      </div>

      {conversation.messages.length > 0 && (
        <div>
          <label className="mb-1.5 text-xs font-medium text-[--muted]">
            Quick Delete Messages
          </label>
          <div className="flex flex-wrap gap-2">
            {conversation.messages.slice(0, 10).map((msg) => (
              <button
                key={msg.id}
                onClick={() => handleDeleteMessage(msg.id)}
                className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-2 py-1 text-[10px] text-red-600 transition-colors hover:bg-red-100"
              >
                <Trash2 className="h-3 w-3" />
                {msg.role === "user" ? "U" : "A"}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
