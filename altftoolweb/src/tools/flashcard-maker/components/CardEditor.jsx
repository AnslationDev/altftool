import { useState } from "react";
import { X, Save } from "lucide-react";
import { motion } from "framer-motion";

export default function CardEditor({ card, onSave, onClose }) {
  const [front, setFront] = useState(card?.front || "");
  const [back, setBack] = useState(card?.back || "");
  const [difficulty, setDifficulty] = useState(card?.difficulty || "medium");

  const handleSave = (e) => {
    e.preventDefault();
    if (front.trim() && back.trim()) {
      onSave({ front, back, difficulty });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-2xl bg-(--card) rounded-2xl border border-(--border) shadow-xl overflow-hidden flex flex-col max-h-[85vh]"
      >
        <div className="p-4 border-b border-(--border) flex justify-between items-center bg-(--background)">
          <h2 className="font-bold text-lg text-(--primary)">
            {card ? 'Edit Card' : 'New Flashcard'}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-(--card-hover-bg) rounded-xl transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-(--muted-foreground)">Front Side</label>
            <textarea
              autoFocus
              rows={3}
              placeholder="Question or concept..."
              className="w-full p-3 bg-(--background) border border-(--border) rounded-xl outline-none focus:ring-1 focus:ring-(--primary) transition-all text-sm font-medium resize-none"
              value={front}
              onChange={(e) => setFront(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-(--muted-foreground)">Back Side</label>
            <textarea
              rows={4}
              placeholder="Answer or definition..."
              className="w-full p-3 bg-(--background) border border-(--border) rounded-xl outline-none focus:ring-1 focus:ring-(--primary) transition-all text-sm font-medium resize-none"
              value={back}
              onChange={(e) => setBack(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-(--muted-foreground)">Difficulty</label>
            <div className="grid grid-cols-3 gap-2">
               {['easy', 'medium', 'hard'].map(d => (
                 <button
                  key={d}
                  type="button"
                  onClick={() => setDifficulty(d)}
                  className={`py-2 rounded-lg font-bold uppercase text-[10px] transition-all border ${
                    difficulty === d
                    ? 'bg-(--primary) text-white border-(--primary) shadow-sm'
                    : 'bg-(--background) border-(--border) text-(--muted-foreground) hover:border-(--primary)'
                  }`}
                 >
                   {d}
                 </button>
               ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={!front.trim() || !back.trim()}
            className="w-full py-3 bg-(--primary) text-white rounded-lg font-bold shadow-md hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>Save Card</span>
          </button>
        </form>
      </motion.div>
    </div>
  );
}
