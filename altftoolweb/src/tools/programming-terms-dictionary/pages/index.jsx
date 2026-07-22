"use client";

import React, { useState } from "react";
import { BookOpen, Search, ChevronDown, ChevronRight } from "lucide-react";

const TERMS = [
  { term: "Abstraction", category: "OOP", definition: "Hiding complex implementation details and showing only the essential features of an object." },
  { term: "Agile", category: "Methodology", definition: "An iterative approach to software development that emphasizes flexibility, collaboration, and customer feedback." },
  { term: "Algorithm", category: "CS Basics", definition: "A step-by-step procedure or formula for solving a problem." },
  { term: "API", category: "Web", definition: "Application Programming Interface — a set of defined rules enabling different software to communicate." },
  { term: "Array", category: "Data Structures", definition: "A data structure that stores a collection of elements, each identified by an index." },
  { term: "Async/Await", category: "JavaScript", definition: "A modern JavaScript syntax for handling asynchronous operations in a more readable way." },
  { term: "Big O Notation", category: "CS Basics", definition: "A mathematical notation describing the upper bound of an algorithm's time or space complexity." },
  { term: "Boolean", category: "CS Basics", definition: "A data type with two possible values: true or false." },
  { term: "Bug", category: "General", definition: "An error, flaw, or fault in a computer program that causes it to produce an incorrect or unexpected result." },
  { term: "CI/CD", category: "DevOps", definition: "Continuous Integration and Continuous Deployment — automated building, testing, and deploying of code." },
  { term: "Class", category: "OOP", definition: "A blueprint for creating objects in object-oriented programming, defining properties and methods." },
  { term: "Closure", category: "JavaScript", definition: "A function that retains access to its outer scope even after the outer function has returned." },
  { term: "Compiler", category: "CS Basics", definition: "A program that translates source code written in a high-level language into machine code." },
  { term: "Component", category: "UI", definition: "A reusable, self-contained piece of a user interface in frameworks like React or Vue." },
  { term: "CRUD", category: "Web", definition: "Create, Read, Update, Delete — the four basic operations for persistent storage." },
  { term: "CSS", category: "Web", definition: "Cascading Style Sheets — a language used to describe the presentation of HTML documents." },
  { term: "Data Type", category: "CS Basics", definition: "A classification specifying which type of value a variable can hold (e.g., string, number, object)." },
  { term: "Database", category: "Data", definition: "An organized collection of structured information or data, typically stored electronically." },
  { term: "Debugging", category: "General", definition: "The process of identifying and removing errors from computer programs." },
  { term: "DOM", category: "Web", definition: "Document Object Model — a programming interface for HTML and XML documents." },
  { term: "Encapsulation", category: "OOP", definition: "Bundling data and methods that operate on that data within a single unit, restricting direct access." },
  { term: "Framework", category: "General", definition: "A pre-built structure of code that provides a foundation for developing applications." },
  { term: "Function", category: "CS Basics", definition: "A reusable block of code that performs a specific task." },
  { term: "Git", category: "DevOps", definition: "A distributed version control system for tracking changes in source code during development." },
  { term: "GUI", category: "General", definition: "Graphical User Interface — a visual way of interacting with a computer using windows, icons, and menus." },
  { term: "Hash Table", category: "Data Structures", definition: "A data structure that maps keys to values using a hash function for efficient lookup." },
  { term: "HTML", category: "Web", definition: "HyperText Markup Language — the standard language for creating web pages." },
  { term: "HTTP", category: "Web", definition: "HyperText Transfer Protocol — the foundation of data communication on the World Wide Web." },
  { term: "IDE", category: "Tools", definition: "Integrated Development Environment — a software application providing comprehensive tools for programming." },
  { term: "Inheritance", category: "OOP", definition: "A mechanism where one class acquires the properties and methods of another class." },
  { term: "JSON", category: "Web", definition: "JavaScript Object Notation — a lightweight data-interchange format that is easy for humans to read and write." },
  { term: "Library", category: "General", definition: "A collection of pre-written code that can be used to perform common tasks." },
  { term: "Loop", category: "CS Basics", definition: "A control structure that repeats a block of code as long as a specified condition is true." },
  { term: "Machine Learning", category: "AI", definition: "A subset of AI where systems learn from data to improve performance on a task without explicit programming." },
  { term: "Method", category: "OOP", definition: "A function that belongs to an object or class." },
  { term: "Module", category: "General", definition: "A self-contained unit of code that can be imported and used in other parts of an application." },
  { term: "Node.js", category: "JavaScript", definition: "A JavaScript runtime built on Chrome's V8 engine that allows JavaScript to run on the server side." },
  { term: "Null", category: "CS Basics", definition: "A special value representing the intentional absence of any object value." },
  { term: "OOP", category: "OOP", definition: "Object-Oriented Programming — a programming paradigm based on objects containing data and methods." },
  { term: "Polymorphism", category: "OOP", definition: "The ability of objects of different classes to respond to the same method call in their own way." },
  { term: "Promise", category: "JavaScript", definition: "An object representing the eventual completion or failure of an asynchronous operation." },
  { term: "React", category: "UI", definition: "A JavaScript library for building user interfaces, developed by Meta." },
  { term: "Recursion", category: "CS Basics", definition: "A technique where a function calls itself to solve smaller instances of the same problem." },
  { term: "Refactoring", category: "General", definition: "Restructuring existing code without changing its external behavior to improve readability and maintainability." },
  { term: "Regex", category: "Tools", definition: "Regular Expression — a sequence of characters defining a search pattern for text processing." },
  { term: "REST", category: "Web", definition: "Representational State Transfer — an architectural style for designing networked applications." },
  { term: "SDK", category: "General", definition: "Software Development Kit — a collection of tools, libraries, and documentation for building software." },
  { term: "SQL", category: "Data", definition: "Structured Query Language — a language for managing and querying relational databases." },
  { term: "State", category: "UI", definition: "The data that determines the current behavior and appearance of a component or application." },
  { term: "Variable", category: "CS Basics", definition: "A named storage location in memory that holds a value which can change during program execution." },
  { term: "Version Control", category: "DevOps", definition: "A system that records changes to files over time so you can recall specific versions later." },
  { term: "Webpack", category: "Tools", definition: "A static module bundler for JavaScript applications that bundles code and dependencies." },
  { term: "XML", category: "Web", definition: "eXtensible Markup Language — a markup language for encoding documents in a format readable by both humans and machines." },
];

const CATEGORIES = [...new Set(TERMS.map((t) => t.category))].sort();

export default function ToolHome() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [expanded, setExpanded] = useState(null);

  const filtered = TERMS.filter((t) => {
    if (categoryFilter !== "All" && t.category !== categoryFilter) return false;
    if (search && !t.term.toLowerCase().includes(search.toLowerCase()) && !t.definition.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-5xl mx-auto space-y-8">
        <section className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-sm group">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-soft text-primary group-hover:bg-primary/10 transition-colors">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground leading-none">Programming Terms Dictionary</h1>
              <p className="text-xs text-muted-foreground mt-1">Browse and search a comprehensive dictionary of programming concepts and jargon.</p>
            </div>
          </div>
        </section>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search terms or definitions..."
                className="w-full pl-9 pr-4 py-2.5 bg-surface-soft border border-border rounded-xl text-xs outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {["All", ...CATEGORIES].map((c) => (
                <button
                  key={c}
                  onClick={() => setCategoryFilter(c)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition ${
                    categoryFilter === c ? "bg-primary text-primary-foreground" : "bg-surface-soft border border-border text-foreground"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground">{filtered.length} term{filtered.length !== 1 ? "s" : ""} found</p>
        </div>

        <div className="space-y-2">
          {filtered.map((t) => (
            <div
              key={t.term}
              className="bg-card border border-border rounded-xl overflow-hidden transition"
            >
              <button
                onClick={() => setExpanded(expanded === t.term ? null : t.term)}
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-surface-soft/50 transition"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-foreground">{t.term}</span>
                  <span className="text-[9px] font-bold text-muted-foreground bg-surface-soft px-2 py-0.5 rounded border border-border">{t.category}</span>
                </div>
                {expanded === t.term ? <ChevronDown size={16} className="text-muted-foreground" /> : <ChevronRight size={16} className="text-muted-foreground" />}
              </button>
              {expanded === t.term && (
                <div className="px-5 pb-4 pt-0">
                  <p className="text-xs text-muted-foreground leading-relaxed pl-2 border-l-2 border-primary/30">{t.definition}</p>
                </div>
              )}
            </div>
          ))}
        </div>
        {filtered.length === 0 && (
          <p className="text-center text-xs text-muted-foreground py-12">No terms found matching your search.</p>
        )}
      </div>
    </div>
  );
}
