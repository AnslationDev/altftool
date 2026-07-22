"use client";

import React, { useMemo, useState } from "react";
import { Field, TextInput, TextArea, Button, ResultPanel, ResultRow } from "./ui";

const FLAGS = [
  { key: "g", label: "g · global" },
  { key: "i", label: "i · ignore case" },
  { key: "m", label: "m · multiline" },
  { key: "s", label: "s · dotall" },
];

export default function RegexTester() {
  const [pattern, setPattern] = useState("(\\w+)@(\\w+)\\.\\w+");
  const [flags, setFlags] = useState({ g: true, i: false, m: false, s: false });
  const [text, setText] = useState("Contact hi@altf.tools or team@example.org today.");

  const flagStr = FLAGS.map((f) => (flags[f.key] ? f.key : "")).join("");

  const result = useMemo(() => {
    if (!pattern) return { empty: true };
    let re;
    try {
      re = new RegExp(pattern, flagStr);
    } catch (e) {
      return { error: e.message };
    }
    let matches = [];
    try {
      if (flags.g) {
        matches = [...text.matchAll(re)];
      } else {
        const m = re.exec(text);
        matches = m ? [m] : [];
      }
    } catch (e) {
      return { error: e.message };
    }
    const rows = matches.slice(0, 500).map((m) => ({
      match: m[0],
      index: m.index,
      groups: m.slice(1),
      named: m.groups || null,
    }));
    return { count: matches.length, rows };
  }, [pattern, flagStr, flags.g, text]);

  const toggle = (key) => setFlags((p) => ({ ...p, [key]: !p[key] }));

  return (
    <div className="afc-calc">
      <Field label="Pattern" hint="Enter the body only — no surrounding slashes.">
        <TextInput
          className="afc-code"
          value={pattern}
          spellCheck={false}
          placeholder="\d{3}-\d{4}"
          onChange={(e) => setPattern(e.target.value)}
        />
      </Field>

      <Field label="Flags">
        <div className="afc-actions">
          {FLAGS.map((f) => (
            <Button
              key={f.key}
              variant={flags[f.key] ? "primary" : "ghost"}
              onClick={() => toggle(f.key)}
            >
              {f.label}
            </Button>
          ))}
        </div>
      </Field>

      <Field label="Test string">
        <TextArea
          rows={5}
          value={text}
          spellCheck={false}
          placeholder="Text to search…"
          onChange={(e) => setText(e.target.value)}
        />
      </Field>

      {result.empty ? (
        <ResultPanel title="Matches" muted>
          <p className="afc-note">Enter a pattern to test against your string.</p>
        </ResultPanel>
      ) : result.error ? (
        <ResultPanel title="Matches">
          <p className="afc-error">Invalid regex — {result.error}</p>
        </ResultPanel>
      ) : (
        <ResultPanel title="Matches">
          <ResultRow
            label="Total matches"
            value={`${result.count}${!flags.g && result.count ? " (enable g for all)" : ""}`}
            strong
          />
          {result.rows.length ? (
            <div className="afc-table-wrap" style={{ marginTop: 10 }}>
              <table className="afc-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Index</th>
                    <th>Match</th>
                    <th>Groups</th>
                  </tr>
                </thead>
                <tbody>
                  {result.rows.map((r, i) => (
                    <tr key={i}>
                      <td>{i + 1}</td>
                      <td>{r.index}</td>
                      <td style={{ textAlign: "left" }} className="afc-code">{r.match || "∅"}</td>
                      <td style={{ textAlign: "left" }} className="afc-code">
                        {r.named
                          ? Object.entries(r.named)
                              .map(([k, v]) => `${k}: ${v ?? "—"}`)
                              .join("  ·  ")
                          : r.groups.length
                          ? r.groups.map((g, gi) => `$${gi + 1}: ${g ?? "—"}`).join("  ·  ")
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="afc-note" style={{ marginTop: 8 }}>No matches found.</p>
          )}
        </ResultPanel>
      )}
    </div>
  );
}
