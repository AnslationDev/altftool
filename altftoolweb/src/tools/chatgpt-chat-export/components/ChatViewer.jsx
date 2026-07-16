"use client";

import { useMemo, useRef, useEffect } from "react";
import { Bot, User, Clock, Search } from "lucide-react";
import CodeBlock from "./CodeBlock";
import { THEMES } from "../utils/constants";

export default function ChatViewer({
  conversation,
  searchQuery,
  filterRole,
  filterCode,
  theme = "classic-chatgpt",
  settings = {},
}) {
  const containerRef = useRef(null);
  const themeConfig = THEMES[theme] || THEMES["classic-chatgpt"];

  const filteredMessages = useMemo(() => {
    if (!conversation?.messages) return [];
    let msgs = conversation.messages;

    if (filterRole === "user") {
      msgs = msgs.filter((m) => m.role === "user");
    } else if (filterRole === "assistant") {
      msgs = msgs.filter((m) => m.role === "assistant");
    }

    if (filterCode) {
      if (filterCode === "has-code") {
        msgs = msgs.filter((m) => m.codeBlocks?.length > 0);
      } else if (filterCode === "questions") {
        msgs = msgs.filter(
          (m) => m.role === "user" && m.content.trim().endsWith("?")
        );
      } else if (filterCode === "answers") {
        msgs = msgs.filter((m) => m.role === "assistant");
      }
    }

    if (searchQuery?.trim()) {
      const q = searchQuery.toLowerCase();
      msgs = msgs.filter((m) => m.content.toLowerCase().includes(q));
    }

    return msgs;
  }, [conversation, searchQuery, filterRole, filterCode]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [filteredMessages.length]);

  if (!conversation?.messages?.length) return null;

  return (
    <div
      ref={containerRef}
      className="max-h-[600px] overflow-y-auto rounded-xl border border-[--border] bg-[--surface]"
      style={{ fontFamily: settings.fontFamily || themeConfig.fontFamily }}
    >
      <div className="sticky top-0 z-10 border-b border-[--border] bg-[--surface] px-4 py-3">
        <h3 className="text-sm font-semibold text-[--foreground]">
          {conversation.title || "Conversation"}
        </h3>
        <p className="text-xs text-[--muted]">
          {filteredMessages.length} of {conversation.messages.length} messages
        </p>
      </div>

      <div className="divide-y divide-[--border]">
        {filteredMessages.map((msg) => {
          const isUser = msg.role === "user";
          const showAvatar = settings.showAvatar !== false;
          const showTimestamps = settings.showTimestamps !== false;
          const hideUser = settings.hideUser === true && isUser;
          const hideAssistant = settings.hideAssistant === true && !isUser;

          if (hideUser || hideAssistant) return null;

          return (
            <div
              key={msg.id}
              className={`px-4 py-4 transition-colors ${
                isUser ? "bg-[--surface-soft]/50" : "bg-[--surface]"
              }`}
            >
              <div className="flex items-start gap-3">
                {showAvatar && (
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                      isUser
                        ? "bg-primary/10 text-primary"
                        : "bg-emerald-500/10 text-emerald-500"
                    }`}
                  >
                    {isUser ? (
                      <User className="h-4 w-4" />
                    ) : (
                      <Bot className="h-4 w-4" />
                    )}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-[--foreground]">
                      {isUser ? "You" : "ChatGPT"}
                    </span>
                    {showTimestamps && msg.timestamp && (
                      <span className="flex items-center gap-1 text-xs text-[--muted]">
                        <Clock className="h-3 w-3" />
                        {new Date(msg.timestamp).toLocaleString()}
                      </span>
                    )}
                  </div>
                  <div
                    className="prose prose-sm mt-1 max-w-none text-[--foreground] dark:prose-invert"
                    style={{
                      fontSize: settings.fontSize
                        ? `${settings.fontSize}px`
                        : undefined,
                      lineHeight: settings.lineHeight || undefined,
                    }}
                  >
                    <RenderContent content={msg.content} />
                  </div>
                  {msg.codeBlocks?.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {msg.codeBlocks.map((cb) => (
                        <CodeBlock
                          key={cb.id}
                          language={cb.language}
                          code={cb.code}
                        />
                      ))}
                    </div>
                  )}
                  {msg.tables?.length > 0 && (
                    <div className="mt-3 space-y-3">
                      {msg.tables.map((table, i) => (
                        <div
                          key={i}
                          className="overflow-x-auto rounded-lg border border-[--border]"
                        >
                          <table className="w-full text-left text-sm">
                            <thead>
                              <tr className="border-b border-[--border] bg-[--surface-soft]">
                                {table.headers.map((h, j) => (
                                  <th
                                    key={j}
                                    className="px-3 py-2 font-semibold text-[--foreground]"
                                  >
                                    {h}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {table.data.map((row, j) => (
                                <tr
                                  key={j}
                                  className="border-b border-[--border] last:border-0"
                                >
                                  {row.map((cell, k) => (
                                    <td
                                      key={k}
                                      className="px-3 py-2 text-[--foreground]"
                                    >
                                      {cell}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredMessages.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Search className="mb-3 h-10 w-10 text-[--muted]" />
          <p className="text-sm font-medium text-[--muted]">
            {searchQuery
              ? "No messages match your search"
              : "No messages to display"}
          </p>
          {(searchQuery || filterRole || filterCode) && (
            <p className="mt-1 text-xs text-[--muted]">
              Try adjusting your filters
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function RenderContent({ content }) {
  if (!content) return null;
  const lines = content.split("\n");
  return (
    <>
      {lines.map((line, i) => (
        <p key={i} className={i > 0 ? "mt-2" : ""}>
          {line || "\u00A0"}
        </p>
      ))}
    </>
  );
}
