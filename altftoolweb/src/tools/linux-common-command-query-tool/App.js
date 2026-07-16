"use client";

import React, { useState } from "react";
import {
  BarChart3,
  Clipboard,
  Download,
  Eraser,
  Filter,
  Heart,
  History,
  RotateCcw,
  Search,
  Star,
  Terminal,
  Zap,
} from "lucide-react";
import { useCommandSearch } from "@/tools/linux-common-command-query-tool/hooks/useCommandSearch";
import {
  copyToClipboard,
  downloadTXT,
  formatCommandCheatSheet,
} from "@/tools/linux-common-command-query-tool/utils/export";

const StatusBadge = ({ status, type = "info", animate = false }) => {
  const styles = {
    success: "bg-green-500/10 text-green-500 border-green-500/20",
    warning: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    info: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
  };

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[11px] font-bold font-secondary ${styles[type]}`}>
      {animate && (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
        </span>
      )}
      {status}
    </div>
  );
};

const InfoCard = ({ title, icon: Icon, children, className = "", compact = false }) => (
  <div className={`relative bg-(--card) border border-(--border) rounded-2xl ${compact ? "p-4" : "p-5 sm:p-6"} transition-all duration-300 hover:border-cyan-500/40 hover:shadow-lg overflow-visible min-w-0 h-auto ${className}`}>
    <div className={`flex flex-col sm:flex-row sm:items-center gap-3 border-b border-(--border) min-w-0 ${compact ? "mb-3 pb-3" : "mb-5 pb-4"}`}>
      <div className={`${compact ? "p-1.5" : "p-2"} rounded-lg bg-(--background) border border-(--border) text-cyan-500 shrink-0`}>
        {Icon && <Icon size={18} />}
      </div>
      <h3 className={`font-primary font-bold ${compact ? "text-base" : "text-base sm:text-lg"} text-(--foreground) min-w-0 overflow-wrap-normal break-normal leading-snug`}>
        {title}
      </h3>
    </div>
    <div className="space-y-3 min-w-0 overflow-visible">{children}</div>
  </div>
);

const DataRow = ({ label, value, highlight = false }) => (
  <div className="flex items-start justify-between gap-4 py-1.5 border-b border-(--border)/30 last:border-0 min-w-0">
    <span className="text-[13px] font-secondary text-(--muted-foreground) shrink-0">{label}</span>
    <span className={`text-[13px] font-semibold font-secondary text-right break-words min-w-0 ${highlight ? "text-cyan-500" : "text-(--foreground)"}`}>
      {value}
    </span>
  </div>
);

const ActionButton = ({ children, icon: Icon, onClick, variant = "secondary", disabled = false }) => {
  const variantClass =
    variant === "primary"
      ? "bg-cyan-600 text-white border-cyan-500 hover:bg-cyan-700 shadow-md"
      : "bg-(--background) text-(--foreground) border-(--border) hover:bg-(--card)";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex min-w-0 items-center justify-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-bold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${variantClass}`}
    >
      {Icon && <Icon className="w-4 h-4 shrink-0" />}
      <span className="whitespace-normal sm:whitespace-nowrap leading-tight">{children}</span>
    </button>
  );
};

const CommandPill = ({ command, active, favorite, onSelect, onFavorite }) => (
  <div
    className={`relative w-full rounded-xl border p-4 transition-all min-w-0 ${
      active
        ? "border-cyan-500/50 bg-cyan-500/10 shadow-sm"
        : "border-(--border) bg-(--background) hover:border-cyan-500/30 hover:bg-cyan-500/5"
    }`}
  >
    <div className="min-w-0 pr-11">
      <button onClick={onSelect} className="block w-full min-w-0 text-left">
        <div className="flex flex-col items-start gap-2 min-w-0">
          <span className="font-mono text-base font-black text-(--foreground) break-words">{command.name}</span>
          <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2 py-0.5 text-[10px] font-bold text-cyan-500 break-words">
            {command.category}
          </span>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-(--muted-foreground) break-words">{command.description}</p>
      </button>
      <button
        onClick={onFavorite}
        className="absolute right-4 top-4 rounded-lg border border-(--border) bg-(--card) p-2 text-(--muted-foreground) hover:text-rose-500"
        aria-label={`Toggle ${command.name} favorite`}
      >
        <Heart className={`h-4 w-4 ${favorite ? "fill-rose-500 text-rose-500" : ""}`} />
      </button>
    </div>
  </div>
);

export default function LinuxCommandQueryEntry() {
  const {
    allCommands,
    categories,
    query,
    setQuery,
    category,
    setCategory,
    results,
    selectedCommand,
    setSelectedName,
    relatedCommands,
    favorites,
    favoriteCommands,
    toggleFavorite,
    history,
    clearHistory,
    resetWorkspace,
  } = useCommandSearch();
  const [copied, setCopied] = useState("");

  const copyCommand = async (text, label) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopied(label);
      setTimeout(() => setCopied(""), 1800);
    }
  };

  const downloadAll = () => {
    downloadTXT(formatCommandCheatSheet(allCommands), "linux-cheatsheet.txt");
  };

  const downloadFavorites = () => {
    const commands = favoriteCommands.length ? favoriteCommands : allCommands;
    const title = favoriteCommands.length ? "FAVORITE LINUX COMMANDS" : "LINUX COMMAND CHEAT SHEET";
    const fileName = favoriteCommands.length ? "favorite-commands.txt" : "linux-cheatsheet.txt";
    downloadTXT(formatCommandCheatSheet(commands, title), fileName);
  };

  const stats = {
    commands: allCommands.length,
    categories: categories.length,
    favorites: favorites.length,
    searches: history.length,
  };

  return (
    <div className="px-3 sm:px-4 py-8 font-secondary selection:bg-cyan-500/30 overflow-x-hidden">
      <div className="max-w-7xl mx-auto space-y-10">
        <header className="text-center text-(--primary) mb-8">
          <div className="flex flex-wrap items-center justify-center gap-3 mb-4">
            <StatusBadge status="Command DB Live" type="success" animate />
            <StatusBadge status={`${stats.commands} real commands`} type="info" />
            <StatusBadge status="Offline Ready" type="warning" />
          </div>
          <h1 className="heading animate-fade-up !text-3xl sm:!text-4xl lg:!text-5xl">
            Linux Command Query Studio
          </h1>
          <p className="description opacity-90 mt-1 text-(--secondary) text-base md:text-lg animate-fade-up max-w-3xl mx-auto">
            Search Linux commands, inspect syntax, copy examples, save favorites, and export cheat sheets in a browser-only dashboard.
          </p>
        </header>

        <section className="bg-(--card) border border-(--border) rounded-2xl p-4 sm:p-5 animate-fade-up min-w-0 overflow-visible">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4 items-center">
            <label className="relative min-w-0">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-cyan-500" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search commands, aliases, categories, descriptions, or examples..."
                className="w-full rounded-xl border border-(--border) bg-(--background) py-3 pl-12 pr-4 text-sm font-semibold text-(--foreground) outline-none transition-all focus:border-cyan-500"
              />
            </label>
            <div className="grid grid-cols-1 sm:flex sm:flex-wrap items-stretch sm:items-center justify-start lg:justify-end gap-2 min-w-0">
              <ActionButton icon={Eraser} onClick={() => setQuery("")}>Clear</ActionButton>
              <ActionButton icon={RotateCcw} onClick={resetWorkspace}>Reset</ActionButton>
              <ActionButton icon={Download} onClick={downloadAll} variant="primary">Cheat Sheet</ActionButton>
            </div>
          </div>

          <div className="mt-4 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {["All", ...categories].map((item) => (
              <button
                key={item}
                onClick={() => setCategory(item)}
                className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-xs font-bold transition-all ${
                  category === item
                    ? "border-cyan-500 bg-cyan-500 text-white"
                    : "border-(--border) bg-(--background) text-(--foreground) hover:border-cyan-500/40"
                }`}
              >
                <Filter className="h-3.5 w-3.5" />
                {item}
              </button>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(260px,0.9fr)_minmax(0,1.25fr)] 2xl:grid-cols-[minmax(280px,0.9fr)_minmax(0,1.25fr)_minmax(260px,0.65fr)] gap-6 lg:gap-8 items-start overflow-visible">
          <InfoCard title={`Command Results (${results.length})`} icon={Terminal} className="lg:sticky lg:top-6 lg:max-h-[calc(100vh-4rem)]">
            <div className="max-h-none lg:max-h-[calc(100vh-13rem)] overflow-visible lg:overflow-y-auto lg:pr-1 space-y-3">
              {results.length ? (
                results.map((command) => (
                  <CommandPill
                    key={command.name}
                    command={command}
                    active={selectedCommand?.name === command.name}
                    favorite={favorites.includes(command.name)}
                    onSelect={() => setSelectedName(command.name)}
                    onFavorite={() => toggleFavorite(command.name)}
                  />
                ))
              ) : (
                <div className="rounded-xl border border-(--border) bg-(--background) p-6 text-center text-sm text-(--muted-foreground)">
                  No command matched the current query and category.
                </div>
              )}
            </div>
          </InfoCard>

          <InfoCard title="Command Detail Panel" icon={Zap}>
            {selectedCommand && (
              <div className="space-y-5 min-w-0">
                <div className="rounded-2xl border border-cyan-500/20 bg-slate-950 text-slate-100 p-4 sm:p-5 shadow-inner overflow-hidden min-w-0">
                  <div className="mb-4 flex items-center justify-between gap-3 border-b border-white/10 pb-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="h-3 w-3 rounded-full bg-red-400" />
                      <span className="h-3 w-3 rounded-full bg-yellow-400" />
                      <span className="h-3 w-3 rounded-full bg-green-400" />
                      <span className="ml-2 font-mono text-xs text-slate-400 break-all">linux@studio:~$</span>
                    </div>
                    <button
                      onClick={() => copyCommand(selectedCommand.syntax, "syntax")}
                      className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-bold text-cyan-300 transition hover:bg-white/10"
                    >
                      {copied === "syntax" ? "Copied" : "Copy syntax"}
                    </button>
                  </div>
                  <p className="font-mono text-2xl font-black text-cyan-300 break-all">{selectedCommand.name}</p>
                  <p className="mt-3 text-sm leading-relaxed text-slate-300 break-words">{selectedCommand.description}</p>
                  <div className="mt-4 rounded-xl bg-black/40 p-3 font-mono text-sm text-green-300 break-words">
                    $ {selectedCommand.syntax}
                  </div>
                </div>

                <div>
                  <h4 className="mb-3 text-sm font-black uppercase tracking-wider text-(--muted-foreground)">Usage Examples</h4>
                  <div className="space-y-2">
                    {selectedCommand.examples.map((example) => (
                      <div key={example} className="flex items-center justify-between gap-3 rounded-xl border border-(--border) bg-(--background) p-3 min-w-0">
                        <code className="font-mono text-sm font-bold text-(--foreground) break-all min-w-0">{example}</code>
                        <button
                          onClick={() => copyCommand(example, example)}
                          className="rounded-lg border border-(--border) p-2 text-cyan-500 hover:bg-cyan-500/10 shrink-0"
                          aria-label={`Copy ${example}`}
                        >
                          <Clipboard className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <DataRow label="Category" value={selectedCommand.category} highlight />
                  <DataRow label="Aliases" value={selectedCommand.aliases.join(", ")} />
                </div>

                <div>
                  <h4 className="mb-3 text-sm font-black uppercase tracking-wider text-(--muted-foreground)">Related Commands</h4>
                  <div className="flex flex-wrap gap-2">
                    {relatedCommands.map((command) => (
                      <button
                        key={command.name}
                        onClick={() => setSelectedName(command.name)}
                        className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1.5 text-xs font-bold text-cyan-500 transition hover:bg-cyan-500 hover:text-white"
                      >
                        {command.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </InfoCard>

          <div className="grid grid-cols-1 md:grid-cols-3 2xl:grid-cols-1 gap-4 lg:gap-5 lg:col-span-2 2xl:col-span-1">
            <InfoCard title="Statistics Panel" icon={BarChart3} compact>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-xl border border-(--border) bg-(--background) p-3">
                  <p className="text-[11px] font-bold text-(--muted-foreground)">Commands</p>
                  <p className="mt-1 text-lg font-black text-cyan-500">{stats.commands}</p>
                </div>
                <div className="rounded-xl border border-(--border) bg-(--background) p-3">
                  <p className="text-[11px] font-bold text-(--muted-foreground)">Categories</p>
                  <p className="mt-1 text-lg font-black text-(--foreground)">{stats.categories}</p>
                </div>
                <div className="rounded-xl border border-(--border) bg-(--background) p-3">
                  <p className="text-[11px] font-bold text-(--muted-foreground)">Favorites</p>
                  <p className="mt-1 text-lg font-black text-(--foreground)">{stats.favorites}</p>
                </div>
                <div className="rounded-xl border border-(--border) bg-(--background) p-3">
                  <p className="text-[11px] font-bold text-(--muted-foreground)">Searches</p>
                  <p className="mt-1 text-lg font-black text-(--foreground)">{stats.searches}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 pt-1">
                <ActionButton icon={Download} onClick={downloadFavorites} variant="primary">
                  {favoriteCommands.length ? "Download Favorites" : "Download All"}
                </ActionButton>
              </div>
            </InfoCard>

            <InfoCard title="Favorites" icon={Star} compact>
              {favoriteCommands.length ? (
                <div className="max-h-48 overflow-y-auto pr-1 space-y-2">
                  {favoriteCommands.map((command) => (
                    <button
                      key={command.name}
                      onClick={() => setSelectedName(command.name)}
                      className="w-full rounded-lg border border-(--border) bg-(--background) px-3 py-2 text-left font-mono text-sm font-bold hover:border-cyan-500/40"
                    >
                      {command.name}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm leading-relaxed text-(--muted-foreground)">Favorite commands persist here after refresh.</p>
              )}
            </InfoCard>

            <InfoCard title="Search History" icon={History} compact>
              {history.length ? (
                <div className="max-h-48 overflow-y-auto pr-1 space-y-2">
                  {history.map((item) => (
                    <button
                      key={item}
                      onClick={() => setQuery(item)}
                      className="w-full rounded-lg border border-(--border) bg-(--background) px-3 py-2 text-left text-sm font-bold hover:border-cyan-500/40 break-words"
                    >
                      {item}
                    </button>
                  ))}
                  <ActionButton icon={Eraser} onClick={clearHistory}>Clear History</ActionButton>
                </div>
              ) : (
                <p className="text-sm leading-relaxed text-(--muted-foreground)">Recent searches save locally as you type.</p>
              )}
            </InfoCard>
          </div>
        </div>
      </div>
    </div>
  );
}
