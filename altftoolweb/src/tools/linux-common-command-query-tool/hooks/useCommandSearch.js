"use client";

import { useEffect, useMemo, useState } from "react";
import commands from "@/tools/linux-common-command-query-tool/data/commands.json";

const STORAGE_KEYS = {
  favorites: "linuxCommandStudioFavorites",
  history: "linuxCommandStudioHistory",
};

const scoreCommand = (command, query) => {
  if (!query) return 1;

  const normalized = query.toLowerCase().trim();
  const exactName = command.name.toLowerCase() === normalized ? 100 : 0;
  const startsName = command.name.toLowerCase().startsWith(normalized) ? 60 : 0;
  const aliasHit = command.aliases.some((alias) => alias.toLowerCase().includes(normalized)) ? 35 : 0;
  const categoryHit = command.category.toLowerCase().includes(normalized) ? 25 : 0;
  const keywordHit = command.keywords.some((keyword) => keyword.toLowerCase().includes(normalized)) ? 20 : 0;
  const descriptionHit = command.description.toLowerCase().includes(normalized) ? 15 : 0;
  const exampleHit = command.examples.some((example) => example.toLowerCase().includes(normalized)) ? 12 : 0;

  return exactName + startsName + aliasHit + categoryHit + keywordHit + descriptionHit + exampleHit;
};

const readStoredArray = (key) => {
  if (typeof window === "undefined") return [];
  try {
    const value = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
};

export const commandCategories = Array.from(new Set(commands.map((command) => command.category)));

export const useCommandSearch = () => {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [selectedName, setSelectedName] = useState(commands[0]?.name || "");
  const [favorites, setFavorites] = useState(() => readStoredArray(STORAGE_KEYS.favorites));
  const [history, setHistory] = useState(() => readStoredArray(STORAGE_KEYS.history));

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify(favorites));
    }
  }, [favorites]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(history));
    }
  }, [history]);

  useEffect(() => {
    const normalized = query.trim();
    if (!normalized) return;

    const timer = setTimeout(() => {
      setHistory((current) => {
        const next = [normalized, ...current.filter((item) => item.toLowerCase() !== normalized.toLowerCase())];
        return next.slice(0, 10);
      });
    }, 350);

    return () => clearTimeout(timer);
  }, [query]);

  const results = useMemo(() => {
    return commands
      .map((command) => ({ command, score: scoreCommand(command, query) }))
      .filter(({ command, score }) => {
        const categoryMatch = category === "All" || command.category === category;
        return categoryMatch && score > 0;
      })
      .sort((a, b) => b.score - a.score || a.command.name.localeCompare(b.command.name))
      .map(({ command }) => command);
  }, [query, category]);

  const selectedCommand = useMemo(
    () => commands.find((command) => command.name === selectedName) || results[0] || commands[0],
    [results, selectedName]
  );

  const relatedCommands = useMemo(() => {
    if (!selectedCommand) return [];
    return selectedCommand.related
      .map((name) => commands.find((command) => command.name === name))
      .filter(Boolean);
  }, [selectedCommand]);

  const favoriteCommands = useMemo(
    () => favorites.map((name) => commands.find((command) => command.name === name)).filter(Boolean),
    [favorites]
  );

  const toggleFavorite = (name) => {
    setFavorites((current) =>
      current.includes(name) ? current.filter((item) => item !== name) : [name, ...current]
    );
  };

  const clearHistory = () => setHistory([]);
  const resetWorkspace = () => {
    setQuery("");
    setCategory("All");
    setSelectedName(commands[0]?.name || "");
  };

  return {
    allCommands: commands,
    categories: commandCategories,
    query,
    setQuery,
    category,
    setCategory,
    results,
    selectedCommand,
    setSelectedName,
    relatedCommands,
    favorites,
    favoriteCommands,
    toggleFavorite,
    history,
    clearHistory,
    resetWorkspace,
  };
};
