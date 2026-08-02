import { useState } from "react";
import { Plus, Folder, Trash2, Edit3, Check, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function DeckSidebar({ decks, activeDeckId, onSelect, onAdd, onDelete, onUpdate }) {
  const [isAdding, setIsAdding] = useState(false);
  const [newDeckName, setNewDeckName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");

  const handleAdd = () => {
    if (newDeckName.trim()) {
      onAdd(newDeckName);
      setNewDeckName("");
      setIsAdding(false);
    }
  };

  const startEdit = (e, deck) => {
    e.stopPropagation();
    setEditingId(deck.id);
    setEditingName(deck.name);
  };

  const handleUpdate = () => {
    if (editingName.trim()) {
      onUpdate(editingId, { name: editingName });
      setEditingId(null);
    }
  };

  return (
    <div className="bg-(--background) rounded-xl border border-(--border) shadow-sm overflow-hidden flex flex-col">
      <div className="p-4 border-b border-(--border) flex justify-between items-center bg-(--card)/50">
        <h2 className="font-bold text-sm uppercase tracking-widest text-(--secondary)">Decks</h2>
        <button
          onClick={() => setIsAdding(true)}
          className="p-1.5 hover:bg-(--card-hover-bg) rounded-xl transition-colors text-(--primary)"
          title="New Deck"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto max-h-[300px] no-scrollbar">
        <AnimatePresence>
          {isAdding && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="p-4 bg-(--card) border-b border-(--border) space-y-3"
            >
              <input
                autoFocus
                type="text"
                placeholder="Deck name..."
                className="w-full px-3 py-2 bg-(--background) border border-(--border) rounded-xl outline-none text-sm"
                value={newDeckName}
                onChange={(e) => setNewDeckName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              />
              <div className="flex gap-2">
                <button onClick={handleAdd} className="flex-1 py-1.5 bg-(--primary) text-white rounded-lg text-xs font-bold">Add</button>
                <button onClick={() => setIsAdding(false)} className="flex-1 py-1.5 bg-(--muted) text-(--foreground) rounded-lg text-xs font-bold border border-(--border)">Cancel</button>
              </div>
            </motion.div>
          )}

          {decks.map(deck => (
            <motion.div
              key={deck.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`group flex items-center justify-between p-3 cursor-pointer border-b border-(--border)/50 transition-all ${
                activeDeckId === deck.id
                ? 'bg-(--primary) text-white'
                : 'hover:bg-(--card-hover-bg) text-(--foreground)'
              }`}
              onClick={() => onSelect(deck.id)}
            >
              <div className="flex items-center gap-3 overflow-hidden flex-1">
                <Folder className={`w-4 h-4 flex-shrink-0 ${activeDeckId === deck.id ? 'text-white' : 'text-blue-500'}`} />
                {editingId === deck.id ? (
                  <div className="flex items-center gap-1 w-full" onClick={(e) => e.stopPropagation()}>
                    <input
                      autoFocus
                      className="bg-transparent border-b border-white outline-none text-sm font-medium w-full min-w-0"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleUpdate();
                        if (e.key === 'Escape') setEditingId(null);
                      }}
                      onBlur={() => setEditingId(null)}
                    />
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={handleUpdate}
                      className={`p-1 rounded hover:bg-black/10 transition-colors flex-shrink-0 ${activeDeckId === deck.id ? 'text-white' : 'text-green-600'}`}
                      title="Save name"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => setEditingId(null)}
                      className={`p-1 rounded hover:bg-black/10 transition-colors flex-shrink-0 ${activeDeckId === deck.id ? 'text-white' : 'text-gray-400'}`}
                      title="Cancel"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col">
                    <span className="text-sm font-medium truncate">{deck.name}</span>
                    <span className={`text-[10px] ${activeDeckId === deck.id ? 'text-blue-100' : 'text-(--muted-foreground)'}`}>
                      {deck.cards.length} cards
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => startEdit(e, deck)}
                  className={`p-1 rounded hover:bg-black/10 transition-colors ${activeDeckId === deck.id ? 'text-white' : 'text-gray-400'}`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm("Delete this deck and all its cards?")) onDelete(deck.id);
                  }}
                  className={`p-2 rounded-md hover:bg-red-500/20 hover:text-red-500 transition-colors ${activeDeckId === deck.id ? 'text-white' : 'text-gray-400'}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
