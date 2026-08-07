"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Search, Brain, Play, Save, Trash2,
  Settings, ChevronRight, ChevronLeft, Download,
  Upload, X, RefreshCcw, BarChart2, Edit3, Sparkles, BookOpen, Zap, Timer
} from "lucide-react";
import { loadDecks, saveDecks, exportDecks } from "../utils/storage";
import { filterCards, sortCards } from "../utils/study-logic";

// Sub-components (Will be defined below or in separate files)
import DeckSidebar from "../components/DeckSidebar";
import CardEditor from "../components/CardEditor";
import AIParserPanel from "../components/AIParserPanel";
import StudyInterface from "../components/StudyInterface";
import StatsPanel from "../components/StatsPanel";
import Features from "../components/Features";

export default function FlashcardMaker() {
  const [decks, setDecks] = useState([]);
  const [activeDeckId, setActiveDeckId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isAIPanelOpen, setIsAIPanelOpen] = useState(false);
  const [studyMode, setStudyMode] = useState("none"); // none, review, quiz, rapid
  const [editingCard, setEditingCard] = useState(null);

  // Initialize
  useEffect(() => {
    const loaded = loadDecks();
    setDecks(loaded);
    if (loaded.length > 0) setActiveDeckId(loaded[0].id);
  }, []);

  // Persistence
  useEffect(() => {
    if (decks.length > 0) saveDecks(decks);
  }, [decks]);

  const activeDeck = useMemo(() =>
    decks.find(d => d.id === activeDeckId) || null
  , [decks, activeDeckId]);

  const filteredCards = useMemo(() => {
    if (!activeDeck) return [];
    let filtered = filterCards(activeDeck.cards, searchQuery);
    return sortCards(filtered, sortBy);
  }, [activeDeck, searchQuery, sortBy]);

  // Handlers
  const handleAddDeck = (name) => {
    const newDeck = {
      id: Math.random().toString(36).substr(2, 9),
      name: name || "New Deck",
      cards: [],
      createdAt: new Date().toISOString()
    };
    setDecks([...decks, newDeck]);
    setActiveDeckId(newDeck.id);
  };

  const handleUpdateDeck = (id, updates) => {
    setDecks(decks.map(d => d.id === id ? { ...d, ...updates } : d));
  };

  const handleDeleteDeck = (id) => {
    const newDecks = decks.filter(d => d.id !== id);
    setDecks(newDecks);
    if (activeDeckId === id && newDecks.length > 0) setActiveDeckId(newDecks[0].id);
  };

  const handleAddCard = (card) => {
    if (!activeDeck) return;
    const newCard = {
      ...card,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
    };
    handleUpdateDeck(activeDeckId, {
      cards: [newCard, ...activeDeck.cards]
    });
    setIsEditorOpen(false);
  };

  const handleUpdateCard = (updatedCard) => {
    if (!activeDeck) return;
    handleUpdateDeck(activeDeckId, {
      cards: activeDeck.cards.map(c => c.id === updatedCard.id ? updatedCard : c)
    });
    setEditingCard(null);
    setIsEditorOpen(false);
  };

  const handleDeleteCard = (cardId) => {
    if (!activeDeck) return;
    if (window.confirm("Are you sure you want to delete this card?")) {
      handleUpdateDeck(activeDeckId, {
        cards: activeDeck.cards.filter(c => c.id !== cardId)
      });
    }
  };

  const handleAIImport = (newCards) => {
    if (!activeDeck) return;
    handleUpdateDeck(activeDeckId, {
      cards: [...newCards, ...activeDeck.cards]
    });
    setIsAIPanelOpen(false);
  };

  const sanitizeImportedCard = (card) => {
    if (!card || typeof card !== "object") return null;
    return {
      id: typeof card.id === "string" || typeof card.id === "number"
        ? card.id
        : Math.random().toString(36).substr(2, 9),
      front: typeof card.front === "string" ? card.front : "",
      back: typeof card.back === "string" ? card.back : "",
      difficulty: ["easy", "medium", "hard"].includes(card.difficulty) ? card.difficulty : "medium",
      createdAt: typeof card.createdAt === "string" ? card.createdAt : new Date().toISOString()
    };
  };

  const sanitizeImportedDeck = (deck) => {
    if (!deck || typeof deck !== "object") return null;
    if (typeof deck.name !== "string" || !Array.isArray(deck.cards)) return null;
    const validId = typeof deck.id === "string" || typeof deck.id === "number";
    return {
      id: validId ? deck.id : Math.random().toString(36).substr(2, 9),
      name: deck.name,
      cards: deck.cards.map(sanitizeImportedCard).filter(Boolean),
      createdAt: typeof deck.createdAt === "string" ? deck.createdAt : new Date().toISOString()
    };
  };

  const handleImportDecks = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (re) => {
      try {
        const imported = JSON.parse(re.target.result);
        if (!Array.isArray(imported)) {
          alert("Invalid file: expected a JSON array of decks.");
          return;
        }
        const validDecks = imported.map(sanitizeImportedDeck).filter(Boolean);
        if (validDecks.length === 0) {
          alert("Invalid file: no valid decks found (each deck needs a name and a cards array).");
          return;
        }
        const confirmed = window.confirm(
          `Import ${validDecks.length} deck(s)? This will replace all ${decks.length} existing deck(s) and cannot be undone.`
        );
        if (!confirmed) return;
        setDecks(validDecks);
        setActiveDeckId(validDecks[0].id);
      } catch (err) {
        alert("Invalid file");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="px-4 py-8 bg-(--background) min-h-screen text-(--foreground)">
      {/* Platform Standard Header */}
      <div className="text-center mb-10 space-y-2">
        <h1 className="heading text-4xl sm:text-5xl">Flashcard Maker</h1>
        <p className="description text-base text-(--secondary-foreground) max-w-2xl mx-auto">
          Create, organize, and study with AI-assisted active recall.
        </p>
      </div>

      <div className="max-w-7xl mx-auto bg-(--card) rounded-2xl shadow-lg overflow-hidden border border-(--border)">

        <div className="p-6 space-y-8">

          {/* Deck Selection & Management */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4 space-y-6">
              <DeckSidebar
                decks={decks}
                activeDeckId={activeDeckId}
                onSelect={setActiveDeckId}
                onAdd={handleAddDeck}
                onDelete={handleDeleteDeck}
                onUpdate={handleUpdateDeck}
              />
              <StatsPanel deck={activeDeck} />

              <div className="bg-(--background) p-5 rounded-xl border border-(--border) shadow-sm space-y-4">
                <h3 className="font-bold text-sm flex items-center gap-2">
                  <Download className="w-4 h-4 text-blue-600" />
                  Data Backup
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => exportDecks(decks)}
                    className="flex-1 py-2 bg-(--primary) text-white rounded-lg text-[11px] font-bold hover:opacity-90 transition-all"
                  >
                    Export JSON
                  </button>
                  <label className="flex-1 py-2 bg-(--muted) text-(--foreground) rounded-lg text-sm font-bold text-center cursor-pointer border border-(--border) hover:bg-(--card-hover-bg)">
                    Import
                    <input
                      type="file"
                      className="hidden"
                      accept=".json"
                      onChange={(e) => {
                        handleImportDecks(e.target.files[0]);
                        e.target.value = "";
                      }}
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Main Workspace */}
            <div className="lg:col-span-8 space-y-6">

              {/* Study Modes */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StudyModeButton
                  title="Review"
                  desc="Recall cards"
                  icon={<Play className="w-4 h-4" />}
                  color="bg-blue-600"
                  onClick={() => setStudyMode('review')}
                  disabled={!activeDeck?.cards.length}
                />
                <StudyModeButton
                  title="Quiz"
                  desc="Type answer"
                  icon={<Edit3 className="w-4 h-4" />}
                  color="bg-purple-600"
                  onClick={() => setStudyMode('quiz')}
                  disabled={!activeDeck?.cards.length}
                />
                <StudyModeButton
                  title="Rapid"
                  desc="Timed test"
                  icon={<Timer className="w-4 h-4" />}
                  color="bg-orange-600"
                  onClick={() => setStudyMode('rapid')}
                  disabled={!activeDeck?.cards.length}
                />
              </div>

              {/* Card List Area */}
              <div className="bg-(--background) rounded-xl border border-(--border) shadow-sm flex flex-col min-h-[500px]">
                <div className="p-5 border-b border-(--border) flex flex-wrap gap-4 justify-between items-center bg-(--card)/50">
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-(--muted-foreground)" />
                    <input
                      type="text"
                      placeholder="Search cards..."
                      className="w-full pl-10 pr-4 py-2 bg-(--background) border border-(--border) rounded-lg outline-none focus:ring-1 focus:ring-(--primary) text-sm"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  <div className="flex flex-wrap gap-2 w-full sm:w-auto shrink-0">
                    <button
                      onClick={() => setIsEditorOpen(true)}
                      disabled={!activeDeck}
                      className="flex-1 sm:flex-none px-3 py-1.5 bg-(--primary) text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 disabled:opacity-50 whitespace-nowrap"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Card
                    </button>
                  </div>
                </div>

                <div className="p-5 flex-1">
                  {activeDeck ? (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center px-2">
                        <h2 className="text-xl font-bold text-(--primary)">{activeDeck.name}</h2>
                        <span className="text-xs font-bold text-(--muted-foreground)">{filteredCards.length} Cards</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {filteredCards.map(card => (
                          <div key={card.id} className="bg-(--card) p-4 rounded-xl border border-(--border) hover:border-(--primary) transition-all group relative">
                            <div className="flex justify-between items-start mb-2">
                               <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                 card.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                                 card.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                 'bg-red-100 text-red-700'
                               }`}>
                                 {card.difficulty}
                               </span>
                               <div className="flex gap-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                                  <button onClick={() => { setEditingCard(card); setIsEditorOpen(true); }} className="p-2 hover:text-(--primary) rounded-md hover:bg-(--card-hover-bg)" title="Edit"><Edit3 className="w-4 h-4" /></button>
                                  <button onClick={() => handleDeleteCard(card.id)} className="p-2 hover:text-red-500 rounded-md hover:bg-red-50" title="Delete"><Trash2 className="w-4 h-4" /></button>
                               </div>
                            </div>
                            <p className="font-bold text-sm mb-1">{card.front}</p>
                            <p className="text-xs text-(--muted-foreground) line-clamp-2">{card.back}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center py-20 text-(--muted-foreground)">
                      <BookOpen className="w-12 h-12 mb-4 opacity-20" />
                      <p className="text-lg font-bold">Select a deck to start managing cards</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Features />

      <AnimatePresence>
        {isEditorOpen && (
          <CardEditor
            card={editingCard}
            onSave={editingCard ? handleUpdateCard : handleAddCard}
            onClose={() => { setIsEditorOpen(false); setEditingCard(null); }}
          />
        )}
        {isAIPanelOpen && (
          <AIParserPanel onImport={handleAIImport} onClose={() => setIsAIPanelOpen(false)} />
        )}
        {studyMode !== 'none' && (
          <StudyInterface deck={activeDeck} mode={studyMode} onClose={() => setStudyMode('none')} />
        )}
      </AnimatePresence>
    </div>
  );
}

function StudyModeButton({ title, desc, icon, color, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex flex-col items-center gap-2 p-4 rounded-lg border border-(--border) bg-(--background) hover:bg-(--card-hover-bg) transition-all text-center ${disabled ? 'opacity-50 cursor-not-allowed' : 'shadow-sm active:scale-95'}`}
    >
      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${color} shadow-sm`}>
        {icon}
      </div>
      <div>
        <h3 className="font-bold text-sm">{title}</h3>
        <p className="text-[10px] text-(--muted-foreground)">{desc}</p>
      </div>
    </button>
  );
}
