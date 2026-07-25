"use client";

import { useRef, useState } from "react";
import {
  Trash2,
  Merge,
  Split,
  PenLine,
  ArrowUpDown,
  Check,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { parseChatFile } from "../utils/parser";

export default function ToolsPanel({ conversation, onConversationChange }) {
  const [searchText, setSearchText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [replaceWith, setReplaceWith] = useState("");
  const [isRenaming, setIsRenaming] = useState(false);
  const [draftTitle, setDraftTitle] = useState(conversation?.title || "");
  const mergeInputRef = useRef(null);

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
      messages: conversation.messages.filter((m) => m.content?.trim()),
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

  const handleMergeFiles = async (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    if (!files.length) return;

    const toastId = toast.loading(
      `Reading ${files.length} chat file${files.length === 1 ? "" : "s"}...`,
    );
    try {
      const imported = await Promise.all(
        files.map((file) => parseChatFile(file)),
      );
      const suffix = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const additionalMessages = imported.flatMap((chat, chatIndex) =>
        chat.messages.map((message, messageIndex) => ({
          ...message,
          id: `${message.id || "message"}-merged-${suffix}-${chatIndex}-${messageIndex}`,
        })),
      );
      onConversationChange({
        ...conversation,
        messages: [...conversation.messages, ...additionalMessages],
      });
      toast.success(
        `Merged ${additionalMessages.length} message${additionalMessages.length === 1 ? "" : "s"}`,
        { id: toastId },
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not merge the selected chats",
        {
          id: toastId,
        },
      );
    }
  };

  const downloadConversationPart = (messages, part) => {
    const safeTitle = (conversation.title || "chat")
      .replace(/[^a-z0-9]+/gi, "-")
      .replace(/^-|-$/g, "")
      .toLowerCase();
    const contents = JSON.stringify(
      {
        ...conversation,
        title: `${conversation.title || "Chat"} - Part ${part}`,
        messages,
      },
      null,
      2,
    );
    const url = URL.createObjectURL(
      new Blob([contents], { type: "application/json" }),
    );
    const link = Object.assign(document.createElement("a"), {
      href: url,
      download: `${safeTitle || "chat"}-part-${part}.json`,
    });
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleSplitChat = () => {
    if (conversation.messages.length < 2) {
      toast("Add at least two messages before splitting this chat.");
      return;
    }
    const splitAt = Math.ceil(conversation.messages.length / 2);
    downloadConversationPart(conversation.messages.slice(0, splitAt), 1);
    downloadConversationPart(conversation.messages.slice(splitAt), 2);
    toast.success("Downloaded two balanced chat files");
  };

  const handleRename = () => {
    const title = draftTitle.trim();
    if (!title) {
      toast.error("Enter a conversation name");
      return;
    }
    onConversationChange({ ...conversation, title });
    setIsRenaming(false);
    toast.success("Conversation renamed");
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
        <input
          ref={mergeInputRef}
          type="file"
          accept=".json,.md,.txt,.html,.htm,.csv"
          multiple
          className="sr-only"
          onChange={handleMergeFiles}
        />
        <button
          onClick={handleRemoveEmpty}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[--border] bg-[--surface] px-3 py-2 text-xs font-medium text-[--foreground] transition-colors hover:bg-red-50 hover:border-red-200 hover:text-red-600"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Remove Empty
        </button>
        <button
          type="button"
          onClick={() => mergeInputRef.current?.click()}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[--border] bg-[--surface] px-3 py-2 text-xs font-medium text-[--foreground] transition-colors hover:bg-[--surface-soft]"
        >
          <Merge className="h-3.5 w-3.5" />
          Merge Chats
        </button>
        <button
          type="button"
          onClick={handleSplitChat}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[--border] bg-[--surface] px-3 py-2 text-xs font-medium text-[--foreground] transition-colors hover:bg-[--surface-soft]"
        >
          <Split className="h-3.5 w-3.5" />
          Split Chat
        </button>
        <button
          type="button"
          onClick={() => {
            setDraftTitle(conversation.title || "");
            setIsRenaming(true);
          }}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[--border] bg-[--surface] px-3 py-2 text-xs font-medium text-[--foreground] transition-colors hover:bg-[--surface-soft]"
        >
          <PenLine className="h-3.5 w-3.5" />
          Rename
        </button>
      </div>

      {isRenaming && (
        <form
          className="flex gap-2 rounded-lg border border-[--border] bg-[--surface] p-3"
          onSubmit={(event) => {
            event.preventDefault();
            handleRename();
          }}
        >
          <label className="sr-only" htmlFor="conversation-title">
            Conversation name
          </label>
          <input
            id="conversation-title"
            value={draftTitle}
            onChange={(event) => setDraftTitle(event.target.value)}
            autoFocus
            className="min-h-10 min-w-0 flex-1 rounded-lg border border-[--border] bg-[--page] px-3 text-sm text-[--foreground] focus:border-primary focus:outline-none focus:ring-3 focus:ring-primary/20"
          />
          <button
            type="submit"
            aria-label="Save conversation name"
            className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/30"
          >
            <Check aria-hidden="true" className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Cancel rename"
            onClick={() => setIsRenaming(false)}
            className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-lg border border-[--border] text-[--foreground] hover:bg-[--surface-soft] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/30"
          >
            <X aria-hidden="true" className="h-4 w-4" />
          </button>
        </form>
      )}

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
