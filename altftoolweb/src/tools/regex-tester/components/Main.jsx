"use-client";
import React, { useState, useEffect, useMemo } from "react";
import Features from "./Feature";

export default function App() {
  const [pattern, setPattern] = useState(
    "\\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}\\b",
  );
  const [flags, setFlags] = useState({
    g: true,
    i: true,
    m: false,
    s: false,
    u: false,
  });
  const [testString, setTestString] = useState(
    "Contact us at support@example.com or sales@company.org for more information.",
  );
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("test");

  // Common regex patterns
  const commonPatterns = [
    {
      name: "Email",
      pattern: "\\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}\\b",
      flags: "gi",
    },
    {
      name: "URL",
      pattern:
        "https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)",
      flags: "gi",
    },
    {
      name: "Phone (US)",
      pattern: "\\(?\\d{3}\\)?[-.\\s]?\\d{3}[-.\\s]?\\d{4}",
      flags: "g",
    },
    {
      name: "Hex Color",
      pattern: "#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})",
      flags: "g",
    },
    {
      name: "IPv4",
      pattern:
        "\\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\b",
      flags: "g",
    },
    { name: "Date (YYYY-MM-DD)", pattern: "\\d{4}-\\d{2}-\\d{2}", flags: "g" },
    {
      name: "Credit Card",
      pattern: "\\b\\d{4}[\\s-]?\\d{4}[\\s-]?\\d{4}[\\s-]?\\d{4}\\b",
      flags: "g",
    },
    { name: "HTML Tag", pattern: "<[^>]+>", flags: "g" },
  ];

  const matches = useMemo(() => {
    if (!pattern || !testString) return [];

    try {
      const flagString = Object.entries(flags)
        .filter(([_, enabled]) => enabled)
        .map(([flag]) => flag)
        .join("");

      const regex = new RegExp(pattern, flagString);
      const results = [];
      let match;

      if (flags.g) {
        const globalRegex = new RegExp(pattern, flagString);
        while ((match = globalRegex.exec(testString)) !== null) {
          results.push({
            match: match[0],
            index: match.index,
            groups: match.slice(1),
            input: match.input,
          });
        }
      } else {
        match = regex.exec(testString);
        if (match) {
          results.push({
            match: match[0],
            index: match.index,
            groups: match.slice(1),
            input: match.input,
          });
        }
      }

      // eslint-disable-next-line react-hooks/set-state-in-render
      setError("");
      return results;
    } catch (e) {
      // eslint-disable-next-line react-hooks/set-state-in-render
      setError(e.message);
      return [];
    }
  }, [pattern, testString, flags]);

  const highlightedText = useMemo(() => {
    if (!matches.length || !testString) return testString;

    let result = [];
    let lastIndex = 0;

    matches.forEach((match, i) => {
      if (match.index > lastIndex) {
        result.push(
          <span key={`text-${i}`} style={{ color: "var(--foreground)" }}>
            {testString.slice(lastIndex, match.index)}
          </span>,
        );
      }
      result.push(
        <span
          key={`match-${i}`}
          className="font-bold rounded px-1"
          style={{
            backgroundColor: "var(--primary)",
            color: "var(--primary-foreground)",
          }}
        >
          {match.match}
        </span>,
      );
      lastIndex = match.index + match.match.length;
    });

    if (lastIndex < testString.length) {
      result.push(
        <span key="text-end" style={{ color: "var(--foreground)" }}>
          {testString.slice(lastIndex)}
        </span>,
      );
    }

    return result;
  }, [matches, testString]);

  const loadPattern = (preset) => {
    setPattern(preset.pattern);
    const newFlags = { g: false, i: false, m: false, s: false, u: false };
    preset.flags.split("").forEach((flag) => {
      newFlags[flag] = true;
    });
    setFlags(newFlags);
  };

  const toggleFlag = (flag) => {
    setFlags((prev) => ({ ...prev, [flag]: !prev[flag] }));
  };

  return (
    <div
      className="min-h-screen p-4 sm:p-8"
      style={{ backgroundColor: "var(--background)" }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="heading mb-4">Regex Tester</h1>
          <p className="description max-w-2xl mx-auto">
            Test and debug your regular expressions with real-time matching,
            syntax highlighting, and detailed match information.
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Input & Test */}
          <div className="lg:col-span-2 space-y-6">
            {/* Regex Pattern Card */}
            <div
              className="rounded-2xl p-6 shadow-lg"
              style={{
                backgroundColor: "var(--card)",
                borderColor: "var(--border)",
                borderWidth: "1px",
              }}
            >
              <h2
                className="text-xl font-bold mb-4"
                style={{
                  color: "var(--foreground)",
                  fontFamily: "var(--font-primary)",
                }}
              >
                Regular Expression
              </h2>

              <div className="space-y-4">
                {/* Pattern Input */}
                <div>
                  <div
                    className="flex items-center gap-2 p-4 rounded-lg font-mono text-sm sm:text-base"
                    style={{
                      backgroundColor: "var(--muted)",
                      borderColor: "var(--border)",
                      borderWidth: "2px",
                    }}
                  >
                    <span
                      style={{ color: "var(--primary)" }}
                      className="font-bold"
                    >
                      /
                    </span>
                    <input
                      type="text"
                      value={pattern}
                      onChange={(e) => setPattern(e.target.value)}
                      placeholder="Enter regex pattern..."
                      className="flex-1 bg-transparent outline-none"
                      style={{ color: "var(--foreground)" }}
                    />
                    <span
                      style={{ color: "var(--primary)" }}
                      className="font-bold"
                    >
                      /
                    </span>
                    <span style={{ color: "var(--muted-foreground)" }}>
                      {Object.entries(flags)
                        .filter(([_, v]) => v)
                        .map(([k]) => k)
                        .join("")}
                    </span>
                  </div>
                </div>

                {/* Flags */}
                <div>
                  <label
                    className="block text-sm font-semibold mb-2"
                    style={{ color: "var(--foreground)" }}
                  >
                    Flags
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { key: "g", label: "Global", desc: "Find all matches" },
                      {
                        key: "i",
                        label: "Ignore Case",
                        desc: "Case insensitive",
                      },
                      {
                        key: "m",
                        label: "Multiline",
                        desc: "^$ match line breaks",
                      },
                      { key: "s", label: "Dotall", desc: ". matches newlines" },
                      { key: "u", label: "Unicode", desc: "Unicode support" },
                    ].map((flag) => (
                      <button
                        key={flag.key}
                        onClick={() => toggleFlag(flag.key)}
                        className="px-3 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105 active:scale-95"
                        style={{
                          backgroundColor: flags[flag.key]
                            ? "var(--primary)"
                            : "var(--muted)",
                          color: flags[flag.key]
                            ? "var(--primary-foreground)"
                            : "var(--foreground)",
                          borderColor: "var(--border)",
                          borderWidth: "1px",
                        }}
                        title={flag.desc}
                      >
                        {flag.key}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Error Display */}
                {error && (
                  <div
                    className="p-4 rounded-lg"
                    style={{
                      backgroundColor: "#fee",
                      borderColor: "#fcc",
                      borderWidth: "1px",
                    }}
                  >
                    <p
                      className="text-sm font-medium"
                      style={{ color: "#c33" }}
                    >
                      ⚠️ {error}
                    </p>
                  </div>
                )}

                {/* Match Stats */}
                {!error && (
                  <div
                    className="flex items-center gap-4 p-4 rounded-lg"
                    style={{ backgroundColor: "var(--muted)" }}
                  >
                    <div>
                      <div
                        className="text-2xl font-bold"
                        style={{
                          color: "var(--primary)",
                          fontFamily: "var(--font-primary)",
                        }}
                      >
                        {matches.length}
                      </div>
                      <div
                        className="text-sm"
                        style={{ color: "var(--muted-foreground)" }}
                      >
                        {matches.length === 1 ? "Match" : "Matches"}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Test String Card */}
            <div
              className="rounded-2xl p-6 shadow-lg"
              style={{
                backgroundColor: "var(--card)",
                borderColor: "var(--border)",
                borderWidth: "1px",
              }}
            >
              <div className="flex justify-between items-center mb-4">
                <h2
                  className="text-xl font-bold"
                  style={{
                    color: "var(--foreground)",
                    fontFamily: "var(--font-primary)",
                  }}
                >
                  Test String
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveTab("test")}
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer"
                    style={{
                      backgroundColor:
                        activeTab === "test"
                          ? "var(--primary)"
                          : "var(--muted)",
                      color:
                        activeTab === "test"
                          ? "var(--primary-foreground)"
                          : "var(--foreground)",
                    }}
                  >
                    Input
                  </button>
                  <button
                    onClick={() => setActiveTab("result")}
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer"
                    style={{
                      backgroundColor:
                        activeTab === "result"
                          ? "var(--primary)"
                          : "var(--muted)",
                      color:
                        activeTab === "result"
                          ? "var(--primary-foreground)"
                          : "var(--foreground)",
                    }}
                  >
                    Result
                  </button>
                </div>
              </div>

              {activeTab === "test" ? (
                <textarea
                  value={testString}
                  onChange={(e) => setTestString(e.target.value)}
                  placeholder="Enter text to test against your regex..."
                  rows={10}
                  className="w-full p-4 rounded-lg font-mono text-sm resize-none focus:ring-2 focus:outline-none"
                  style={{
                    backgroundColor: "var(--background)",
                    borderColor: "var(--border)",
                    borderWidth: "2px",
                    color: "var(--foreground)",
                    "--tw-ring-color": "var(--primary)",
                  }}
                />
              ) : (
                <div
                  className="p-4 rounded-lg font-mono text-sm min-h-60 whitespace-pre-wrap"
                  style={{
                    backgroundColor: "var(--background)",
                    borderColor: "var(--border)",
                    borderWidth: "2px",
                  }}
                >
                  {highlightedText}
                </div>
              )}
            </div>

            {/* Matches Details */}
            {matches.length > 0 && (
              <div
                className="rounded-2xl p-6 shadow-lg"
                style={{
                  backgroundColor: "var(--card)",
                  borderColor: "var(--border)",
                  borderWidth: "1px",
                }}
              >
                <h2
                  className="text-xl font-bold mb-4"
                  style={{
                    color: "var(--foreground)",
                    fontFamily: "var(--font-primary)",
                  }}
                >
                  Match Details
                </h2>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {matches.map((match, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-lg"
                      style={{ backgroundColor: "var(--muted)" }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span
                          className="font-bold"
                          style={{ color: "var(--primary)" }}
                        >
                          Match {index + 1}
                        </span>
                        <span
                          className="text-sm"
                          style={{ color: "var(--muted-foreground)" }}
                        >
                          Position: {match.index}
                        </span>
                      </div>
                      <div
                        className="font-mono text-sm p-2 rounded"
                        style={{
                          backgroundColor: "var(--background)",
                          color: "var(--foreground)",
                        }}
                      >
                        {match.match}
                      </div>
                      {match.groups.length > 0 && (
                        <div className="mt-2">
                          <span
                            className="text-sm font-semibold"
                            style={{ color: "var(--foreground)" }}
                          >
                            Groups:
                          </span>
                          <div className="mt-1 space-y-1">
                            {match.groups.map(
                              (group, i) =>
                                group && (
                                  <div
                                    key={i}
                                    className="text-sm font-mono"
                                    style={{ color: "var(--muted-foreground)" }}
                                  >
                                    [{i + 1}]: {group}
                                  </div>
                                ),
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Common Patterns */}
          <div className="lg:col-span-1">
            <div
              className="rounded-2xl p-6 shadow-lg sticky top-4"
              style={{
                backgroundColor: "var(--card)",
                borderColor: "var(--border)",
                borderWidth: "1px",
              }}
            >
              <h2
                className="text-xl font-bold mb-4"
                style={{
                  color: "var(--foreground)",
                  fontFamily: "var(--font-primary)",
                }}
              >
                Common Patterns
              </h2>
              <div className="space-y-2">
                {commonPatterns.map((preset, index) => (
                  <button
                    key={index}
                    onClick={() => loadPattern(preset)}
                    className="w-full text-left p-3 rounded-lg transition-all hover:scale-105 active:scale-95 cursor-pointer"
                    style={{
                      backgroundColor: "var(--muted)",
                      borderColor: "var(--border)",
                      borderWidth: "1px",
                    }}
                  >
                    <div
                      className="font-semibold text-sm mb-1"
                      style={{ color: "var(--foreground)" }}
                    >
                      {preset.name}
                    </div>
                    <div
                      className="font-mono text-xs break-all"
                      style={{ color: "var(--muted-foreground)" }}
                    >
                      /{preset.pattern}/{preset.flags}
                    </div>
                  </button>
                ))}
              </div>

              {/* Quick Reference */}
              <div
                className="mt-6 pt-6"
                style={{
                  borderTopColor: "var(--border)",
                  borderTopWidth: "1px",
                }}
              >
                <h3
                  className="font-bold text-sm mb-3"
                  style={{ color: "var(--foreground)" }}
                >
                  Quick Reference
                </h3>
                <div
                  className="space-y-2 text-xs"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  <div>
                    <code
                      className="font-mono"
                      style={{ color: "var(--primary)" }}
                    >
                      .
                    </code>{" "}
                    Any character
                  </div>
                  <div>
                    <code
                      className="font-mono"
                      style={{ color: "var(--primary)" }}
                    >
                      \d
                    </code>{" "}
                    Digit (0-9)
                  </div>
                  <div>
                    <code
                      className="font-mono"
                      style={{ color: "var(--primary)" }}
                    >
                      \w
                    </code>{" "}
                    Word character
                  </div>
                  <div>
                    <code
                      className="font-mono"
                      style={{ color: "var(--primary)" }}
                    >
                      \s
                    </code>{" "}
                    Whitespace
                  </div>
                  <div>
                    <code
                      className="font-mono"
                      style={{ color: "var(--primary)" }}
                    >
                      +
                    </code>{" "}
                    One or more
                  </div>
                  <div>
                    <code
                      className="font-mono"
                      style={{ color: "var(--primary)" }}
                    >
                      *
                    </code>{" "}
                    Zero or more
                  </div>
                  <div>
                    <code
                      className="font-mono"
                      style={{ color: "var(--primary)" }}
                    >
                      ?
                    </code>{" "}
                    Optional
                  </div>
                  <div>
                    <code
                      className="font-mono"
                      style={{ color: "var(--primary)" }}
                    >
                      ^
                    </code>{" "}
                    Start of line
                  </div>
                  <div>
                    <code
                      className="font-mono"
                      style={{ color: "var(--primary)" }}
                    >
                      $
                    </code>{" "}
                    End of line
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Features/>
      </div>
    </div>
  );
}