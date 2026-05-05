"use client";
import React from "react";

import { fetchDictionaryData } from "../utils/api.js";
import { speakWord } from "../utils/speech.js";
import { useVocab } from "../hooks/useVocab.js";
import { useCollections } from "../hooks/useCollections.js";
import TabBar from "./TabBar.jsx";

import SearchBar from "./SearchBar.jsx";
import ResultHeader from "./ResultHeader.jsx";
import MeaningCard from "./MeaningCard.jsx";
import Synonyms from "./Synonyms.jsx";
import Antonyms from "./Antonyms.jsx";
import ExplorePage from "./ExplorePage.jsx";
import VocabList from "./VocabList.jsx";
import DailyWord from "./DailyWord.jsx";
import SynonymExplorer from "./SynonymExplorer.jsx";
import CollectionPicker from "./CollectionPicker.jsx";
import CollectionsView from "./CollectionsView.jsx";
import QuizTab from "./QuizTab.jsx";
import ProgressDashboard from "./ProgressDashboard.jsx";

// import { BookMarked, Search, Brain } from "lucide-react";

export default function DictionaryApp() {
  const [word, setWord] = React.useState("");
  const [results, setResults] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [activeView, setActiveView] = React.useState("dictionary"); // "dictionary" | "vocab"


  const { savedWords, addWord, updateStatus, removeWord, isWordSaved } =
    useVocab();
  const {
    collections,
    wordMap,
    addToCollection,
    removeFromCollection,
    createCollection,
    deleteCollection,
  } = useCollections();

  React.useEffect(() => {
  if (typeof window === "undefined") return;
  try {
    const stored = sessionStorage.getItem("last_state");
    if (!stored) return;
    const { word: lastWord } = JSON.parse(stored);
    if (lastWord) {
      setWord(lastWord);
      handleSearch(lastWord);
    }
  } catch {
    // ignore
  }
}, []);

  const handleSearch = async (searchWord) => {
    if (!searchWord) return;
    setLoading(true);
    setError(null);
    setActiveView("dictionary");
    try {
      const data = await fetchDictionaryData(searchWord);

    
      if (
        !data.dict ||
        !Array.isArray(data.dict) ||
        data.dict.length === 0 ||
        !data.dict[0]?.meanings ||
        data.dict[0]?.title === "No Definitions Found"
      ) {
        setError(
          `No definition found for "${searchWord}". Please try another word.`,
        );
        setResults(null);
        return;
      }

      setResults(data);
      sessionStorage.setItem("last_state", JSON.stringify({
  word: searchWord,
}));
    } catch (err) {
      setError("Something went wrong. Please try again.");
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === "Enter") handleSearch(word);
    };
    window.addEventListener("keypress", handleKeyPress);
    return () => window.removeEventListener("keypress", handleKeyPress);
  }, [word]);

  const handleRefresh = () => {
    setWord("");
    setResults(null);
    setError(null);
    setLoading(false);
    setActiveView("dictionary");
  };

  // VocabList se word click karne pe search ho
  const handleVocabSearch = (searchWord) => {
    setWord(searchWord);
    handleSearch(searchWord);
  };

  return (
    <div className="w-full max-w-4xl mx-auto overflow-x-hidden bg-(--card) text-(--foreground) rounded-xl shadow-lg py-4 sm:py-6 mb-2 border border-(--border)">
      {/* Toggle Tabs */}

<TabBar
  activeView={activeView}
  setActiveView={setActiveView}
  savedWords={savedWords}
/>
      <div className="my-6 sm:my-10 lg:my-15">
        {/* ── DICTIONARY VIEW ── */}
        {activeView === "dictionary" && (
          <>
            <SearchBar
              word={word}
              setWord={setWord}
              loading={loading}
              onSearch={handleSearch}
            />

            {!results && !loading && !error && (
              <>
                <DailyWord onSearch={handleVocabSearch} />
                <ExplorePage />
              </>
            )}

            {error && (
              <p className="text-red-500 mb-4 px-4 sm:px-6 text-sm sm:text-base">
                Error: {error}
              </p>
            )}

            {loading && (
              <p className="text-blue-500 mb-4 px-4 sm:px-6 text-sm sm:text-base">
                Loading...
              </p>
            )}

            {results && (
              <>
                <ResultHeader
                  word={word}
                  onSpeak={speakWord}
                  onLearn={addWord}
                  isWordSaved={isWordSaved(word)}
                  phonetic={
                    results.dict[0]?.phonetics?.find((p) => p.text)?.text ||
                    null
                  }
                />
                <div className="px-4 sm:px-6 mb-4">
                  <CollectionPicker
                    word={word}
                    collections={collections}
                    wordMap={wordMap}
                    onAdd={addToCollection}
                    onRemove={removeFromCollection}
                  />
                </div>

                <div className="px-4 sm:px-6">
                  <MeaningCard entry={results.dict[0]} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-6 sm:mt-8 px-4 sm:px-6">
                  <Synonyms
                    data={results.syn}
                    setWord={setWord}
                    onSearch={handleSearch}
                  />
                  <Antonyms
                    data={results.ant}
                    setWord={setWord}
                    onSearch={handleSearch}
                  />
                </div>
                {/* Synonym Explorer Graph */}
                <div className="px-4 sm:px-6 mt-4">
                  <SynonymExplorer
                    word={word}
                    synData={results.syn}
                    antData={results.ant}
                    onSearch={(w) => {
                      setWord(w);
                      handleSearch(w);
                    }}
                  />
                </div>

                <div className="flex justify-end mb-4 py-4 px-4 sm:px-6">
                  <button
                    onClick={handleRefresh}
                    className="px-4 py-2 rounded-lg bg-(--primary) text-white font-semibold cursor-pointer transition text-sm sm:text-base"
                  >
                    Refresh
                  </button>
                </div>
              </>
            )}
          </>
        )}


{/* ── SYNONYMS VIEW ── */}
{/* {activeView === "synonyms" && (
  <>
    {!results ? (
      <div className="flex flex-col items-center justify-center gap-3 py-16 px-4 text-(--muted-foreground)">
        <Layers size={36} className="text-(--primary)" />
        <p className="text-sm font-medium text-(--foreground)">No word searched yet!</p>
        <p className="text-xs text-center">Search a word first to explore synonyms.</p>
      </div>
    ) : (
      <>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 px-4 sm:px-6 mt-4">
          <Synonyms
            data={results.syn}
            setWord={setWord}
            onSearch={handleSearch}
          />
          <Antonyms
            data={results.ant}
            setWord={setWord}
            onSearch={handleSearch}
          />
        </div>
        <div className="px-4 sm:px-6 mt-4">
          <SynonymExplorer
            word={word}
            synData={results.syn}
            antData={results.ant}
            onSearch={(w) => {
              setWord(w);
              handleSearch(w);
            }}
          />
        </div>
      </>
    )}
  </>
)} */}

        {activeView === "vocab" && (
          <>

          <ProgressDashboard savedWords={savedWords} />

            <VocabList
              savedWords={savedWords}
              onRemove={removeWord}
              onStatusChange={updateStatus}
              onSearch={handleVocabSearch}
            />
            <CollectionsView
              collections={collections}
              wordMap={wordMap}
              onRemoveFromCollection={removeFromCollection}
              onDeleteCollection={deleteCollection}
              onSearch={handleVocabSearch}
            />

          </>
        )}
 {/* // Quiz view  */}
{activeView === "quiz" && (
  <QuizTab
    results={results}
    word={word}
    savedWords={savedWords}
  />
)}
      </div>
    </div>
  );
}
