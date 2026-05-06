import { useState, useMemo, useEffect } from "react";
import { AlertCircle } from "lucide-react";

// import DiffHeader from "./DiffHeader";
import DiffInputs from "./DiffInputs";
import DiffOptions from "./DiffOptions";
import DiffStats from "./DiffStats";
import UnifiedView from "./UnifiedView";
import SplitView from "./SplitView";
import { computeDiffLogic } from "../utils/diffUtils";
import SimilarityIndicator from "./SimilarityIndicator";

const DiffChecker = () => {
  const [originalText, setOriginalText] = useState("");
  const [modifiedText, setModifiedText] = useState("");
  const [viewMode, setViewMode] = useState("split");
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false);
  const [ignoreCase, setIgnoreCase] = useState(false);
  const [mode, setMode] = useState("line");
  const [ignorePatterns, setIgnorePatterns] = useState([]);
  const [versions, setVersions] = useState([]);
  const [showVersions, setShowVersions] = useState(false);
  const [selectedVersions, setSelectedVersions] = useState([]);

  const diff = useMemo(
    () =>
      computeDiffLogic(
        originalText,
        modifiedText,
        ignoreWhitespace,
        ignoreCase,
        mode, 
        ignorePatterns
      ),
    [originalText, modifiedText, ignoreWhitespace, ignoreCase, mode, ignorePatterns]
  );

  useEffect(() => {
  if (!originalText && !modifiedText) return;

  const existing = JSON.parse(localStorage.getItem("versions") || "[]");

  const newVersion = {
    id: Date.now(),
    originalText,
    modifiedText,
    createdAt: new Date().toLocaleString(),
  };

  // Avoid duplicate saves (optional but clean)
  if (
    existing.length > 0 &&
    existing[0].originalText === originalText &&
    existing[0].modifiedText === modifiedText
  ) {
    return;
  }

  const updated = [newVersion, ...existing].slice(0, 10);
  localStorage.setItem("versions", JSON.stringify(updated));
}, [diff, modifiedText, originalText]); // triggers when diff updates

  const stats = useMemo(() => {
  let added = 0;
  let deleted = 0;
  let unchanged = 0;

  diff.forEach((item) => {
    if (item.type === "added") added++;
    else if (item.type === "deleted") deleted++;
    else if (item.type === "equal") unchanged++;
  });

  return { added, deleted, unchanged };
}, [diff]);

  const handleReset = () => {
    setOriginalText("");
    setModifiedText("");
  };

  const handleDownload = () => {
    const content = diff
      .map((line) =>
        line.type === "added"
          ? `+ ${line.modified}`
          : line.type === "deleted"
          ? `- ${line.original}`
          : `  ${line.original}`
      )
      .join("\n");

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "diff-result.txt";
    a.click();

    URL.revokeObjectURL(url);
  };

  const loadVersion = (version) => {
    setOriginalText(version.originalText);
    setModifiedText(version.modifiedText);
    setShowVersions(false);
  };

  const toggleSelectVersion = (version) => {
    let updated = [...selectedVersions];

    if (updated.find((v) => v.id === version.id)) {
      updated = updated.filter((v) => v.id !== version.id);
    } else {
      if (updated.length === 2) updated.shift(); // keep max 2
      updated.push(version);
    }

    setSelectedVersions(updated);
  };
  const compareSelectedVersions = () => {
    if (selectedVersions.length !== 2) return;

    const [v1, v2] = selectedVersions;

    setOriginalText(v1.originalText);
    setModifiedText(v2.modifiedText);

    setSelectedVersions([]);

    setShowVersions(false);
  };

  const similarityScore = useMemo(() => {
    if (!diff || diff.length === 0) return 0;

    let matchedLength = 0;
    let totalLength = 0;

    diff.forEach((item) => {
      const originalText = item.original || "";
      const modifiedText = item.modified || "";

      // take max length to represent change size
      const length = Math.max(originalText.length, modifiedText.length);

      totalLength += length;

      if (item.type === "equal") {
        matchedLength += length;
      }
    });

    return totalLength === 0
      ? 0
      : Math.round((matchedLength / totalLength) * 100);
  }, [diff]);

  return (
    <div className="min-h-screen bg-(--background) p-6">
       {/* <DiffHeader /> */}
        <div className="max-w-7xl mx-auto bg-(--background) rounded-xl shadow-lg p-6">
       
        <DiffInputs
          originalText={originalText}
          setOriginalText={setOriginalText}
          modifiedText={modifiedText}
          setModifiedText={setModifiedText}
        />

        <DiffOptions
          mode={mode} 
          setMode={setMode}
          diff={diff}
          ignoreWhitespace={ignoreWhitespace}
          setIgnoreWhitespace={setIgnoreWhitespace}
          ignoreCase={ignoreCase}
          setIgnoreCase={setIgnoreCase}
          viewMode={viewMode}
          setViewMode={setViewMode}
          handleReset={handleReset}
          handleDownload={handleDownload}
          ignorePatterns = {ignorePatterns} 
          setIgnorePatterns={setIgnorePatterns}
        />

        <DiffStats stats={stats} diff={diff} mode={mode}/>

        {originalText || modifiedText ? (
          <>
          <SimilarityIndicator score={similarityScore} />

          {viewMode === "split" ? (
            <SplitView diff={diff} />
          ) : (
            <UnifiedView diff={diff} />
          )}
          </>
        ) : (
          <div className="bg-(--card) border border-(--border) text-(--primary)/20 rounded-lg p-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-(--primary)" />
            <div className="text-sm text-(--foreground)">
              <p className="font-semibold mb-1">Get Started</p>
              <p>
                Paste your text to compare differences between original and
                modified content.
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-center mt-5">
          <button onClick={() => {
            const stored = JSON.parse(localStorage.getItem("versions") || "[]");
            setVersions(stored);
            setShowVersions(true);
          }} className="px-4 py-2 bg-(--primary) text-white rounded-lg flex items-center gap-2 text-sm cursor-pointer">
            See older versions
          </button>
        </div>

        {showVersions && (
          <div className="mt-4 border border-(--border) rounded-lg p-3">
            <h3 className="text-sm font-semibold mb-2">Saved Versions</h3>

            {versions.map((v) => (
              <div
                key={v.id}
                className="border border-(--border) p-2 rounded mb-2 flex justify-between items-center"
              >
                <div>
                  <p className="text-xs text-gray-500">{v.createdAt}</p>
                </div>

                <div className="flex gap-2">
                  {/* Load Button */}
                  <button
                    onClick={() => loadVersion(v)}
                    className="text-xs px-2 py-1 bg-(--primary) text-white rounded"
                  >
                    Load
                  </button>

                  {/* Select Button */}
                  <button
                    onClick={() => toggleSelectVersion(v)}
                    className={`flex items-center justify-center text-xs px-2 py-1 rounded ${
                      selectedVersions.find((sv) => sv.id === v.id)
                        ? "bg-green-500 text-white"
                        : "bg-gray-200"
                    }`}
                  >
                    Select
                  </button>
                </div>
              </div>
            ))}

            {/* Selected Count */}
            <p className="text-xs text-gray-500 mt-2">
              Selected: {selectedVersions.length} / 2
            </p>

            {/* Compare Button */}
            {selectedVersions.length === 2 && (
              <div className="flex items-center justify-center">
                <button
                onClick={compareSelectedVersions}
                className="mt-3 px-3 py-1 bg-(--primary) text-white rounded text-sm"
              >
                Compare Selected Versions
              </button>
              </div>
            )}
          </div>
        )}

      {/* {versions.map((v) => (
        <div
          key={v.id}
          className="border p-2 rounded mb-2 flex justify-between items-center"
        >
          <div>
            <p className="text-xs text-gray-500">{v.createdAt}</p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => loadVersion(v)}
              className="text-xs px-2 py-1 bg-(--primary) text-white rounded"
            >
              Load
            </button>

            <button
              onClick={() => toggleSelectVersion(v)}
              className={`text-xs px-2 py-1 rounded ${
                selectedVersions.find((sv) => sv.id === v.id)
                  ? "bg-green-500 text-white"
                  : "bg-gray-200"
              }`}
            >
              Select
            </button>
          </div>
        </div>
      ))} */}
      </div>
    </div>
  );
};

export default DiffChecker;
