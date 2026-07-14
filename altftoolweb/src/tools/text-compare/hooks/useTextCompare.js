"use client";

import { useMemo, useState } from "react";
import { DEFAULT_LEFT_TEXT, DEFAULT_RIGHT_TEXT } from "../constants/options";
import { buildDiffReport, compareTexts } from "../utils/diffText";
import { getTextMetrics } from "../utils/textMetrics";

export function useTextCompare() {
  const [leftText, setLeftText] = useState(DEFAULT_LEFT_TEXT);
  const [rightText, setRightText] = useState(DEFAULT_RIGHT_TEXT);
  const [options, setOptions] = useState({ ignoreWhitespace: false, ignoreCase: false, lineNumbers: true });
  const [message, setMessage] = useState("");

  const result = useMemo(() => compareTexts(leftText, rightText, options), [leftText, options, rightText]);
  const leftMetrics = useMemo(() => getTextMetrics(leftText), [leftText]);
  const rightMetrics = useMemo(() => getTextMetrics(rightText), [rightText]);
  const report = useMemo(() => buildDiffReport(result), [result]);
  const isEmpty = !leftText.trim() && !rightText.trim();
  const isLarge = leftText.length + rightText.length > 50000;

  function toggleOption(key) {
    setOptions((current) => ({ ...current, [key]: !current[key] }));
  }

  async function copyReport() {
    await navigator.clipboard.writeText(report);
    setMessage("Comparison report copied.");
  }

  function downloadReport() {
    const blob = new Blob([report], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "text-compare-report.txt";
    anchor.click();
    URL.revokeObjectURL(url);
    setMessage("Comparison report downloaded.");
  }

  function clearAll() {
    setLeftText("");
    setRightText("");
    setMessage("Inputs cleared.");
  }

  return {
    leftText,
    rightText,
    options,
    result,
    leftMetrics,
    rightMetrics,
    message,
    isEmpty,
    isLarge,
    setLeftText,
    setRightText,
    toggleOption,
    copyReport,
    downloadReport,
    clearAll,
  };
}
