import { useState, useEffect, useMemo } from "react";
import { detectColumnTypes } from "../utils/detectColumnTypes";
import { analyzeData } from "../utils/analyzeData";

export const useDataInsights = (parsedData, overrides = {}) => {
  const [autoTypes, setAutoTypes] = useState({});

  useEffect(() => {
    if (!parsedData || parsedData.length === 0) {
      setAutoTypes({});
      return;
    }
    const detected = detectColumnTypes(parsedData);
    setAutoTypes(detected);
  }, [parsedData]);

  const finalTypes = useMemo(() => {
    const merged = { ...autoTypes };
    Object.keys(overrides).forEach((col) => {
      if (overrides[col]) merged[col] = overrides[col];
    });
    return merged;
  }, [autoTypes, overrides]);

  const analysis = useMemo(() => {
    if (parsedData && parsedData.length && Object.keys(finalTypes).length) {
      return analyzeData(parsedData, finalTypes);
    }
    return {};
  }, [parsedData, finalTypes]);

  return { types: finalTypes, analysis, autoTypes };
};