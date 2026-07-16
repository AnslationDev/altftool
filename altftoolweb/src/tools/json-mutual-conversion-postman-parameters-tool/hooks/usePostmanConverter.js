import { useCallback, useEffect, useMemo, useState } from "react";
import {
  buildCurl,
  buildHeaders,
  buildOutput,
  calculateStats,
  MODES,
  SAMPLE_INPUTS,
} from "../utils/conversionEngine";
import { csvToEditorText, readUploadedFile } from "../utils/fileUtils";

const STORAGE_KEY = "json_mutual_postman_converter_workspace";
const HISTORY_LIMIT = 12;

function readWorkspace() {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
  } catch {
    return null;
  }
}

export function usePostmanConverter() {
  const saved = useMemo(() => readWorkspace(), []);
  const [mode, setMode] = useState(saved?.mode || "json-to-query");
  const [input, setInput] = useState(saved?.input || "");
  const [arrayStyle, setArrayStyle] = useState(saved?.arrayStyle || "brackets");
  const [minifyJson, setMinifyJson] = useState(Boolean(saved?.minifyJson));
  const [endpoint, setEndpoint] = useState(saved?.endpoint || "https://api.example.com/request");
  const [history, setHistory] = useState(Array.isArray(saved?.history) ? saved.history : []);
  const [notice, setNotice] = useState("");
  const [copied, setCopied] = useState("");

  const result = useMemo(
    () => buildOutput(input, mode, { arrayStyle, minifyJson }),
    [arrayStyle, input, minifyJson, mode]
  );
  const headers = useMemo(() => buildHeaders(mode), [mode]);
  const curl = useMemo(
    () => (result.ok ? buildCurl({ mode, output: result.output, headers, endpoint }) : ""),
    [endpoint, headers, mode, result.ok, result.output]
  );
  const stats = useMemo(
    () => calculateStats(input, result.output, result.pairs || [], result.data),
    [input, result.data, result.output, result.pairs]
  );

  const selectedMode = useMemo(() => MODES.find((item) => item.id === mode) || MODES[0], [mode]);

  const flash = useCallback((message) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 1700);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ mode, input, arrayStyle, minifyJson, endpoint, history, output: result.output })
    );
  }, [arrayStyle, endpoint, history, input, minifyJson, mode, result.output]);

  useEffect(() => {
    if (!result.ok || !input.trim()) return;
    const timer = window.setTimeout(() => {
      const entry = {
        id: `${mode}-${Date.now()}`,
        createdAt: new Date().toISOString(),
        mode,
        label: selectedMode.label,
        input,
        output: result.output,
      };
      setHistory((current) => [entry, ...current].slice(0, HISTORY_LIMIT));
    }, 500);
    return () => window.clearTimeout(timer);
  }, [input, mode, result.ok, result.output, selectedMode.label]);

  const copyText = useCallback(
    async (label, text) => {
      if (!text) return flash("Nothing to copy yet.");
      await navigator.clipboard.writeText(text);
      setCopied(label);
      flash(`${label} copied.`);
      window.setTimeout(() => setCopied(""), 1200);
    },
    [flash]
  );

  const loadSample = useCallback(() => {
    setInput(selectedMode.input === "json" ? SAMPLE_INPUTS.json : SAMPLE_INPUTS.params);
    flash("Sample loaded into the editor.");
  }, [flash, selectedMode.input]);

  const clearWorkspace = useCallback(() => {
    setInput("");
    flash("Workspace cleared.");
  }, [flash]);

  const resetWorkspace = useCallback(() => {
    setMode("json-to-query");
    setInput("");
    setArrayStyle("brackets");
    setMinifyJson(false);
    setEndpoint("https://api.example.com/request");
    flash("Workspace reset.");
  }, [flash]);

  const beautifyJson = useCallback(() => {
    const built = buildOutput(input, "raw-json", { arrayStyle, minifyJson: false });
    if (!built.ok) return flash(built.error);
    setInput(JSON.stringify(built.data, null, 2));
    setMinifyJson(false);
    flash("JSON beautified.");
  }, [arrayStyle, flash, input]);

  const minifyCurrentJson = useCallback(() => {
    const built = buildOutput(input, "raw-json", { arrayStyle, minifyJson: true });
    if (!built.ok) return flash(built.error);
    setInput(JSON.stringify(built.data));
    setMinifyJson(true);
    flash("JSON minified.");
  }, [arrayStyle, flash, input]);

  const uploadFile = useCallback(
    async (file) => {
      if (!file) return;
      const extension = file.name.split(".").pop()?.toLowerCase();
      if (!["json", "txt", "csv"].includes(extension || "")) {
        flash("Upload a .json, .txt, or .csv file.");
        return;
      }
      const text = await readUploadedFile(file);
      setInput(extension === "csv" ? csvToEditorText(text, selectedMode.input) : text);
      flash(`${file.name} loaded.`);
    },
    [flash, selectedMode.input]
  );

  return {
    arrayStyle,
    beautifyJson,
    clearWorkspace,
    copied,
    copyText,
    curl,
    endpoint,
    flash,
    headers,
    history,
    input,
    loadSample,
    minifyCurrentJson,
    minifyJson,
    mode,
    notice,
    resetWorkspace,
    result,
    selectedMode,
    setArrayStyle,
    setEndpoint,
    setHistory,
    setInput,
    setMinifyJson,
    setMode,
    stats,
    uploadFile,
  };
}
