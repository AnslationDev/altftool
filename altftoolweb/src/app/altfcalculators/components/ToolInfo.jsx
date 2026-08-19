"use client";

// Renders the detailed information article shown below each calculator
// (like calculator.net / omnicalculator). Fully data-driven so content lives in
// per-category info files. Every section is optional.
//
// info shape:
// {
//   intro: "paragraph" | ["p1", "p2"],
//   formula: { expression: "EMI = ...", where: [["P","Principal"], ...] } | "string",
//   howToUse: ["step 1", "step 2", ...],
//   goodToKnow: ["fact", ...],
//   faqs: [{ q: "...", a: "..." }, ...],
// }

import React from "react";
import { Info, Sigma, ListChecks, Lightbulb, HelpCircle } from "lucide-react";

function Paragraphs({ text }) {
  const arr = Array.isArray(text) ? text : [text];
  return arr.filter(Boolean).map((p, i) => <p key={i} className="afc-info-p">{p}</p>);
}

export default function ToolInfo({ info, toolName }) {
  if (!info) return null;
  const { intro, formula, howToUse, goodToKnow, faqs } = info;
  const hasFormula = formula && (typeof formula === "string" || formula.expression);

  return (
    <section className="afc-info" aria-label={`About ${toolName || "this calculator"}`}>
      {intro ? (
        <div className="afc-info-block">
          <h2 className="afc-info-h"><Info size={18} /> About {toolName}</h2>
          <Paragraphs text={intro} />
        </div>
      ) : null}

      {hasFormula ? (
        <div className="afc-info-block">
          <h2 className="afc-info-h"><Sigma size={18} /> Formula</h2>
          {typeof formula === "string" ? (
            <div className="afc-formula">{formula}</div>
          ) : (
            <>
              <div className="afc-formula">{formula.expression}</div>
              {Array.isArray(formula.where) && formula.where.length ? (
                <ul className="afc-where">
                  {formula.where.map(([sym, meaning], i) => (
                    <li key={i}><b>{sym}</b> — {meaning}</li>
                  ))}
                </ul>
              ) : null}
              {formula.note ? <p className="afc-info-p afc-info-muted">{formula.note}</p> : null}
            </>
          )}
        </div>
      ) : null}

      {Array.isArray(howToUse) && howToUse.length ? (
        <div className="afc-info-block">
          {/* Named headings, not "How to use it": a retrieval chunk lifted out
              of the page has to say which calculator it belongs to. This text
              also has to match the HowTo JSON-LD name emitted by the route. */}
          <h2 className="afc-info-h">
            <ListChecks size={18} /> {toolName ? `How to use the ${toolName}` : "How to use it"}
          </h2>
          <ol className="afc-steps-list">
            {howToUse.map((s, i) => <li key={i}>{s}</li>)}
          </ol>
        </div>
      ) : null}

      {Array.isArray(goodToKnow) && goodToKnow.length ? (
        <div className="afc-info-block">
          <h2 className="afc-info-h"><Lightbulb size={18} /> Good to know</h2>
          <ul className="afc-bullets">
            {goodToKnow.map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        </div>
      ) : null}

      {Array.isArray(faqs) && faqs.length ? (
        <div className="afc-info-block">
          <h2 className="afc-info-h">
            <HelpCircle size={18} />{" "}
            {toolName
              ? `Frequently asked questions about the ${toolName}`
              : "Frequently asked questions"}
          </h2>
          <div className="afc-faqs">
            {faqs.map((f, i) => (
              <details key={i} className="afc-faq">
                <summary>{f.q}</summary>
                <div className="afc-faq-a"><Paragraphs text={f.a} /></div>
              </details>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
