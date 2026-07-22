"use client";

import React, { useState } from "react";
import { Wifi, CheckCircle, XCircle, RefreshCw, Award } from "lucide-react";

const QUESTIONS = [
  { q: "What does TCP stand for?", options: ["Transmission Control Protocol", "Transfer Control Process", "Transport Communication Protocol", "Terminal Control Program"], answer: 0 },
  { q: "Which layer of the OSI model handles routing?", options: ["Data Link", "Network", "Transport", "Session"], answer: 1 },
  { q: "What is the default port for HTTP?", options: ["21", "80", "443", "8080"], answer: 1 },
  { q: "What does IP stand for?", options: ["Internal Protocol", "Internet Protocol", "Interconnection Process", "Information Packet"], answer: 1 },
  { q: "Which device connects different networks together?", options: ["Switch", "Hub", "Router", "Modem"], answer: 2 },
  { q: "What is a MAC address?", options: ["A network name", "A unique hardware identifier", "An IP address version", "A type of cable"], answer: 1 },
  { q: "What does DNS do?", options: ["Assigns IP addresses", "Translates domain names to IP addresses", "Encrypts network traffic", "Manages network cables"], answer: 1 },
  { q: "Which protocol is used for secure web browsing?", options: ["HTTP", "FTP", "HTTPS", "SMTP"], answer: 2 },
  { q: "What is the range of a Class A IP address?", options: ["1.0.0.0 to 126.255.255.255", "128.0.0.0 to 191.255.255.255", "192.0.0.0 to 223.255.255.255", "224.0.0.0 to 239.255.255.255"], answer: 0 },
  { q: "What is a subnet mask used for?", options: ["Encrypting data", "Dividing a network into smaller subnets", "Assigning MAC addresses", "Routing packets"], answer: 1 },
  { q: "What does DHCP do?", options: ["Dynamically assigns IP addresses", "Resolves domain names", "Encrypts traffic", "Monitors network health"], answer: 0 },
  { q: "Which topology has all devices connected to a single central cable?", options: ["Star", "Ring", "Bus", "Mesh"], answer: 2 },
  { q: "What is the purpose of a firewall?", options: ["Speed up the network", "Block unauthorized access", "Assign IP addresses", "Connect different networks"], answer: 1 },
  { q: "What does LAN stand for?", options: ["Large Area Network", "Local Area Network", "Long Access Network", "Logic Address Network"], answer: 1 },
  { q: "Which protocol is used to send email?", options: ["HTTP", "FTP", "SMTP", "SNMP"], answer: 2 },
];

export default function ToolHome() {
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(null);
  const [finished, setFinished] = useState(false);

  const answer = (idx) => {
    if (answered !== null) return;
    setAnswered(idx);
    if (idx === QUESTIONS[current].answer) setScore(score + 1);
  };

  const next = () => {
    if (current < QUESTIONS.length - 1) {
      setCurrent(current + 1);
      setAnswered(null);
    } else {
      setFinished(true);
    }
  };

  const reset = () => {
    setCurrent(0);
    setScore(0);
    setAnswered(null);
    setFinished(false);
  };

  const q = QUESTIONS[current];

  if (finished) {
    const pct = Math.round((score / QUESTIONS.length) * 100);
    return (
      <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-card border border-border rounded-2xl p-8 shadow-sm text-center space-y-6">
            <Award size={64} className="mx-auto text-primary" />
            <h2 className="text-2xl font-black text-foreground">Quiz Complete!</h2>
            <div className="text-5xl font-black text-primary">{score}/{QUESTIONS.length}</div>
            <div className="text-lg text-muted-foreground">{pct}% Correct</div>
            <div className="w-full bg-surface-soft rounded-full h-4 border border-border overflow-hidden">
              <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
            </div>
            <button onClick={reset} className="px-8 py-3 bg-primary text-primary-foreground rounded-xl font-bold text-sm hover:opacity-90 flex items-center gap-2 mx-auto">
              <RefreshCw size={16} /> Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <section className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-sm group">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-soft text-primary group-hover:bg-primary/10 transition-colors">
              <Wifi className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground leading-none">Networking Basics Quiz</h1>
              <p className="text-xs text-muted-foreground mt-1">Test your networking knowledge.</p>
            </div>
          </div>
        </section>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground">Question {current + 1} of {QUESTIONS.length}</span>
            <span className="text-xs font-bold text-primary">Score: {score}</span>
          </div>
          <div className="w-full bg-surface-soft rounded-full h-1.5">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${((current + 1) / QUESTIONS.length) * 100}%` }} />
          </div>

          <h2 className="text-lg font-bold text-foreground">{q.q}</h2>

          <div className="space-y-2">
            {q.options.map((opt, idx) => {
              let cls = "bg-surface-soft border-border text-foreground hover:border-primary";
              if (answered !== null) {
                if (idx === q.answer) cls = "bg-green-500/10 border-green-500 text-green-500";
                else if (idx === answered && idx !== q.answer) cls = "bg-red-500/10 border-red-500 text-red-500";
                else cls = "bg-surface-soft border-border text-muted-foreground opacity-60";
              }
              return (
                <button
                  key={idx}
                  onClick={() => answer(idx)}
                  className={`w-full text-left px-5 py-4 rounded-xl border-2 text-sm font-medium transition flex items-center gap-3 ${cls}`}
                  disabled={answered !== null}
                >
                  {answered !== null && idx === q.answer && <CheckCircle size={18} className="text-green-500 shrink-0" />}
                  {answered !== null && idx === answered && idx !== q.answer && <XCircle size={18} className="text-red-500 shrink-0" />}
                  <span>{opt}</span>
                </button>
              );
            })}
          </div>

          {answered !== null && (
            <button
              onClick={next}
              className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-bold text-sm hover:opacity-90"
            >
              {current < QUESTIONS.length - 1 ? "Next Question →" : "See Results"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
