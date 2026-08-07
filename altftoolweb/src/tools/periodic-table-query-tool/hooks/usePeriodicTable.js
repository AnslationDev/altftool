"use client";

import { useEffect, useMemo, useState } from "react";
import rawElements from "@/tools/periodic-table-query-tool/data/elements.json";

const FAVORITES_KEY = "altftools:periodic-table:favorites:v1";
const HISTORY_KEY = "altftools:periodic-table:history:v1";

const PERIODS = [
  [1, 2],
  [3, 4, 5, 6, 7, 8, 9, 10],
  [11, 12, 13, 14, 15, 16, 17, 18],
  [19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36],
  [37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54],
  [55, 56, 57, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86],
  [87, 88, 89, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118],
];

const getLayout = (atomicNumber) => {
  // Lanthanides/actinides are pulled out into their own grid rows below the main table.
  // `tableColumn`/`tableRow` position them in the CSS grid only — they are NOT real IUPAC
  // group numbers, so `group` stays null here to avoid colliding with the real d/p-block
  // elements that happen to share that same 1-18 numeric range (e.g. group 4 = Hafnium).
  if (atomicNumber >= 58 && atomicNumber <= 71) return { group: null, period: 6, tableRow: 8, tableColumn: atomicNumber - 54 };
  if (atomicNumber >= 90 && atomicNumber <= 103) return { group: null, period: 7, tableRow: 9, tableColumn: atomicNumber - 86 };

  const periodIndex = PERIODS.findIndex((period) => period.includes(atomicNumber));
  const period = periodIndex + 1;
  const position = PERIODS[periodIndex]?.indexOf(atomicNumber) ?? 0;
  const group = period === 1 ? (atomicNumber === 2 ? 18 : 1) : period <= 3 ? [1, 2, 13, 14, 15, 16, 17, 18][position] : position + 1;
  return { group, period, tableRow: period, tableColumn: group };
};

const normalize = (value) => String(value ?? "").toLowerCase().trim();

const buildElements = () =>
  rawElements.map((element) => {
    const layout = getLayout(element.atomicNumber);
    return {
      ...element,
      ...layout,
      groupBlock: element.groupBlock || "unknown",
      standardState: element.standardState || "unknown",
      searchText: normalize(`${element.name} ${element.symbol} ${element.atomicNumber} ${element.groupBlock}`),
    };
  });

export const categoryOptions = [
  "alkali metal",
  "alkaline earth metal",
  "transition metal",
  "metal",
  "metalloid",
  "nonmetal",
  "halogen",
  "noble gas",
  "lanthanoid",
  "actinoid",
  "post-transition metal",
];

export const usePeriodicTable = () => {
  const elements = useMemo(() => buildElements(), []);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [selectedNumber, setSelectedNumber] = useState(8);
  const [compareNumbers, setCompareNumbers] = useState([79, 47]);
  const [favorites, setFavorites] = useState([]);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    setFavorites(JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]"));
    setHistory(JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]"));
  }, []);

  const selected = elements.find((element) => element.atomicNumber === selectedNumber) || elements[0];
  const compare = compareNumbers.map((number) => elements.find((element) => element.atomicNumber === number)).filter(Boolean);

  const filteredElements = useMemo(() => {
    const q = normalize(query);
    return elements.filter((element) => {
      const matchesCategory = category === "all" || element.groupBlock === category;
      const matchesQuery = !q || element.searchText.includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [elements, query, category]);

  const stats = useMemo(() => {
    const categoryCounts = elements.reduce((acc, element) => {
      acc[element.groupBlock] = (acc[element.groupBlock] || 0) + 1;
      return acc;
    }, {});
    return {
      total: elements.length,
      visible: filteredElements.length,
      favorites: favorites.length,
      history: history.length,
      categoryCounts,
    };
  }, [elements, filteredElements.length, favorites.length, history.length]);

  const selectElement = (atomicNumber, source = "click") => {
    const element = elements.find((item) => item.atomicNumber === Number(atomicNumber));
    if (!element) return;
    setSelectedNumber(element.atomicNumber);
    if (source === "search" || query) {
      const next = [element.atomicNumber, ...history.filter((item) => item !== element.atomicNumber)].slice(0, 8);
      setHistory(next);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
    }
  };

  const toggleFavorite = (atomicNumber = selected.atomicNumber) => {
    const next = favorites.includes(atomicNumber)
      ? favorites.filter((item) => item !== atomicNumber)
      : [atomicNumber, ...favorites].slice(0, 24);
    setFavorites(next);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
  };

  const updateCompare = (index, atomicNumber) => {
    const next = [...compareNumbers];
    next[index] = Number(atomicNumber);
    setCompareNumbers(next);
  };

  const resetWorkspace = () => {
    setQuery("");
    setCategory("all");
    setSelectedNumber(8);
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem(HISTORY_KEY);
  };

  return {
    elements,
    filteredElements,
    selected,
    compare,
    compareNumbers,
    query,
    category,
    favorites,
    history,
    stats,
    setQuery,
    setCategory,
    selectElement,
    toggleFavorite,
    updateCompare,
    resetWorkspace,
    clearHistory,
  };
};
