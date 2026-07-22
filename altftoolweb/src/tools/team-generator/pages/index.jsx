"use client";
import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, Shuffle, Copy, Check, RotateCcw, Plus, X,
  ChevronDown, Sparkles, Download, Trash2,
} from "lucide-react";

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function ToolHome() {
  const [participants, setParticipants] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [teams, setTeams] = useState([]);
  const [mode, setMode] = useState("count");
  const [teamCount, setTeamCount] = useState(2);
  const [teamSize, setTeamSize] = useState(3);
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  const addParticipant = useCallback(() => {
    const name = inputValue.trim();
    if (!name) return;
    if (participants.some((p) => p.name.toLowerCase() === name.toLowerCase())) {
      setInputValue("");
      return;
    }
    setParticipants((prev) => [...prev, { id: generateId(), name }]);
    setInputValue("");
  }, [inputValue, participants]);

  const addBulk = useCallback(() => {
    const items = inputValue
      .split(/[\n,]/)
      .map((n) => n.trim())
      .filter(Boolean);
    if (items.length === 0) return;
    const seen = new Set(participants.map((p) => p.name.toLowerCase()));
    const newItems = [];
    items.forEach((name) => {
      const lower = name.toLowerCase();
      if (!seen.has(lower)) {
        seen.add(lower);
        newItems.push({ id: generateId(), name });
      }
    });
    if (newItems.length === 0) return;
    setParticipants((prev) => [...prev, ...newItems]);
    setInputValue("");
  }, [inputValue, participants]);

  const removeParticipant = useCallback((id) => {
    setParticipants((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const generateTeams = useCallback(() => {
    if (participants.length < 2) return;
    const shuffled = shuffleArray(participants);
    let result = [];

    if (mode === "count") {
      const count = Math.max(2, Math.min(teamCount, shuffled.length));
      const baseSize = Math.floor(shuffled.length / count);
      const remainder = shuffled.length % count;
      let idx = 0;
      for (let i = 0; i < count; i++) {
        const size = baseSize + (i < remainder ? 1 : 0);
        result.push({
          id: generateId(),
          name: `Team ${i + 1}`,
          members: shuffled.slice(idx, idx + size).map((m) => m.name),
        });
        idx += size;
      }
    } else {
      const size = Math.max(1, Math.min(teamSize, shuffled.length));
      while (shuffled.length > 0) {
        result.push({
          id: generateId(),
          name: `Team ${result.length + 1}`,
          members: shuffled.splice(0, size).map((m) => m.name),
        });
      }
    }
    setTeams(result);
  }, [participants, mode, teamCount, teamSize]);

  const reshuffle = useCallback(() => {
    if (teams.length === 0) {
      generateTeams();
      return;
    }
    const allMembers = teams.flatMap((t) => t.members);
    const shuffled = shuffleArray(allMembers);
    let idx = 0;
    const result = teams.map((t) => {
      const members = shuffled.slice(idx, idx + t.members.length);
      idx += members.length;
      return { ...t, members };
    });
    setTeams(result);
  }, [teams, generateTeams]);

  const copyTeams = useCallback(async () => {
    if (teams.length === 0) return;
    const text = teams
      .map((t) => `${t.name}:\n  ${t.members.join(", ")}`)
      .join("\n\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }, [teams]);

  const exportCsv = useCallback(() => {
    if (teams.length === 0) return;
    const rows = [["Team", "Members"].join(",")];
    teams.forEach((t) => {
      t.members.forEach((m) => rows.push([t.name, m].join(",")));
    });
    const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "teams.csv";
    a.click();
    URL.revokeObjectURL(url);
  }, [teams]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter") {
        if (inputValue.includes("\n") || inputValue.includes(",")) {
          addBulk();
        } else {
          addParticipant();
        }
      }
    },
    [inputValue, addParticipant, addBulk]
  );

  const allMembers = useMemo(
    () => (teams.length > 0 ? teams.flatMap((t) => t.members) : []),
    [teams]
  );

  return (
    <div className="min-h-screen bg-(--background)">
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-(--foreground)">Team Generator</h1>
          <p className="text-(--muted-foreground) mt-1">Create balanced teams from any list of participants</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-2xl bg-(--card) border border-(--border) p-5 space-y-4">
              <h3 className="text-sm font-semibold text-(--foreground)">Participants</h3>
              <div className="flex gap-2">
                <input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Add name or paste list..."
                  className="flex-1 px-3 py-2 rounded-xl bg-(--muted) border border-(--border) text-(--foreground) placeholder:text-(--muted-foreground) focus:outline-none focus:ring-2 focus:ring-(--primary) text-sm"
                />
                <button
                  onClick={addParticipant}
                  disabled={!inputValue.trim()}
                  className="px-3 py-2 rounded-xl bg-(--primary) text-(--primary-foreground) font-semibold text-sm hover:opacity-90 disabled:opacity-40 transition"
                >
                  <Plus size="16" />
                </button>
              </div>

              {participants.length === 0 ? (
                <div className="text-center py-8 text-(--muted-foreground)">
                  <Users size="32" className="mx-auto mb-2 opacity-30" />
                  <p className="text-xs">No participants</p>
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto custom-scrollbar">
                    <AnimatePresence>
                      {participants.map((p, i) => (
                        <motion.span
                          key={p.id}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ delay: i * 0.02 }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-(--muted) text-(--foreground) text-xs font-medium border border-(--border)"
                        >
                          {p.name}
                          <button onClick={() => removeParticipant(p.id)} className="hover:opacity-60">
                            <X size="10" />
                          </button>
                        </motion.span>
                      ))}
                    </AnimatePresence>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-(--border)">
                    <span className="text-xs text-(--muted-foreground)">{participants.length} people</span>
                    <button onClick={() => setParticipants([])} className="text-xs text-(--muted-foreground) hover:text-(--foreground) transition flex items-center gap-1">
                      <Trash2 size="10" /> Clear
                    </button>
                  </div>
                </>
              )}
            </div>

            <div className="rounded-2xl bg-(--card) border border-(--border) p-5 space-y-4">
              <h3 className="text-sm font-semibold text-(--foreground)">Settings</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setMode("count")}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition ${
                    mode === "count"
                      ? "bg-(--primary) text-(--primary-foreground) border-(--primary)"
                      : "bg-(--card) text-(--muted-foreground) border-(--border) hover:border-(--primary)"
                  }`}
                >
                  Number of Teams
                </button>
                <button
                  onClick={() => setMode("size")}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition ${
                    mode === "size"
                      ? "bg-(--primary) text-(--primary-foreground) border-(--primary)"
                      : "bg-(--card) text-(--muted-foreground) border-(--border) hover:border-(--primary)"
                  }`}
                >
                  Team Size
                </button>
              </div>

              {mode === "count" ? (
                <div>
                  <label className="text-xs text-(--muted-foreground) block mb-1">Number of teams</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="2"
                      max="20"
                      value={teamCount}
                      onChange={(e) => setTeamCount(Number(e.target.value))}
                      className="flex-1 accent-(--primary)"
                    />
                    <span className="text-sm font-bold text-(--foreground) w-6 text-center">{teamCount}</span>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="text-xs text-(--muted-foreground) block mb-1">People per team</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="1"
                      max="20"
                      value={teamSize}
                      onChange={(e) => setTeamSize(Number(e.target.value))}
                      className="flex-1 accent-(--primary)"
                    />
                    <span className="text-sm font-bold text-(--foreground) w-6 text-center">{teamSize}</span>
                  </div>
                </div>
              )}

              <button
                onClick={generateTeams}
                disabled={participants.length < 2}
                className="w-full py-3 rounded-xl bg-(--primary) text-(--primary-foreground) font-bold hover:opacity-90 disabled:opacity-40 transition flex items-center justify-center gap-2"
              >
                <Shuffle size="18" /> Generate Teams
              </button>
            </div>
          </div>

          <div className="lg:col-span-3 space-y-4">
            {teams.length === 0 ? (
              <div className="rounded-2xl bg-(--card) border border-(--border) p-12 text-center">
                <Users size="48" className="mx-auto mb-3 text-(--muted-foreground) opacity-30" />
                <p className="text-(--muted-foreground) text-sm">Add participants and generate teams to see results here</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-(--foreground)">Results</h3>
                  <div className="flex gap-2">
                    <button onClick={reshuffle} className="px-3 py-1.5 rounded-lg bg-(--muted) text-(--muted-foreground) hover:text-(--foreground) text-xs font-medium transition flex items-center gap-1">
                      <Shuffle size="12" /> Reshuffle
                    </button>
                    <button onClick={copyTeams} className="px-3 py-1.5 rounded-lg bg-(--muted) text-(--muted-foreground) hover:text-(--foreground) text-xs font-medium transition flex items-center gap-1">
                      {copied ? <Check size="12" /> : <Copy size="12" />}
                      {copied ? "Copied!" : "Copy"}
                    </button>
                    <button onClick={exportCsv} className="px-3 py-1.5 rounded-lg bg-(--muted) text-(--muted-foreground) hover:text-(--foreground) text-xs font-medium transition flex items-center gap-1">
                      <Download size="12" /> CSV
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <AnimatePresence>
                    {teams.map((team, ti) => (
                      <motion.div
                        key={team.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: ti * 0.05 }}
                        className="rounded-2xl bg-(--card) border border-(--border) p-4"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-(--foreground) text-sm">{team.name}</h4>
                          <span className="text-[10px] text-(--muted-foreground) bg-(--muted) px-2 py-0.5 rounded-full">
                            {team.members.length}
                          </span>
                        </div>
                        <div className="space-y-1">
                          {team.members.map((member, mi) => (
                            <div
                              key={`${team.id}-${mi}`}
                              className="px-2.5 py-1.5 rounded-lg bg-(--muted) text-(--foreground) text-xs font-medium"
                            >
                              {member}
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
