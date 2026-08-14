"use client";

import React, { useCallback, useEffect, useState } from "react";
import Editor from "@monaco-editor/react";
import {
  RefreshCw,
  Copy,
  Download,
  Code,
  FileText,
  Check
} from "lucide-react";
import { parseChatInput } from "../lib";

const FORMATS = [
  { id: "openai", label: "OpenAI JSON" },
  { id: "anthropic", label: "Anthropic JSON" },
  { id: "gemini", label: "Google Gemini" },
  { id: "cohere", label: "Cohere JSON" },
  { id: "llama", label: "Llama 2/3 Prompt" },
  { id: "markdown", label: "Markdown Text" },
];

export default function MainComponent() {
  const [inputText, setInputText] = useState("");
  const [outputFormat, setOutputFormat] = useState("openai");
  const [outputText, setOutputText] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadSampleData = () => {
    const sample = [
      { role: "system", content: "You are a helpful coding assistant." },
      { role: "user", content: "Write a function to reverse a string." },
      { role: "assistant", content: "Here is the JavaScript code:\n\n```js\nfunction reverseString(str) {\n  return str.split('').reverse().join('');\n}\n```" }
    ];
    setInputText(JSON.stringify(sample, null, 2));
    setError("");
    setSuccess("Sample chat structure loaded into input box.");
    setTimeout(() => setSuccess(""), 3000);
  };

  const handleConvert = useCallback((input, format) => {
    setError("");
    setOutputText("");

    if (!input.trim()) {
      return;
    }

    let parsedMessages;

    try {
      parsedMessages = parseChatInput(input);
    } catch (err) {
      setError(`Failed to parse input: ${err.message}. Make sure your JSON format is valid.`);
      return;
    }

    // 2. Transpile to target output format
    if (parsedMessages.length === 0) {
      setError("No chat messages could be extracted.");
      return;
    }

    if (format === "openai") {
      const formatted = parsedMessages.map((m) => ({
        role: m.role === "assistant" ? "assistant" : m.role === "system" ? "system" : "user",
        content: m.content,
      }));
      setOutputText(JSON.stringify(formatted, null, 2));
    } 
    else if (format === "anthropic") {
      const systemMsg = parsedMessages.find((m) => m.role === "system")?.content || "";
      const messages = parsedMessages
        .filter((m) => m.role !== "system")
        .map((m) => ({
          role: m.role === "assistant" ? "assistant" : "user",
          content: m.content,
        }));
      setOutputText(JSON.stringify({ system: systemMsg, messages }, null, 2));
    }
    else if (format === "gemini") {
      const systemMsg = parsedMessages.find((m) => m.role === "system");
      const contents = parsedMessages
        .filter((m) => m.role !== "system")
        .map((m) => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }],
        }));
      const payload = { contents };
      if (systemMsg) {
        payload.systemInstruction = {
          role: "system",
          parts: [{ text: systemMsg.content }]
        };
      }
      setOutputText(JSON.stringify(payload, null, 2));
    }
    else if (format === "cohere") {
      const chat_history = parsedMessages.map((m) => ({
        role: m.role === "assistant" ? "CHATBOT" : m.role === "system" ? "SYSTEM" : "USER",
        message: m.content,
      }));
      setOutputText(JSON.stringify({ chat_history }, null, 2));
    }
    else if (format === "llama") {
      let promptStr = "";
      let hasSystem = false;
      parsedMessages.forEach((m) => {
        if (m.role === "system") {
          promptStr += `<s>[INST] <<SYS>>\n${m.content}\n<</SYS>>\n\n`;
          hasSystem = true;
        } else if (m.role === "user") {
          if (!hasSystem) {
            promptStr += `<s>[INST] ${m.content} [/INST] `;
          } else {
            promptStr += `${m.content} [/INST] `;
            hasSystem = false;
          }
        } else {
          promptStr += `${m.content} </s>`;
        }
      });
      setOutputText(promptStr);
    }
    else if (format === "markdown") {
      const lines = parsedMessages.map((m) => {
        const title = m.role === "system" ? "System" : m.role === "assistant" ? "Assistant" : "User";
        return `**${title}**:\n${m.content}\n`;
      });
      setOutputText(lines.join("\n"));
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => handleConvert(inputText, outputFormat), 0);
    return () => window.clearTimeout(timer);
  }, [handleConvert, inputText, outputFormat]);

  const handleCopy = () => {
    navigator.clipboard.writeText(outputText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownload = () => {
    const ext = ["markdown", "llama"].includes(outputFormat) ? "txt" : "json";
    const blob = new Blob([outputText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `chat-transfer-${outputFormat}-${Date.now()}.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getLanguage = (format) => {
    if (format === "markdown" || format === "llama") return "markdown";
    return "json";
  };

  return (
    <div className="w-full max-w-screen-2xl mx-auto px-4 py-8 sm:px-6 lg:px-8 bg-(--page)">
      
      {/* Title Header */}
      <div className="mb-8 flex flex-col items-center justify-center border-b border-(--border) pb-6">
        <h1 className="text-3xl font-extrabold tracking-tight flex items-center justify-center gap-2 text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 mb-2">
          <RefreshCw className="h-8 w-8 text-teal-500 shrink-0" /> Codex Chat Transfer
        </h1>
        <p className="mt-2 text-md text-slate-600 dark:text-slate-300 max-w-2xl text-center">
          Convert message arrays or Markdown transcripts into six target LLM formats in real time.
        </p>
      </div>

      {/* Alerts */}
      {success && (
        <div className="mb-6 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 text-sm flex items-center justify-center transition-all animate-fade-in">
          <span>{success}</span>
        </div>
      )}

      {/* IDE Workspace */}
      <div className="flex flex-col gap-8 w-full max-w-5xl mx-auto">
        
        {/* Top Panel: Input */}
        <div className="bg-(--surface) rounded-xl border border-(--border) shadow-sm flex flex-col h-[400px] overflow-hidden">
          <div className="flex items-center justify-between border-b border-(--border) px-4 py-3 bg-slate-50 dark:bg-slate-800/50">
            <h3 className="font-bold text-(--foreground) flex items-center gap-2 text-sm">
              <Code className="h-4 w-4 text-teal-500" /> Input (JSON/Markdown)
            </h3>
            <button
              onClick={loadSampleData}
              className="inline-flex items-center gap-1 px-3 py-1.5 border border-(--border) hover:border-teal-500 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-md text-xs font-semibold text-teal-600 dark:text-teal-400 transition-colors bg-(--page) cursor-pointer"
            >
              Load Sample JSON
            </button>
          </div>

          <div className="flex-1 relative">
            <Editor
              height="100%"
              language="json"
              theme="vs-dark"
              value={inputText}
              onChange={(val) => setInputText(val || "")}
              options={{
                minimap: { enabled: false },
                wordWrap: "on",
                padding: { top: 16, bottom: 16 },
                fontSize: 13,
                fontFamily: "var(--font-mono)",
                scrollBeyondLastLine: false,
                smoothScrolling: true,
                cursorBlinking: "smooth",
              }}
              className="bg-[#1e1e1e]"
            />
          </div>
          
          {error && (
            <div className="px-4 py-3 bg-red-500/10 border-t border-red-500/30 text-red-600 text-xs flex items-start gap-2 max-h-32 overflow-y-auto">
              <span className="font-mono break-all">{error}</span>
            </div>
          )}
        </div>

        {/* Bottom Panel: Output */}
        <div className="bg-(--surface) rounded-xl border border-(--border) shadow-sm flex flex-col h-[500px] overflow-hidden relative">
          
          {/* Header Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-800/50">
            <div className="flex items-center gap-2 text-sm font-bold text-(--foreground)">
              <FileText className="h-4 w-4 text-teal-500" /> Transpiled Output
            </div>
            <div className="flex items-center gap-2 mt-2 sm:mt-0">
              <button
                onClick={handleCopy}
                disabled={!outputText}
                className="inline-flex items-center gap-1 px-3 py-1.5 border border-(--border) hover:border-teal-500 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-md text-xs font-semibold text-teal-600 dark:text-teal-400 bg-(--page) transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCopied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                {isCopied ? "Copied" : "Copy"}
              </button>
              <button
                onClick={handleDownload}
                disabled={!outputText}
                className="inline-flex items-center gap-1 px-3 py-1.5 border border-(--border) hover:border-teal-500 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-md text-xs font-semibold text-teal-600 dark:text-teal-400 bg-(--page) transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="h-3.5 w-3.5" /> Download
              </button>
            </div>
          </div>

          {/* Horizontal Tabs for Format Selection */}
          <div className="flex overflow-x-auto border-y border-(--border) bg-(--page) hide-scrollbar">
            {FORMATS.map((f) => (
              <button
                key={f.id}
                onClick={() => setOutputFormat(f.id)}
                className={`whitespace-nowrap px-4 py-2.5 text-xs font-bold transition-all border-b-2 ${
                  outputFormat === f.id
                    ? "border-teal-500 text-teal-600 dark:text-teal-400 bg-teal-50/50 dark:bg-teal-900/10"
                    : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="flex-1 relative bg-[#1e1e1e]">
            {!outputText && !error && (
              <div className="absolute inset-0 flex items-center justify-center text-slate-500 z-10 pointer-events-none p-6 text-center">
                Paste valid JSON/Markdown in the input panel to see the live conversion here.
              </div>
            )}
            <Editor
              height="100%"
              language={getLanguage(outputFormat)}
              theme="vs-dark"
              value={outputText}
              options={{
                readOnly: true,
                minimap: { enabled: false },
                wordWrap: "on",
                padding: { top: 16, bottom: 16 },
                fontSize: 13,
                fontFamily: "var(--font-mono)",
                scrollBeyondLastLine: false,
                smoothScrolling: true,
              }}
            />
          </div>
        </div>

      </div>
    </div>
  );
}
