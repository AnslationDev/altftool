"use client";

import React, { useMemo, useState } from "react";
import { evaluate } from "./mathEval";

function show(v) {
  if (v === null || v === undefined) return "";
  if (!Number.isFinite(v)) return "Error";
  const r = Math.round((v + Number.EPSILON) * 1e10) / 1e10;
  return String(r);
}

const KEYS = [
  { l: "AC", t: "fn", act: "clear" },
  { l: "DEL", t: "fn", act: "del" },
  { l: "%", t: "op", v: "%" },
  { l: "÷", t: "op", v: "/" },
  { l: "7", v: "7" },
  { l: "8", v: "8" },
  { l: "9", v: "9" },
  { l: "×", t: "op", v: "*" },
  { l: "4", v: "4" },
  { l: "5", v: "5" },
  { l: "6", v: "6" },
  { l: "−", t: "op", v: "-" },
  { l: "1", v: "1" },
  { l: "2", v: "2" },
  { l: "3", v: "3" },
  { l: "+", t: "op", v: "+" },
  { l: "0", v: "0", wide: true },
  { l: ".", v: "." },
  { l: "=", t: "equals", act: "eq" },
];

export default function BasicCalculator() {
  const [expr, setExpr] = useState("");
  const [result, setResult] = useState("");

  const preview = useMemo(() => {
    if (!expr.trim()) return "";
    const r = evaluate(expr, "deg");
    if (r.error || r.value === null || r.value === undefined) return "";
    return show(r.value);
  }, [expr]);

  const press = (v) => {
    setResult("");
    setExpr((e) => e + v);
  };
  const clearAll = () => {
    setExpr("");
    setResult("");
  };
  const del = () => {
    setResult("");
    setExpr((e) => e.slice(0, -1));
  };
  const equals = () => {
    if (!expr.trim()) return;
    const r = evaluate(expr, "deg");
    if (r.error || r.value === null || r.value === undefined) {
      setResult("Error");
      return;
    }
    setResult(show(r.value));
  };

  const onKey = (k) => {
    if (k.act === "clear") clearAll();
    else if (k.act === "del") del();
    else if (k.act === "eq") equals();
    else press(k.v);
  };

  const sub = result ? (result === "Error" ? "Error" : `= ${result}`) : preview ? `= ${preview}` : " ";

  return (
    <div className="afc-calc">
      <div className="afc-display" aria-label="Expression">{expr || "0"}</div>
      <div className={`afc-display-sub ${result === "Error" ? "afc-error" : ""}`} aria-live="polite">{sub}</div>

      <div className="afc-keypad afc-keypad-basic">
        {KEYS.map((k) => (
          <button
            key={k.l}
            type="button"
            className={`afc-key ${k.t === "op" ? "op" : k.t === "fn" ? "fn" : k.t === "equals" ? "equals" : ""} ${k.wide ? "wide" : ""}`}
            onClick={() => onKey(k)}
          >
            {k.l}
          </button>
        ))}
      </div>
    </div>
  );
}
