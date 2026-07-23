"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HelpCircle,
  BookOpen,
  Sparkles,
  Trophy,
  ChevronDown,
  Lightbulb,
  Zap,
  CheckCircle2,
} from "lucide-react";

export default function EducationalCards() {
  const [openSection, setOpenSection] = useState("what-is");

  const toggleSection = (id) => {
    setOpenSection((prev) => (prev === id ? null : id));
  };

  const SECTIONS = [
    {
      id: "what-is",
      title: "What is an Anagram?",
      icon: BookOpen,
      color: "text-teal-500 bg-teal-500/10 border-teal-500/20",
      content: (
        <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
          <p>
            An <strong className="text-foreground">anagram</strong> is a word or phrase formed by rearranging the exact letters of another word or phrase, using all the original letters exactly once.
          </p>
          <p>
            For example, the letters in <strong className="text-teal-600 dark:text-teal-400 font-mono">"listen"</strong> can be rearranged to spell <strong className="text-teal-600 dark:text-teal-400 font-mono">"silent"</strong>, <strong className="text-teal-600 dark:text-teal-400 font-mono">"enlist"</strong>, <strong className="text-teal-600 dark:text-teal-400 font-mono">"inlets"</strong>, and <strong className="text-teal-600 dark:text-teal-400 font-mono">"tinsel"</strong>.
          </p>
          <div className="p-3.5 rounded-2xl bg-surface-soft/80 border border-border/60 flex items-start gap-2.5">
            <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs">
              <strong>Fun Fact:</strong> Anagrams have been used since ancient Greece for cryptic messages, pseudonyms, and literary wordplay!
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "how-to-use",
      title: "How to Use the AltF Anagram Generator",
      icon: Zap,
      color: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20",
      content: (
        <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-surface-soft/80 border border-border/60 space-y-1.5">
              <span className="w-6 h-6 rounded-full bg-teal-500/10 text-teal-500 text-xs font-bold flex items-center justify-center">1</span>
              <h4 className="text-xs font-bold text-foreground">Enter Letters</h4>
              <p className="text-xs">Type any word, scrambled letters, or phrase in the main search workspace.</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-surface-soft/80 border border-border/60 space-y-1.5">
              <span className="w-6 h-6 rounded-full bg-indigo-500/10 text-indigo-500 text-xs font-bold flex items-center justify-center">2</span>
              <h4 className="text-xs font-bold text-foreground">Apply Filters</h4>
              <p className="text-xs">Filter by word length, prefix, suffix, dictionary matching, or sort preference.</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-surface-soft/80 border border-border/60 space-y-1.5">
              <span className="w-6 h-6 rounded-full bg-purple-500/10 text-purple-500 text-xs font-bold flex items-center justify-center">3</span>
              <h4 className="text-xs font-bold text-foreground">Copy & Export</h4>
              <p className="text-xs">Click to copy anagrams, bookmark favorites, or export all results as TXT/CSV/JSON.</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "famous-examples",
      title: "Famous Anagram Examples",
      icon: Sparkles,
      color: "text-purple-500 bg-purple-500/10 border-purple-500/20",
      content: (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {[
            { word: "Astronomer", anagram: "Moon starer" },
            { word: "Dormitory", anagram: "Dirty room" },
            { word: "The Eyes", anagram: "They see" },
            { word: "A gentleman", anagram: "Elegant man" },
            { word: "Conversation", anagram: "Voices rant on" },
            { word: "Eleven plus two", anagram: "Twelve plus one" },
          ].map((item, i) => (
            <div
              key={i}
              className="p-3 rounded-xl bg-surface-soft/60 border border-border/60 flex items-center justify-between font-mono"
            >
              <span className="text-foreground font-semibold">{item.word}</span>
              <span className="text-muted-foreground">&rarr;</span>
              <span className="text-teal-600 dark:text-teal-400 font-bold">{item.anagram}</span>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: "game-tips",
      title: "Pro Tips for Scrabble, Wordle & Word Games",
      icon: Trophy,
      color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
      content: (
        <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <span>Look for high-scoring letter combinations like <strong>-ING</strong>, <strong>-ED</strong>, <strong>-EST</strong>, and <strong>-TION</strong> suffixes.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <span>Separate vowels and consonants into distinct groups to easily visualize valid permutations.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <span>Use wildcard letter matching when playing Scrabble to find optimal 7-letter bingo words!</span>
          </li>
        </ul>
      ),
    },
    {
      id: "faqs",
      title: "Frequently Asked Questions",
      icon: HelpCircle,
      color: "text-blue-500 bg-blue-500/10 border-blue-500/20",
      content: (
        <div className="space-y-3 text-xs sm:text-sm text-muted-foreground">
          <div>
            <h5 className="font-bold text-foreground">Is this Anagram Solver free to use?</h5>
            <p>Yes, 100% free with zero registration, unlimited letter generation, and instant exports.</p>
          </div>
          <div>
            <h5 className="font-bold text-foreground">Does it support phrase anagrams?</h5>
            <p>Yes! You can enter multiple words or full sentences to generate scrambled permutations across words.</p>
          </div>
          <div>
            <h5 className="font-bold text-foreground">Are my inputs saved on a server?</h5>
            <p>No. All calculations take place client-side in your browser for absolute privacy and lightning speed.</p>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-border/40">
        <div className="p-2 rounded-xl bg-teal-500/10 text-teal-500">
          <BookOpen className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base sm:text-lg font-bold text-foreground">
            Anagram Knowledge & FAQ Center
          </h2>
          <p className="text-xs text-muted-foreground">
            Learn wordplay techniques, game strategies, and how to get the most out of our solver.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {SECTIONS.map((section) => {
          const Icon = section.icon;
          const isOpen = openSection === section.id;

          return (
            <div
              key={section.id}
              className="rounded-2xl bg-surface-soft/60 border border-border/80 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
            >
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full p-4 flex items-center justify-between text-left focus:outline-none focus:ring-2 focus:ring-teal-500/50"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl border ${section.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-foreground tracking-tight">
                    {section.title}
                  </span>
                </div>
                <motion.div
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="p-1 rounded-lg bg-card text-muted-foreground"
                >
                  <ChevronDown size={14} />
                </motion.div>
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 pt-1 border-t border-border/40">
                      {section.content}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
