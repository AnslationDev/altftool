import { motion } from "framer-motion";
import { FileCode2, FileUp, RotateCcw, Sparkles, Trash2, WrapText } from "lucide-react";
import ProgressTracker from "./ProgressTracker";

function Field({ label, value, onChange, placeholder }) {
  return (
    <label className="block min-w-0">
      <span className="mb-1.5 block text-sm font-bold">{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="pp-input" />
    </label>
  );
}

export default function InputSection({ workspace, updateField, readiness, loadFile, transformJson, clearJson, resetWorkspace, error, notice }) {
  return (
    <div className="pp-glass min-w-0 rounded-3xl p-4 sm:p-5">
      <div className="mb-5 min-w-0">
        <h2 className="text-xl font-black">JSON Editor</h2>
        <p className="text-sm text-(--muted-foreground)">Paste, type, or upload JSON. Structs regenerate as the input changes.</p>
      </div>

      <ProgressTracker readiness={readiness} />

      <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0">
          <div className="mb-3 flex min-w-0 flex-wrap gap-2">
            <label className="pp-button-secondary cursor-pointer">
              <FileUp className="h-4 w-4" />
              Upload
              <input className="hidden" type="file" accept=".json,.txt,application/json,text/plain" onChange={(event) => loadFile(event.target.files?.[0])} />
            </label>
            <button type="button" className="pp-button-secondary" onClick={() => transformJson("beautify")}>
              <Sparkles className="h-4 w-4" />
              Beautify
            </button>
            <button type="button" className="pp-button-secondary" onClick={() => transformJson("minify")}>
              <WrapText className="h-4 w-4" />
              Minify
            </button>
            <button type="button" className="pp-icon-button" onClick={clearJson} title="Clear JSON">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          <textarea
            value={workspace.jsonInput}
            onChange={(event) => updateField("jsonInput", event.target.value)}
            spellCheck="false"
            className="jg-editor"
            placeholder="Paste valid JSON here..."
            aria-label="JSON input editor"
          />

          <motion.div
            layout
            className={`mt-3 min-w-0 rounded-2xl border p-3 text-sm ${error ? "border-red-400/35 bg-red-400/10 text-red-300" : "border-teal-400/30 bg-teal-400/10 text-teal-300"}`}
          >
            {error || notice || "Valid JSON. Live Go structs are synced in real time."}
          </motion.div>
        </div>

        <div className="grid min-w-0 content-start gap-4">
          <div className="min-w-0 rounded-2xl border border-(--border) bg-(--muted)/25 p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-black">
              <FileCode2 className="h-4 w-4 text-blue-400" />
              Settings
            </div>
            <div className="grid gap-3">
              <Field label="Root struct name" value={workspace.rootName} onChange={(value) => updateField("rootName", value)} placeholder="ApiResponse" />
              <Field label="Package name" value={workspace.packageName} onChange={(value) => updateField("packageName", value)} placeholder="models" />
              <label className="block min-w-0">
                <span className="mb-1.5 block text-sm font-bold">Null values</span>
                <select className="pp-input" value={workspace.nullableBehavior} onChange={(event) => updateField("nullableBehavior", event.target.value)}>
                  <option value="pointer">Pointer when type is known</option>
                  <option value="interface">interface{} fallback</option>
                </select>
              </label>
              <button type="button" className="pp-button-secondary w-full" onClick={resetWorkspace}>
                <RotateCcw className="h-4 w-4" />
                Reset workspace
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
