"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUp, Bot, Sparkles } from "lucide-react";

const SUGGESTIONS = [
  "Compress a PDF",
  "Resize image to 20KB",
  "What is AltFTool?",
  "EMI calculator",
  "Play a puzzle game",
  "Is my data private?",
];

let enginePromise = null;
function loadEngine() {
  if (!enginePromise) {
    enginePromise = import("./assistantEngine");
  }
  return enginePromise;
}

/**
 * AltF Assistant — ChatGPT-style ask box for the home page.
 *
 * Client-side answer engine (FAQ + registry search over 600+ tools) loaded
 * lazily on first interaction. No network calls, instant answers.
 */
export function AiAssistantBox() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!messages.length) return;
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, thinking]);

  const ask = async (rawQuery) => {
    const query = rawQuery.trim();
    if (!query || thinking) return;

    setMessages((prev) => [...prev, { role: "user", text: query }]);
    setInput("");
    setThinking(true);

    try {
      const engine = await loadEngine();
      // Small delay so the thinking state reads as intentional, not jittery.
      await new Promise((resolve) => setTimeout(resolve, 350));
      const answer = engine.answerQuery(query);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: answer.text, links: answer.links || [] },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "Something went wrong loading the assistant — try the search instead.",
          links: [{ href: "/tools/all", label: "Browse all tools" }],
        },
      ]);
    } finally {
      setThinking(false);
    }
  };

  const submit = (event) => {
    event.preventDefault();
    ask(input);
  };

  return (
    <section
      aria-labelledby="altf-assistant-heading"
      className="mx-auto w-full max-w-[var(--anslation-ds-container)] px-4 pb-10 sm:px-6 sm:pb-12 lg:px-8"
    >
      <div className="mx-auto max-w-3xl">
        <div className="mb-4 flex items-center justify-center gap-2 text-center">
          <Sparkles className="h-4 w-4 text-[var(--primary)]" aria-hidden="true" />
          <h2
            id="altf-assistant-heading"
            className="text-sm font-semibold uppercase tracking-wide text-[var(--muted-foreground)]"
          >
            Ask AltF AI
          </h2>
        </div>

        <div className="overflow-hidden rounded-lg border border-border bg-card shadow-md">
          {messages.length > 0 ? (
            <div
              ref={scrollRef}
              className="max-h-80 space-y-4 overflow-y-auto border-b border-[var(--border)] p-4 sm:p-5"
              aria-live="polite"
            >
              {messages.map((message, index) =>
                message.role === "user" ? (
                  <div key={index} className="flex justify-end">
                    <p className="max-w-[85%] rounded-lg rounded-br-sm bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground">
                      {message.text}
                    </p>
                  </div>
                ) : (
                  <div key={index} className="flex items-start gap-2.5">
                    <span
                      aria-hidden="true"
                      className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted"
                    >
                      <Bot className="h-4 w-4 text-[var(--primary)]" />
                    </span>
                    <div className="min-w-0 max-w-[85%]">
                      <p className="text-sm leading-relaxed text-[var(--foreground)]">
                        {message.text}
                      </p>
                      {message.links?.length ? (
                        <div className="mt-2.5 flex flex-wrap gap-2">
                          {message.links.map((link) => (
                            <Link
                              key={`${link.href}-${link.label}`}
                              href={link.href}
                              className="inline-flex min-h-9 items-center rounded-full border border-border bg-background px-3.5 py-1.5 text-sm font-medium text-primary transition-colors hover:border-primary hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                              title={link.description || undefined}
                            >
                              {link.label}
                            </Link>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>
                ),
              )}

              {thinking ? (
                <div className="flex items-center gap-2.5" aria-label="Assistant is thinking">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted">
                    <Bot className="h-4 w-4 text-[var(--primary)]" />
                  </span>
                  <span className="inline-flex gap-1">
                    {[0, 1, 2].map((dot) => (
                      <span
                        key={dot}
                        className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--muted-foreground)] motion-reduce:animate-none"
                        style={{ animationDelay: `${dot * 120}ms` }}
                      />
                    ))}
                  </span>
                </div>
              ) : null}
            </div>
          ) : null}

          <form onSubmit={submit} className="flex items-center gap-2 p-3 sm:p-4">
            <label htmlFor="altf-assistant-input" className="sr-only">
              Ask anything about AltFTool or describe the tool you need
            </label>
            <input
              id="altf-assistant-input"
              ref={inputRef}
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onFocus={() => loadEngine()}
              placeholder="Ask anything — “compress a PDF”, “what is AltFTool?”…"
              autoComplete="off"
              enterKeyHint="send"
              className="h-11 min-w-0 flex-1 rounded-md border border-border bg-background px-4 text-[15px] text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-[3px] focus:ring-primary/25"
            />
            <button
              type="submit"
              disabled={!input.trim() || thinking}
              aria-label="Send question"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground transition hover:bg-[var(--primary-hover)] disabled:opacity-40"
            >
              <ArrowUp className="h-5 w-5" aria-hidden="true" />
            </button>
          </form>

          {messages.length === 0 ? (
            <div className="flex flex-wrap gap-2 px-3 pb-4 sm:px-4">
              {SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => ask(suggestion)}
                  className="inline-flex min-h-9 items-center rounded-full border border-border bg-background px-3.5 py-1.5 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <p className="mt-3 text-center text-xs text-[var(--muted-foreground)]">
          Instant answers from the AltFTool catalog — nothing leaves your browser.
        </p>
      </div>
    </section>
  );
}

export default AiAssistantBox;
