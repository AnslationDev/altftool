"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  MessageSquare,
  Upload,
  Eye,
  Search,
  Download,
  Settings2,
  BarChart3,
  Wrench,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import UploadZone from "../components/UploadZone";
import ChatViewer from "../components/ChatViewer";
import SearchBar from "../components/SearchBar";
import ExportPanel from "../components/ExportPanel";
import SettingsPanel from "../components/SettingsPanel";
import Statistics from "../components/Statistics";
import ToolsPanel from "../components/ToolsPanel";
import Features from "../components/Features";
import { parseChatFile, parsePastedContent } from "../utils/parser";
import toast, { Toaster } from "react-hot-toast";

const TABS = [
  { id: "upload", label: "Upload", icon: Upload },
  { id: "viewer", label: "Viewer", icon: Eye },
  { id: "search", label: "Search", icon: Search },
  { id: "export", label: "Export", icon: Download },
  { id: "settings", label: "Settings", icon: Settings2 },
  { id: "stats", label: "Stats", icon: BarChart3 },
  { id: "tools", label: "Tools", icon: Wrench },
];

const DEFAULT_SETTINGS = Object.freeze({
  showAvatar: true,
  showTimestamps: true,
  hideUser: false,
  hideAssistant: false,
  fontFamily: "",
  fontSize: 15,
  lineHeight: "1.6",
  pageSize: "a4",
  orientation: "portrait",
  margins: 20,
  pdfDarkTheme: false,
});

function getInitialSettings() {
  if (typeof window === "undefined") return { ...DEFAULT_SETTINGS };

  try {
    const saved = localStorage.getItem("chatgpt-export-settings");
    if (saved) return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
  } catch {}
  return { ...DEFAULT_SETTINGS };
}

function getInitialHistory() {
  if (typeof window === "undefined") return [];

  try {
    const saved = JSON.parse(
      localStorage.getItem("chatgpt-export-history") || "[]",
    );
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

export default function ChatGPTExportPro() {
  const [conversation, setConversation] = useState(null);
  const [activeTab, setActiveTab] = useState("upload");
  const [theme, setTheme] = useState("classic-chatgpt");
  const [settings, setSettings] = useState(getInitialSettings);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterCode, setFilterCode] = useState("");
  const [history, setHistory] = useState([]);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  useEffect(() => {
    localStorage.setItem("chatgpt-export-settings", JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    // Read after hydration so local-only summaries cannot change the server
    // HTML and trigger a hydration mismatch.
    const timeout = window.setTimeout(() => {
      setHistory(getInitialHistory());
    }, 0);
    return () => window.clearTimeout(timeout);
  }, []);

  const addToHistory = useCallback(
    (conv) => {
      const entry = {
        title: conv.title,
        date: new Date().toISOString(),
        messages: conv.messages.length,
      };
      const updated = [entry, ...history.filter((h) => h.title !== conv.title)].slice(
        0,
        20
      );
      setHistory(updated);
      localStorage.setItem("chatgpt-export-history", JSON.stringify(updated));
    },
    [history]
  );

  const handleFilesSelected = useCallback(
    async (files) => {
      const toastId = toast.loading(`Parsing ${files.length} file(s)...`);
      try {
        const results = await Promise.all(
          Array.from(files).map((f) => parseChatFile(f))
        );
        const merged = results.reduce(
          (acc, r) => ({
            title: acc.title,
            createdAt: acc.createdAt,
            messages: [...acc.messages, ...r.messages],
          }),
          {
            title: results[0]?.title || "ChatGPT Conversation",
            createdAt: results[0]?.createdAt || new Date().toISOString(),
            messages: [],
          }
        );
        setConversation(merged);
        addToHistory(merged);
        setActiveTab("viewer");
        toast.success(`Parsed ${merged.messages.length} messages`, { id: toastId });
      } catch (err) {
        toast.error(err.message, { id: toastId });
      }
    },
    [addToHistory]
  );

  const handlePasteContent = useCallback(
    (content) => {
      try {
        const result = parsePastedContent(content);
        setConversation(result);
        addToHistory(result);
        setActiveTab("viewer");
        toast.success(`Parsed ${result.messages.length} messages`);
      } catch (err) {
        toast.error(`Failed to parse: ${err.message}`);
      }
    },
    [addToHistory]
  );

  const handleClear = useCallback(() => {
    setConversation(null);
    setSearchQuery("");
    setFilterRole("");
    setFilterCode("");
    setActiveTab("upload");
  }, []);

  const handleSettingsChange = useCallback((newSettings) => {
    setSettings(newSettings);
  }, []);

  const handleThemeChange = useCallback((newTheme) => {
    setTheme(newTheme);
  }, []);

  const hasConversation = !!conversation?.messages?.length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          className:
            "!rounded-lg !border !border-[--border] !bg-[--surface] !text-[--foreground] !shadow-[var(--anslation-ds-shadow-md)]",
        }}
      />
      <div className="mb-6 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
          <MessageSquare className="h-7 w-7 text-primary" />
        </div>
        <h1 className="mt-3 text-2xl font-bold text-[--foreground] sm:text-3xl">
          ChatGPT Chat Export
        </h1>
        <p className="mt-1 text-sm text-[--muted]">
          Convert exported ChatGPT conversations into beautiful documents
        </p>
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const disabled = !hasConversation && tab.id !== "upload";
          return (
            <button
              key={tab.id}
              onClick={() => {
                if (!disabled) {
                  setActiveTab(tab.id);
                  setShowMobileMenu(false);
                }
              }}
              disabled={disabled}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                isActive
                  ? "bg-(--primary) text-(--primary-foreground) shadow-[var(--anslation-ds-shadow-sm)]"
                  : disabled
                  ? "cursor-not-allowed text-[--muted] opacity-40"
                  : "text-[--muted] hover:bg-[--surface-soft] hover:text-[--foreground]"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
        {hasConversation && (
          <button
            onClick={handleClear}
            className="ml-2 rounded-lg border border-(--destructive)/30 px-3 py-2 text-xs font-medium text-(--destructive) transition-colors hover:bg-(--destructive)/10"
          >
            Clear
          </button>
        )}
      </div>

      <div className="mx-auto max-w-5xl">
        {activeTab === "upload" && (
          <div className="space-y-8">
            <UploadZone
              onFilesSelected={handleFilesSelected}
              onPasteContent={handlePasteContent}
            />

            {history.length > 0 && (
              <div className="rounded-xl border border-[--border] bg-[--surface] p-4">
                <h3 className="mb-3 text-sm font-semibold text-[--foreground]">
                  Recent Import Summaries
                </h3>
                <div className="space-y-2">
                  {history.map((h, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-lg bg-[--surface-soft] px-3 py-2"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-[--foreground]">
                          {h.title}
                        </p>
                        <p className="text-xs text-[--muted]">
                          {h.messages} messages &middot;{" "}
                          {new Date(h.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Features />
          </div>
        )}

        {activeTab === "viewer" && hasConversation && (
          <ChatViewer
            conversation={conversation}
            theme={theme}
            settings={settings}
          />
        )}

        {activeTab === "search" && hasConversation && (
          <div className="space-y-4">
            <SearchBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              filterRole={filterRole}
              onFilterRoleChange={setFilterRole}
              filterCode={filterCode}
              onFilterCodeChange={setFilterCode}
              totalMessages={conversation.messages.length}
            />
            <ChatViewer
              conversation={conversation}
              searchQuery={searchQuery}
              filterRole={filterRole}
              filterCode={filterCode}
              theme={theme}
              settings={settings}
            />
          </div>
        )}

        {activeTab === "export" && hasConversation && (
          <div className="rounded-xl border border-[--border] bg-[--surface] p-4 sm:p-6">
            <ExportPanel conversation={conversation} settings={settings} />
          </div>
        )}

        {activeTab === "settings" && hasConversation && (
          <div className="rounded-xl border border-[--border] bg-[--surface] p-4 sm:p-6">
            <SettingsPanel
              settings={settings}
              onSettingsChange={handleSettingsChange}
              theme={theme}
              onThemeChange={handleThemeChange}
            />
          </div>
        )}

        {activeTab === "stats" && hasConversation && (
          <Statistics conversation={conversation} />
        )}

        {activeTab === "tools" && hasConversation && (
          <div className="rounded-xl border border-[--border] bg-[--surface] p-4 sm:p-6">
            <ToolsPanel
              conversation={conversation}
              onConversationChange={setConversation}
            />
          </div>
        )}
      </div>
    </div>
  );
}
