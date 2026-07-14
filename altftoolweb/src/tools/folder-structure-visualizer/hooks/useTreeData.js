"use client";

import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { buildTreeFromPaths, computeStats } from "../utils/tree";
import { parseStructureToTree } from "../utils/parseStructure";
import { SAMPLE_STRUCTURE } from "../utils/sample";

export function useTreeData() {
  const [root, setRoot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const stats = useMemo(() => (root ? computeStats(root) : null), [root]);

  const loadFromFiles = useCallback((fileList) => {
    setLoading(true);
    setError(null);
    try {
      const files = Array.from(fileList || []);
      if (!files.length) {
        setError("No files were selected. Choose a folder and try again.");
        toast.error("No files selected");
        setLoading(false);
        return;
      }
      const rootName =
        files[0].webkitRelativePath?.split("/")[0] || "Project Root";
      const entries = files
        .filter((f) => f.webkitRelativePath)
        .map((f) => ({ path: f.webkitRelativePath, size: f.size || 0 }));
      if (!entries.length) {
        setError("Selected items did not include folder paths.");
        toast.error("Invalid folder selection");
        setLoading(false);
        return;
      }
      const newRoot = buildTreeFromPaths(entries, rootName);
      setRoot(newRoot);
      toast.success(`Loaded ${entries.length} files from ${rootName}`);
    } catch (err) {
      setError(err.message || "Failed to read the folder.");
      toast.error("Could not read folder");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadFromText = useCallback((text, label) => {
    setLoading(true);
    setError(null);
    try {
      const newRoot = parseStructureToTree(text);
      setRoot(newRoot);
      toast.success(`Parsed${label ? ` ${label}` : " structure"} successfully`);
    } catch (err) {
      setError(err.message || "Could not parse the structure.");
      toast.error(err.message || "Could not parse the structure");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadSample = useCallback(() => {
    loadFromText(SAMPLE_STRUCTURE, "sample project");
  }, [loadFromText]);

  const clear = useCallback(() => {
    setRoot(null);
    setError(null);
  }, []);

  return {
    root,
    stats,
    loading,
    error,
    setError,
    loadFromFiles,
    loadFromText,
    loadSample,
    clear,
  };
}
