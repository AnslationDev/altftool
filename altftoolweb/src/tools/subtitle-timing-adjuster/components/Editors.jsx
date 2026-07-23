"use client";

export default function Editors({ input, output, onChangeInput }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="rounded-xl border border-(--border) bg-(--background) p-3">
        <p className="font-semibold mb-2 text-sm uppercase tracking-wide">Input SRT</p>
        <textarea
          value={input}
          onChange={(e) => onChangeInput(e.target.value)}
          className="w-full h-80 rounded-lg border border-(--border) bg-(--card) p-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-(--primary)"
          placeholder="Paste SRT content here..."
        />
      </div>
      <div className="rounded-xl border border-(--border) bg-(--background) p-3">
        <p className="font-semibold mb-2 text-sm uppercase tracking-wide">Adjusted SRT Output</p>
        <textarea
          value={output}
          readOnly
          className="w-full h-80 rounded-lg border border-(--border) bg-(--card) p-3 font-mono text-sm"
        />
      </div>
    </div>
  );
}
