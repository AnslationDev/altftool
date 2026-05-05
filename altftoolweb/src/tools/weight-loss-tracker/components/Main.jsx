"use client";
import React, { useState, useEffect } from "react";
import Features from "./Features";

export default function MainComponent() {
  const [isEditingGoal, setIsEditingGoal] = useState(true);
  const [entries, setEntries] = useState([]);
  const [currentWeight, setCurrentWeight] = useState("");
  const [targetWeight, setTargetWeight] = useState("");
  const [unit, setUnit] = useState("kg");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const saved = {
      entries: [],
      targetWeight: "",
      unit: "kg",
    };

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEntries(saved.entries);
    setTargetWeight(saved.targetWeight);
    setUnit(saved.unit);
  }, []);

  const addEntry = () => {
    if (!currentWeight) {
      alert("Please enter your weight");
      return;
    }

    const newEntry = {
      id: Date.now(),
      weight: parseFloat(currentWeight),
      date: date,
      notes: notes,
      timestamp: new Date().toISOString(),
    };

    const updatedEntries = [newEntry, ...entries];
    setEntries(updatedEntries);

    setCurrentWeight("");
    setNotes("");
    setDate(new Date().toISOString().split("T")[0]);
    setShowForm(false);
  };

  const deleteEntry = (id) => {
    if (confirm("Are you sure you want to delete this entry?")) {
      setEntries(entries.filter((e) => e.id !== id));
    }
  };

  const stats = {
    current: entries.length > 0 ? entries[0].weight : 0,
    starting: entries.length > 0 ? entries[entries.length - 1].weight : 0,
    target: parseFloat(targetWeight) || 0,
    progress: 0,
    remaining: 0,
    trend: 0,
  };

  if (stats.starting && stats.target) {
    const totalToLose = stats.starting - stats.target;
    const lostSoFar = stats.starting - stats.current;
    stats.progress = totalToLose > 0 ? (lostSoFar / totalToLose) * 100 : 0;
    stats.remaining = stats.current - stats.target;
  }

  if (entries.length >= 2) {
    const recent = entries.slice(0, Math.min(7, entries.length));
    if (recent.length >= 2) {
      stats.trend = recent[0].weight - recent[recent.length - 1].weight;
    }
  }

  //   const chartData = [...entries].reverse().slice(-10);
  //   const maxWeight = Math.max(
  //     ...chartData.map((e) => e.weight),
  //     stats.target || 0,
  //   );
  //   const minWeight = Math.min(
  //     ...chartData.map((e) => e.weight),
  //     stats.target || 0,
  //   );
  //   const range = maxWeight - minWeight || 1;
  // FIXED: Sorting entries by date so the chart flows correctly
  // FIXED CHART DATA
  const chartData = [...entries]
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(-10);

  // FIX: Prevent crash when no data
  const weightValues = chartData.length ? chartData.map((e) => e.weight) : [0];
  if (stats.target) weightValues.push(stats.target);

  // FIX: Add buffer for visuals
  const maxWeight = Math.max(...weightValues) + 2;
  const minWeight = Math.min(...weightValues) - 2;
  const range = maxWeight - minWeight || 1;

  return (
    <div className="p-4 sm:p-8 bg-(--background)">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="heading mb-4">Weight Loss Tracker</h1>
          <p className="description max-w-2xl mx-auto">
            Track your weight loss journey with visual progress charts,
            statistics, and motivational insights.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="rounded-2xl p-6 shadow-lg bg-(--card) border border-(--border)">
            <div className="text-sm mb-2 text-(--muted-foreground)">
              Current Weight
            </div>
            <div className="text-3xl font-bold text-(--primary) font-primary">
              {stats.current || "--"} <span className="text-lg">{unit}</span>
            </div>
          </div>

          <div className="rounded-2xl p-6 shadow-lg bg-(--card) border border-(--border)">
            <div className="text-sm mb-2 text-(--muted-foreground)">
              Target Weight
            </div>
            <div className="text-3xl font-bold text-(--foreground) font-primary">
              {stats.target || "--"} <span className="text-lg">{unit}</span>
            </div>
          </div>

          <div className="rounded-2xl p-6 shadow-lg bg-(--card) border border-(--border)">
            <div className="text-sm mb-2 text-(--muted-foreground)">
              Lost So Far
            </div>
            <div
              className={`text-3xl font-bold font-primary ${
                stats.starting - stats.current > 0
                  ? "text-green-500"
                  : "text-(--foreground)"
              }`}
            >
              {stats.starting
                ? (stats.starting - stats.current).toFixed(1)
                : "--"}{" "}
              <span className="text-lg">{unit}</span>
            </div>
          </div>

          <div className="rounded-2xl p-6 shadow-lg bg-(--card) border border-(--border)">
            <div className="text-sm mb-2 text-(--muted-foreground)">
              To Goal
            </div>
            <div className="text-3xl font-bold text-(--foreground) font-primary">
              {stats.target && stats.current
                ? stats.remaining.toFixed(1)
                : "--"}{" "}
              <span className="text-lg">{unit}</span>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Goal Setup */}
            {/* FIXED: Using isEditingGoal instead of !targetWeight */}
            {isEditingGoal ? (
              <div className="rounded-2xl p-6 shadow-lg bg-(--card) border-2 border-(--primary)">
                <h2 className="text-xl font-bold mb-4 text-(--foreground) font-primary">
                  🎯 Set Your Goal
                </h2>
                <div className="flex gap-2 flex-col sm:flex-row">
                  <input
                    type="number"
                    step="0.1"
                    value={targetWeight}
                    onChange={(e) => setTargetWeight(e.target.value)}
                    placeholder="Enter target weight"
                    className="flex-1 px-4 py-3 rounded-lg font-medium bg-(--background) border-2 border-(--border) text-(--foreground) focus:ring-2 ring-(--primary)"
                  />
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="px-4 py-3 rounded-lg font-medium bg-(--background) border-2 border-(--border) text-(--foreground)"
                  >
                    <option value="kg">kg</option>
                    <option value="lbs">lbs</option>
                  </select>
                  <button
                    onClick={() => setIsEditingGoal(false)}
                    className="px-6 py-2 bg-(--primary) text-white rounded-lg font-bold cursor-pointer"
                  >
                    Set
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsEditingGoal(true)}
                className="text-sm text-(--primary) font-semibold hover:underline cursor-pointer"
              >
                Edit Goal: {targetWeight} {unit}
              </button>
            )}

            {/* Add Entry Button */}
            {!showForm ? (
              <button
                className="cursor-pointer w-full py-4 rounded-xl text-lg font-bold bg-(--primary) text-(--primary-foreground) font-primary transition-all hover:scale-105 active:scale-95 shadow-lg"
                onClick={() => setShowForm(true)}
              >
                + Add Weight Entry
              </button>
            ) : null}

            {/* Add Entry Form */}
            {showForm && (
              <div className="rounded-2xl p-6 shadow-lg bg-(--card) border border-(--border)">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-(--foreground) font-primary">
                    Add Weight Entry
                  </h2>
                  <button
                    onClick={() => setShowForm(false)}
                    className="text-2xl text-(--muted-foreground) cursor-pointer"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-(--foreground)">
                        Weight ({unit})
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={currentWeight}
                        onChange={(e) => setCurrentWeight(e.target.value)}
                        placeholder="75.5"
                        className="w-full px-4 py-3 rounded-lg font-medium bg-(--background) border-2 border-(--border) text-(--foreground) focus:ring-2 ring-(--primary)"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2 text-(--foreground)">
                        Date
                      </label>
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg font-medium bg-(--background) border-2 border-(--border) text-(--foreground) focus:ring-2 ring-(--primary)"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-(--foreground)">
                      Notes (optional)
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      placeholder="How are you feeling?"
                      className="w-full px-4 py-3 rounded-lg bg-(--background) border-2 border-(--border) text-(--foreground) font-medium resize-none focus:ring-2 ring-(--primary)"
                    />
                  </div>

                  <button
                    onClick={addEntry}
                    className="cursor-pointer w-full py-3 rounded-xl font-bold bg-(--primary) text-(--primary-foreground) font-primary transition-all hover:scale-105 active:scale-95"
                  >
                    Save Entry
                  </button>
                </div>
              </div>
            )}

            {/* Progress Chart */}
            {chartData.length > 0 && (
              <div className="rounded-2xl p-6 shadow-lg bg-(--card) border border-(--border)">
                <h2 className="text-xl font-bold mb-6 text-(--foreground) font-primary">
                  Progress Chart
                </h2>

                <div className="relative h-64">
                  {/* Y-axis */}
                  <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-(--muted-foreground)">
                    <span>{maxWeight.toFixed(1)}</span>
                    <span>{((maxWeight + minWeight) / 2).toFixed(1)}</span>
                    <span>{minWeight.toFixed(1)}</span>
                  </div>

                  {/* Bars */}
                  <div className="ml-12 h-full flex items-end gap-2">
                    {chartData.map((entry) => {
                      const height = ((entry.weight - minWeight) / range) * 100;

                      return (
                        <div
                          key={entry.id}
                          className="flex-1 flex flex-col items-center gap-2"
                        >
                          <div
                            className="w-full rounded-t-lg bg-(--primary) group relative min-h-1"
                            style={{ height: `${height}%` }}
                          >
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 text-xs px-2 py-1 rounded bg-(--foreground) text-(--background)">
                              {entry.weight} {unit}
                            </div>
                          </div>

                          <div className="text-xs rotate-45 origin-top-left text-(--muted-foreground)">
                            {new Date(entry.date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Goal line */}
                  {stats.target && (
                    <div
                      className="absolute ml-12 left-0 right-0 border-t-2 border-dashed border-green-500"
                      style={{
                        bottom: `${((stats.target - minWeight) / range) * 100}%`,
                      }}
                    >
                      <span className="absolute right-0 -top-3 text-xs px-2 rounded bg-green-500 text-white">
                        Goal
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Progress Bar */}
            {stats.target && stats.progress > 0 && (
              <div className="rounded-2xl p-6 shadow-lg bg-(--card) border border-(--border)">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-semibold text-(--foreground)">
                    Overall Progress
                  </span>
                  <span className="text-2xl font-bold text-(--primary) font-primary">
                    {Math.min(100, stats.progress).toFixed(1)}%
                  </span>
                </div>

                <div className="h-4 bg-(--muted) rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-(--primary) transition-all"
                    style={{
                      width: `${Math.min(100, stats.progress)}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Right Column — Recent Entries */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl p-6 shadow-lg bg-(--card) border border-(--border) sticky top-4">
              <h2 className="text-xl font-bold mb-4 text-(--foreground) font-primary">
                Recent Entries
              </h2>

              {entries.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">📊</div>
                  <p className="text-sm text-(--muted-foreground)">
                    No entries yet. Add your first weight entry to start
                    tracking!
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-150 overflow-y-auto">
                  {entries.map((entry, index) => {
                    const prevWeight = entries[index + 1]?.weight;
                    const change = prevWeight ? entry.weight - prevWeight : 0;

                    return (
                      <div
                        key={entry.id}
                        className="p-4 rounded-lg bg-(--muted) transition-all hover:scale-105"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="text-2xl font-bold text-(--primary) font-primary">
                              {entry.weight} {unit}
                            </div>
                            <div className="text-sm text-(--muted-foreground)">
                              {new Date(entry.date).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                },
                              )}
                            </div>
                          </div>

                          <button
                            className="text-sm px-2 py-1 rounded text-(--muted-foreground) hover:text-red-500 cursor-pointer"
                            onClick={() => deleteEntry(entry.id)}
                          >
                            ×
                          </button>
                        </div>

                        {change !== 0 && (
                          <div
                            className={`text-sm font-semibold ${
                              change < 0 ? "text-green-500" : "text-red-500"
                            }`}
                          >
                            {change > 0 ? "↑" : "↓"}{" "}
                            {Math.abs(change).toFixed(1)} {unit}
                          </div>
                        )}

                        {entry.notes && (
                          <div className="text-sm mt-2 p-2 rounded bg-(--background) text-(--muted-foreground)">
                            {entry.notes}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
        <Features/>
      </div>
    </div>
  );
}
