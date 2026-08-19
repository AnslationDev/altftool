import { useState, useEffect, useRef } from "react";
import { X, Sparkles, Wand2, Info, RefreshCcw, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { parseAIGeneratedCards } from "../utils/ai-parser";

export default function AIParserPanel({ onImport, onClose }) {
  const [text, setText] = useState("");
  const [previewCards, setPreviewCards] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleGenerate = () => {
    setIsGenerating(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      const cards = parseAIGeneratedCards(text);
      setPreviewCards(cards);
      setIsGenerating(false);
      timeoutRef.current = null;
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-2xl bg-(--card) rounded-xl border border-(--border) shadow-xl overflow-hidden flex flex-col max-h-[85vh]"
      >
        <div className="p-4 border-b border-(--border) flex justify-between items-center bg-(--background)">
          <div className="flex items-center gap-3 text-(--primary)">
            <Sparkles className="w-5 h-5" />
            <h2 className="font-bold text-lg">AI Card Generator</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-(--card-hover-bg) rounded-md transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto no-scrollbar flex-1 space-y-6">
          {!previewCards.length ? (
            <div className="space-y-4">
              <div className="bg-blue-50 text-blue-700 p-4 rounded-lg flex gap-3 text-sm border border-blue-100">
                <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p>Paste your notes below. The AI will extract key concepts and create flashcards automatically.</p>
              </div>

              <textarea
                rows={10}
                placeholder="Example: The heart is a muscular organ that pumps blood..."
                className="w-full p-4 bg-(--background) border border-(--border) rounded-lg outline-none focus:ring-2 focus:ring-(--primary)/20 focus:border-(--primary) transition-all text-sm font-medium resize-none"
                value={text}
                onChange={(e) => setText(e.target.value)}
              />

              <button
                onClick={handleGenerate}
                disabled={!text.trim() || isGenerating}
                className="w-full py-3 bg-(--primary) text-white rounded-lg font-bold shadow-md hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isGenerating ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                <span>{isGenerating ? 'Generating...' : 'Generate Flashcards'}</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center px-1">
                <h3 className="font-bold text-(--primary)">Preview ({previewCards.length} Cards)</h3>
                <button onClick={() => setPreviewCards([])} className="text-xs font-bold text-blue-600 hover:underline">Start Over</button>
              </div>

              <div className="space-y-3">
                {previewCards.map((card, i) => (
                  <div key={card.id} className="p-3 bg-(--background) border border-(--border) rounded-lg text-sm">
                    <p className="font-bold text-(--foreground) mb-1">{card.front}</p>
                    <p className="text-(--muted-foreground)">{card.back}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {previewCards.length > 0 && (
          <div className="p-4 bg-(--background) border-t border-(--border) flex gap-3">
            <button
              onClick={() => onImport(previewCards)}
              className="w-full py-3 bg-(--primary) text-white rounded-lg font-bold shadow-md hover:opacity-90 transition-all flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>Import to Deck</span>
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
