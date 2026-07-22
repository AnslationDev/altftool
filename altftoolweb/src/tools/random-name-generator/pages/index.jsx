"use client";

import React, { useState } from "react";
import { Users, Copy, Check, Shuffle, RefreshCw, User } from "lucide-react";

const FIRST_NAMES = {
  male: ["James", "John", "Robert", "Michael", "William", "David", "Richard", "Joseph", "Thomas", "Christopher", "Daniel", "Matthew", "Anthony", "Mark", "Donald", "Steven", "Paul", "Andrew", "Joshua", "Kenneth", "Kevin", "Brian", "George", "Timothy", "Ronald", "Edward", "Jason", "Jeffrey", "Ryan", "Jacob", "Gary", "Nicholas", "Eric", "Jonathan", "Stephen", "Larry", "Justin", "Scott", "Brandon", "Benjamin", "Samuel", "Raymond", "Gregory", "Frank", "Alexander", "Patrick", "Jack", "Dennis", "Jerry", "Tyler"],
  female: ["Mary", "Patricia", "Jennifer", "Linda", "Barbara", "Elizabeth", "Susan", "Jessica", "Sarah", "Karen", "Lisa", "Nancy", "Betty", "Margaret", "Sandra", "Ashley", "Kimberly", "Emily", "Donna", "Michelle", "Carol", "Amanda", "Dorothy", "Melissa", "Deborah", "Stephanie", "Rebecca", "Sharon", "Laura", "Cynthia", "Kathleen", "Amy", "Angela", "Shirley", "Anna", "Brenda", "Pamela", "Emma", "Nicole", "Helen", "Samantha", "Katherine", "Christine", "Debra", "Rachel", "Carolyn", "Janet", "Catherine", "Maria", "Olivia"],
  neutral: ["Alex", "Jordan", "Casey", "Riley", "Taylor", "Morgan", "Jamie", "Avery", "Quinn", "Harper", "Parker", "Reese", "Finley", "Skyler", "Dakota", "Rowan", "Emerson", "Blake", "Cameron", "Drew", "Sage", "Shiloh", "Marley", "Jules", "Kerry", "Pat", "Sam", "Charlie", "Frankie", "Stevie"]
};

const LAST_NAMES = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", "Walker", "Young", "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores", "Green", "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell", "Mitchell", "Carter", "Roberts"];

export default function ToolHome() {
  const [gender, setGender] = useState("any");
  const [count, setCount] = useState(10);
  const [names, setNames] = useState([]);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const generateNames = () => {
    const pools = gender === "any"
      ? [...FIRST_NAMES.male, ...FIRST_NAMES.female, ...FIRST_NAMES.neutral]
      : gender === "neutral"
        ? FIRST_NAMES.neutral
        : [...FIRST_NAMES[gender], ...FIRST_NAMES.neutral];

    const result = [];
    for (let i = 0; i < count; i++) {
      const first = pools[Math.floor(Math.random() * pools.length)];
      const last = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
      result.push(`${first} ${last}`);
    }
    setNames(result);
  };

  const copyName = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1200);
  };

  const copyAll = () => {
    navigator.clipboard.writeText(names.join("\n"));
    setCopiedIndex(-1);
    setTimeout(() => setCopiedIndex(null), 1200);
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-7xl mx-auto space-y-8">
        <section className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-sm group">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-soft text-primary group-hover:bg-primary/10 transition-colors duration-300">
                <Users className="h-5 w-5 text-primary group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-300" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-bold text-foreground leading-none">Random Name Generator</h1>
                  <span className="inline-flex rounded-md border border-border bg-background px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">Content Creation, Fun</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 max-w-xl leading-relaxed">
                  Generate random full names — first and last — for characters, usernames, writing prompts, or creative projects.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 text-[10px] font-semibold text-muted-foreground shrink-0 self-start md:self-auto">
              {["Runs locally", "No upload", "Fast"].map((item) => (
                <span key={item} className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1">
                  <Check className="h-3 w-3 text-primary" />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
              <h2 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <User size={14} className="text-primary" />
                Name Options
              </h2>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground uppercase tracking-wider">Gender</label>
                  <div className="flex flex-wrap gap-2">
                    {["any", "male", "female", "neutral"].map((g) => (
                      <button
                        key={g}
                        onClick={() => setGender(g)}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
                          gender === g
                            ? "bg-primary text-primary-foreground"
                            : "bg-surface-soft border border-border text-foreground hover:border-primary"
                        }`}
                      >
                        {g.charAt(0).toUpperCase() + g.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground uppercase tracking-wider">How Many?</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={1}
                      max={50}
                      value={count}
                      onChange={(e) => setCount(Number(e.target.value))}
                      className="w-full accent-primary"
                    />
                    <span className="text-sm font-bold text-foreground min-w-[3ch] text-right">{count}</span>
                  </div>
                </div>

                <button
                  onClick={generateNames}
                  className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-bold text-sm hover:opacity-90 transition flex items-center justify-center gap-2"
                >
                  <Shuffle size={16} />
                  Generate Names
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <RefreshCw size={14} className="text-primary" />
                  Generated Names
                </h2>
                {names.length > 0 && (
                  <button
                    onClick={copyAll}
                    className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1"
                  >
                    <Copy size={12} />
                    Copy All
                  </button>
                )}
              </div>

              <div className="min-h-[200px]">
                {names.length > 0 ? (
                  <ul className="space-y-1.5">
                    {names.map((name, index) => (
                      <li
                        key={index}
                        className="flex items-center justify-between px-4 py-2.5 bg-surface-soft rounded-lg border border-border group/item"
                      >
                        <span className="text-sm font-medium text-foreground">{name}</span>
                        <button
                          onClick={() => copyName(name, index)}
                          className="p-1.5 rounded-lg opacity-0 group-hover/item:opacity-100 transition border border-border bg-background hover:bg-primary/10"
                          title="Copy"
                        >
                          {copiedIndex === index ? (
                            <Check className="w-3.5 h-3.5 text-primary" />
                          ) : (
                            <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground text-xs text-center py-12">
                    Adjust the options above and click "Generate Names" to get started.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
