import { Database, FileUp } from "lucide-react";
import Panel from "./Panel";

export default function DatasetUpload({ onFiles, onLoadSample, sampleNames, datasets }) {
  return (
    <Panel title="Dataset Upload" icon={FileUp}>
      <label
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          onFiles([...event.dataTransfer.files]);
        }}
        className="grid min-h-[150px] cursor-pointer place-items-center rounded-xl border border-dashed border-cyan-400/50 bg-cyan-500/10 px-4 py-6 text-center"
      >
        <input
          type="file"
          multiple
          accept=".csv,.json,.sql"
          className="sr-only"
          onChange={(event) => onFiles([...event.target.files])}
        />
        <div>
          <FileUp className="mx-auto mb-2 h-7 w-7 text-cyan-500" />
          <p className="text-sm font-bold text-(--foreground)">Drop CSV, SQL, or JSON files here</p>
          <p className="mt-1 text-xs text-(--muted-foreground)">Multiple datasets are parsed into live tables automatically.</p>
        </div>
      </label>

      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {sampleNames.map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => onLoadSample(name)}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-(--border) bg-(--background) px-3 text-xs font-bold capitalize transition hover:border-(--primary)"
          >
            <Database className="h-3.5 w-3.5" />
            {name.replace("_", " ")}
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {datasets.map((table) => (
          <div key={table.name} className="rounded-lg border border-(--border) bg-(--background) p-3">
            <div className="text-sm font-black text-(--foreground)">{table.name}</div>
            <div className="mt-1 text-xs text-(--muted-foreground)">
              {table.columns.length} columns, {table.rows.length} rows
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}
