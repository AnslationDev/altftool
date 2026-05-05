import { FileText, History, CheckCircle, Clock, Trash2, XCircle } from "lucide-react";
import TemplatesDropdown from "./TemplatesDropdown";
import { useState, useEffect } from "react";

export default function InputSection({
userInput,
  setUserInput,
  generateReadme,
  setGeneratedReadme,
  history,
  showHistory,
  setShowHistory,
  clearHistory,
  clearSavedData,
  selectedSections,
setSelectedSections,
})
{
const [saveStatus, setSaveStatus] = useState("saved");

  // save status 
  useEffect(() => {
  const timeout = setTimeout(() => {
    setSaveStatus("saved");
  }, 600);

  return () => clearTimeout(timeout);
}, [userInput]);

// progress Gamification
const getProgress = () => {
  const text = userInput.toLowerCase();

  const checks = [
    {
      label: "Title added",
      done: userInput.trim().length > 0,
    },
    {
      label: "Overview added",
      done:
        text.includes("overview") ||
        text.includes("description") ||
        text.includes("about"),
    },
    {
      label: "Features added",
      done: text.includes("feature"),
    },
    {
      label: "Tech Stack added",
      done:
        text.includes("tech") ||
        text.includes("stack") ||
        text.includes("built with"),
    },
    {
      label: "Installation added",
      done: text.includes("install"),
    },
    {
      label: "Usage added",
      done: text.includes("usage") || text.includes("run"),
    },
  ];

  const completed = checks.filter((c) => c.done).length;
  const percent = Math.round((completed / checks.length) * 100);
return { checks, percent };
};
const { checks, percent } = getProgress();

// Section Toggle  Builder:
const toggleSection = (key) => {
  setSelectedSections((prev) => ({
    ...prev,
    [key]: !prev[key],
  }));
};

  return (
    <div className="bg-(--card) border border-(--border) rounded-2xl shadow-xl p-6 sm:p-8 relative overflow-visible">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-(--primary)/20 rounded-lg flex items-center justify-center">
            <FileText className="w-6 h-6 text-(--primary)" />
          </div>
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold">Project Details</h2>
        </div>
< div className="flex items-center gap-2">
    
    {/*  TEMPLATE BUTTON */}
     <TemplatesDropdown setUserInput={setUserInput} />
    {/* history button */}
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="p-2 rounded-lg hover:bg-(--muted) cursor-pointer "
        >
          <History className="w-5 h-5" />
        </button>
      </div>
      </div>

      {showHistory && history.length > 0 && (
        <div className="mb-4 bg-(--muted) rounded-lg p-4 max-h-48 overflow-y-auto ">
          <div className="flex justify-between mb-3">
            <span className="text-sm text-(--muted-foreground)">Recent</span>
            <button
              onClick={clearHistory}
              className="text-red-500 text-xs flex items-center gap-1 cursor-pointer p-2 rounded-lg hover:bg-(--background)"
            >
              <Trash2 className="w-3 h-3" /> Clear
            </button>
          </div>

          {history.map((item, i) => (
            <button
              key={i}
              onClick={() => setUserInput(item.text)}
              className="w-full text-left p-2 rounded hover:bg-(--background) cursor-pointer"
            >
              <div className="truncate text-sm">{item.text}</div>
              <div className="text-xs text-(--muted-foreground)">
                {new Date(item.timestamp).toLocaleString()}
              </div>
            </button>
          ))}
        </div>
      )}
<div className="flex items-center justify-between mb-2">
  
  {/* Save Status */}
  <div className="flex items-center gap-2 text-xs text-(--muted-foreground)">
    {saveStatus === "saving" ? (
      <>
        <Clock className="w-4 h-4 text-yellow-500" />
        <span>Saving...</span>
      </>
    ) : (
      <>
        <CheckCircle className="w-4 h-4 text-green-500" />
        <span>Auto-saved</span>
      </>
    )}
  </div>

  {/* Clear */}
  <button
    onClick={clearSavedData}
    className="flex items-center gap-1 text-xs text-red-500 hover:underline cursor-pointer"
  >
    <Trash2 className="w-4 h-4" />
    Clear saved
  </button>

</div>

      <textarea
        value={userInput}
        onChange={(e) => {
  setUserInput(e.target.value);
  setSaveStatus("saving");
}}
        placeholder={`Enter your project details... 
        
Example:
My Project
This is a web application for task management
Features: Create tasks, Set deadlines, Mark as complete
Tech: React, Node.js, MongoDB
Installation: npm install
Usage: npm start`}
        className="
          w-full h-96 bg-(--background)
          border border-(--border)
          rounded-lg p-4
          text-sm font-mono
          placeholder:text-(--muted-foreground)
          focus:ring-2 focus:ring-(--primary)
          outline-none resize-none
          overflow-y-scroll no-scrollbar
        "
      />
      {/* shortcut 1 */}
      <div className="text-xs text-(--muted-foreground) mt-2 flex items-center gap-2">
  <span>⚡</span>
  <span>Ctrl + Enter to generate</span>
</div>
{/* 🎮 Progress Tracker */}
<div className="mt-4 p-3 rounded-lg bg-(--muted) border border-(--border)">
  
  {/* Header */}
  <div className="flex items-center justify-between mb-2">
    <span className="text-sm font-medium text-(--foreground)">
      Progress
    </span>
    <span className="text-xs text-(--muted-foreground)">
      {percent}%
    </span>
  </div>

  {/* Progress bar */}
  <div className="w-full h-2 bg-(--background) rounded-full overflow-hidden mb-3">
    <div
      className="h-full bg-green-500 transition-all"
      style={{ width: `${percent}%` }}
    />
  </div>

  {/* Checklist */}
  <div className="space-y-1">
    {checks.map((item, i) => (
      <div key={i} className="flex items-center gap-2 text-xs">
        {item.done ? (
          <CheckCircle className="w-4 h-4 text-green-500" />
        ) : (
          <XCircle className="w-4 h-4 text-red-500" />
        )}
        <span
          className={`${
            item.done
              ? "text-(--foreground)"
              : "text-(--muted-foreground)"
          }`}
        >
          {item.label}
        </span>
      </div>
    ))}
  </div>

</div>

{/* 🔍 Section Toggle Builder */}
<div className="mt-4 p-3 rounded-lg bg-(--muted) border border-(--border)">
  
  <div className="mb-2 text-sm font-medium text-(--foreground)">
    Sections to Include 
  </div>

  <div className="grid grid-cols-2 gap-2 text-xs">

    {[
      { key: "installation", label: "Installation" },
      { key: "usage", label: "Usage" },
      { key: "contributing", label: "Contributing" },
      { key: "license", label: "License" },
    ].map((item) => (
      <label key={item.key} className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={selectedSections[item.key]}
          onChange={() => toggleSection(item.key)}
          className="accent-blue-500 cursor-pointer"
        />
        <span>{item.label}</span>
      </label>
    ))}
</div>
</div>

<div className="flex gap-3 mt-4">
        <button
          onClick={generateReadme}
          className="
            flex-1 bg-(--primary) text-(--primary-foreground)
            font-semibold py-3 rounded-lg hover:opacity-90 cursor-pointer hover:shadow-2xl" >
          Generate README
        </button>

        <button
          onClick={() => {
            setUserInput("");
            setGeneratedReadme("");
          }}
          className="bg-(--muted) px-6 py-3 rounded-lg cursor-pointer border-(--border) shadow-2xl hover:shadow-none " >
          Clear
        </button>
      </div>
    </div>
  );
}