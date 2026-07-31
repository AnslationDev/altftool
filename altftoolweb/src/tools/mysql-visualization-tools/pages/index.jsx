"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toPng } from "html-to-image";
import { Maximize2 } from "lucide-react";
import Header from "../components/Header";
import DiagramWorkspace from "../components/DiagramWorkspace";
import RelationshipMap from "../components/RelationshipMap";
import SchemaExplorer from "../components/SchemaExplorer";
import HistorySection from "../components/HistorySection";
import ExportPanel from "../components/ExportPanel";
import ParserStatus from "../components/ParserStatus";
import DatasetUpload from "../components/DatasetUpload";
import SqlInput from "../components/SqlInput";
import SqlPracticeWorkspace from "../components/SqlPracticeWorkspace";
import ChallengeMode from "../components/ChallengeMode";
import {
  analyzeQuery,
  buildDiagramElements,
  loadHistory,
  loadState,
  parseMySqlSchema,
  removeTablesFromSql,
  saveHistoryItem,
  saveState,
} from "../utils/schemaUtils";
import { executeSql, formatSql } from "../utils/sqlEngine";
import { readDatasetFiles, sampleDatasets, tablesToCreateSql } from "../utils/workspaceUtils";

const challenges = [
  { id: "id_gt_5", title: "Filter rows", prompt: "Find users with id > 5", query: "SELECT * FROM users WHERE id > 5;" },
  { id: "join_orders", title: "Join tables", prompt: "Join users and orders", query: "SELECT users.name, orders.total FROM users JOIN orders ON users.id = orders.user_id;" },
  { id: "count_rows", title: "Count records", prompt: "Count products or available rows", query: "SELECT COUNT(*) AS count_all FROM users;" },
];

const features = [
  {
    title: "Paste MySQL Schema",
    description:
      "Add your MySQL CREATE TABLE statements to instantly detect tables, columns, primary keys, and foreign keys.",
  },
  {
    title: "Visual ER Diagram",
    description:
      "Turn database structure into a clean relationship diagram so teams can understand schema flow quickly.",
  },
  {
    title: "Upload Datasets",
    description:
      "Import sample data files or load built-in datasets and convert them into live browser tables for practice.",
  },
  {
    title: "Run SQL Queries",
    description:
      "Test SELECT queries, inspect result rows, format SQL, and learn how your data responds without setting up a server.",
  },
  {
    title: "Save History",
    description:
      "Keep useful schema snapshots in browser history so you can restore previous database views later.",
  },
  {
    title: "Export Outputs",
    description:
      "Download schema data as JSON or export the ER diagram as a PNG for documentation, sharing, and review.",
  },
];

export default function ToolHome() {
  const restored = useMemo(() => loadState(), []);
  const [sql, setSql] = useState(restored?.sql || "");
  const [query, setQuery] = useState(restored?.query || "SELECT * FROM users LIMIT 10;");
  const [positions, setPositions] = useState(restored?.positions || {});
  const [datasets, setDatasets] = useState(restored?.datasets || []);
  const [history, setHistory] = useState(() => loadHistory());
  const [notice, setNotice] = useState("");
  const [activeTab, setActiveTab] = useState("practice");
  const [page, setPage] = useState(0);
  const [activeChallenge, setActiveChallenge] = useState(null);
  const diagramRef = useRef(null);

  const schema = useMemo(() => parseMySqlSchema(sql), [sql]);
  const workspaceTables = useMemo(
    () =>
      schema.tables.map((table) => ({
        ...table,
        rows: datasets.find((dataset) => dataset.name.toLowerCase() === table.name.toLowerCase())?.rows || [],
      })),
    [schema.tables, datasets]
  );
  const queryResult = useMemo(() => executeSql(query, workspaceTables), [query, workspaceTables]);
  const queryAnalysis = useMemo(() => analyzeQuery(query, schema), [query, schema]);
  const diagram = useMemo(() => buildDiagramElements(schema, positions, queryAnalysis), [schema, positions, queryAnalysis]);
  const expected = useMemo(
    () => (activeChallenge ? executeSql(activeChallenge.query, workspaceTables) : null),
    [activeChallenge, workspaceTables]
  );
  const challengeStatus = useMemo(() => {
    if (!activeChallenge || queryResult.error || expected?.error) return "";
    return JSON.stringify(queryResult.rows) === JSON.stringify(expected.rows) ? "pass" : "fail";
  }, [activeChallenge, queryResult, expected]);

  useEffect(() => {
    saveState({ sql, query, positions, datasets });
  }, [sql, query, positions, datasets]);

  const flash = (message) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 1800);
  };

  const mergeDatasets = (incoming) => {
    const next = [...datasets.filter((table) => !incoming.some((item) => item.name === table.name)), ...incoming];
    setDatasets(next);
    const nextNames = next.map((table) => table.name);
    setSql([tablesToCreateSql(next), removeTablesFromSql(sql, nextNames)].filter(Boolean).join("\n\n"));
    flash("Dataset parsed into live tables.");
  };

  const handleFiles = async (files) => {
    try {
      const parsed = await readDatasetFiles(files);
      const next = [...datasets.filter((table) => !parsed.tables.some((item) => item.name === table.name)), ...parsed.tables];
      setDatasets(next);
      const nextNames = next.map((table) => table.name);
      setSql([tablesToCreateSql(next), removeTablesFromSql(parsed.sql, nextNames)].filter(Boolean).join("\n\n"));
      setActiveTab("practice");
      flash("Upload parsed and schema generated.");
    } catch (error) {
      flash(error.message || "Upload could not be parsed.");
    }
  };

  const handleSample = (name) => {
    mergeDatasets(sampleDatasets[name]);
    setQuery(`SELECT * FROM ${sampleDatasets[name][0].name} LIMIT 10;`);
  };

  const handleCopySchema = async () => {
    await navigator.clipboard.writeText(JSON.stringify({ schema, datasets }, null, 2));
    flash("Workspace copied.");
  };

  const handleDownloadJson = () => {
    const blob = new Blob([JSON.stringify({ schema, datasets, query, queryResult }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "mysql-visualization-workspace.json";
    link.click();
    URL.revokeObjectURL(url);
    flash("JSON downloaded.");
  };

  const handleDownloadPng = async () => {
    if (!diagramRef.current) return;
    const dataUrl = await toPng(diagramRef.current, { backgroundColor: "#020617", pixelRatio: 2, cacheBust: true });
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = "mysql-er-diagram.png";
    link.click();
    flash("PNG exported.");
  };

  const handleSaveHistory = () => {
    const next = saveHistoryItem(sql, schema);
    setHistory(next);
    flash("Saved to history.");
  };

  const updateQuery = (value) => {
    setQuery(value);
    setPage(0);
  };

  const tabs = ["practice", "upload", "diagram", "schema", "challenges", "history"];

  return (
    <div className="px-4 py-6 text-(--foreground)">
      <Header stats={{ ...schema.stats, rows: datasets.reduce((sum, table) => sum + table.rows.length, 0) }} />

      {notice && (
        <div className="fixed right-4 top-4 z-50 rounded-2xl border border-cyan-300/30 bg-slate-950 px-4 py-3 text-sm font-bold text-cyan-100 shadow-2xl">
          {notice}
        </div>
      )}

      <div className="mx-auto max-w-7xl overflow-hidden rounded-xl bg-(--card) p-4 shadow-lg">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`rounded-lg border px-3 py-2 text-xs font-black capitalize transition ${activeTab === tab ? "border-cyan-400 bg-cyan-500/15 text-cyan-700 dark:text-cyan-100" : "border-(--border) bg-(--background)"}`}
              >
                {tab}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => document.documentElement.requestFullscreen?.()}
            className="inline-flex items-center gap-2 rounded-lg border border-(--border) bg-(--background) px-3 py-2 text-xs font-black"
          >
            <Maximize2 className="h-3.5 w-3.5" /> Fullscreen
          </button>
        </div>

        {activeTab === "practice" && (
          <div className="space-y-4">
            <SqlPracticeWorkspace
              query={query}
              setQuery={updateQuery}
              onFormat={() => setQuery(formatSql(query))}
              result={queryResult}
              challenge={activeChallenge}
              challengeStatus={challengeStatus}
              page={page}
              setPage={setPage}
            />
            <DiagramWorkspace nodes={diagram.nodes} edges={diagram.edges} onPositionsChange={setPositions} diagramRef={diagramRef} />
          </div>
        )}

        {activeTab === "upload" && (
          <DatasetUpload onFiles={handleFiles} onLoadSample={handleSample} sampleNames={Object.keys(sampleDatasets)} datasets={datasets} />
        )}

        {activeTab === "diagram" && (
          <div className="space-y-4">
            <DiagramWorkspace nodes={diagram.nodes} edges={diagram.edges} onPositionsChange={setPositions} diagramRef={diagramRef} />
            <RelationshipMap relationships={schema.relationships} />
          </div>
        )}

        {activeTab === "schema" && (
          <div className="space-y-4">
            <SqlInput
              sql={sql}
              setSql={setSql}
              query={query}
              setQuery={updateQuery}
              status={schema.tables.length ? `${schema.tables.length} table${schema.tables.length === 1 ? "" : "s"} parsed` : "Waiting for SQL"}
            />
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
              <SchemaExplorer tables={schema.tables} queryAnalysis={queryAnalysis} />
              <div className="space-y-4">
                <ParserStatus schema={schema} warnings={schema.warnings} />
                <ExportPanel canExport={schema.tables.length} onCopySchema={handleCopySchema} onDownloadJson={handleDownloadJson} onDownloadPng={handleDownloadPng} onSaveHistory={handleSaveHistory} />
              </div>
            </div>
          </div>
        )}

        {activeTab === "challenges" && (
          <div className="space-y-4">
            <ChallengeMode
              challenges={challenges}
              activeId={activeChallenge?.id}
              onSelect={(challenge) => {
                setActiveChallenge(challenge);
                setQuery(challenge.query);
                setActiveTab("practice");
              }}
            />
          </div>
        )}

        {activeTab === "history" && <HistorySection history={history} onRestore={setSql} />}
      </div>

      <section className="bg-(--background) px-4 py-8 sm:py-10">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center sm:mb-16">
            <h2 className="mb-4 text-3xl font-extrabold text-(--foreground) sm:text-4xl">
              Why Choose Our MySQL Visualization Tools?
            </h2>
            <p className="mx-auto max-w-2xl text-base leading-relaxed text-(--muted-foreground) sm:text-lg">
              Simple, fast, and browser-based MySQL schema visualization for developers and teams
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="flex flex-col rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-xl sm:p-8"
              >
                <h3 className="mb-3 text-lg font-bold text-(--foreground) sm:text-xl">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-(--muted-foreground) sm:text-base">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
