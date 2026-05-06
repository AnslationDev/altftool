import { useState } from "react";
import { Shapes, ChevronDown, ChevronUp } from "lucide-react";
import ExampleSentences from "./ExampleSentences.jsx";

// Language config
const languages = [
  { code: "en|hi", label: "Hindi",   flag: "🇮🇳", color: "text-orange-600" },
  { code: "en|es", label: "Spanish", flag: "🇪🇸", color: "text-red-600"    },
  { code: "en|fr", label: "French",  flag: "🇫🇷", color: "text-blue-600"   },
];

async function translateText(text, langCode) {
  try {
    const res = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${langCode}`
    );
    const data = await res.json();
    return data?.responseData?.translatedText || null;
  } catch {
    return null;
  }
}

function DefinitionRow({ definition }) {
  const [translations, setTranslations] = useState({}); // { "en|hi": "...", "en|es": "..." }
  const [loadingLang, setLoadingLang] = useState(null);
  const [activeLang, setActiveLang] = useState(null);  // currently shown language

  const handleLangClick = async (langCode) => {
    // same language click — toggle off
    if (activeLang === langCode) {
      setActiveLang(null);
      return;
    }

    // already translated — just show
    if (translations[langCode]) {
      setActiveLang(langCode);
      return;
    }

    // fetch translation — cache karo
    setLoadingLang(langCode);
    const result = await translateText(definition, langCode);
    setTranslations((prev) => ({ ...prev, [langCode]: result }));
    setLoadingLang(null);
    setActiveLang(langCode);
  };

  const activeLangConfig = languages.find((l) => l.code === activeLang);

  return (
    <div className="mb-2 pl-2 sm:pl-3 border-l-2 border-(--border)">
      {/* Definition text */}
      <p className="text-sm sm:text-base leading-relaxed">{definition}</p>

      {/* Translation result */}
      {activeLang && translations[activeLang] && (
        <p className={`text-sm leading-relaxed mt-1 font-medium ${activeLangConfig?.color}`}>
          {activeLangConfig?.flag} {translations[activeLang]}
        </p>
      )}

      {/* Loading */}
      {loadingLang && (
        <p className="text-xs text-(--muted-foreground) mt-1 italic">
          Translating...
        </p>
      )}

      {/* Language buttons */}
      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => handleLangClick(lang.code)}
            disabled={loadingLang !== null}
            className={`text-xs px-2 py-0.5 rounded-full border transition cursor-pointer
              ${activeLang === lang.code
                ? "bg-(--primary) text-white border-(--primary)"
                : "border-(--border) text-(--muted-foreground) hover:text-(--foreground)"
              }`}
          >
            {lang.flag} {lang.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// WordFormsSection same rahega
function WordFormsSection({ entry }) {
  const [showAll, setShowAll] = useState(false);
  const forms = [];

  entry.meanings.forEach((meaning) => {
    const pos = meaning.partOfSpeech;
    const w = entry.word;

    if (pos === "verb") {
      forms.push(
        { label: "Present",             word: w },
        { label: "Present participle",  word: w.endsWith("e") ? w.slice(0, -1) + "ing" : w + "ing" },
        { label: "Past tense",          word: w.endsWith("e") ? w + "d" : w + "ed" },
        { label: "Third person",        word: w + "s" },
      );
    }
    if (pos === "noun") {
      forms.push(
        { label: "Singular", word: w },
        { label: "Plural",   word: w.endsWith("s") || w.endsWith("x") ? w + "es" : w + "s" },
      );
    }
    if (pos === "adjective") {
      forms.push(
        { label: "Base",        word: w },
        { label: "Comparative", word: w + "er" },
        { label: "Superlative", word: w + "est" },
      );
    }
  });

  const unique = forms.filter(
    (f, idx, self) => idx === self.findIndex((t) => t.label === f.label)
  );

  if (unique.length === 0) return null;

  const visibleForms = showAll ? unique : unique.slice(0, 2);

  return (
    <div className="mt-4 border-t border-(--border) pt-3">
      <p className="text-xs font-medium text-(--muted-foreground) mb-2 flex items-center gap-1">
        <Shapes size={13} />
        Word Forms
      </p>
      <div className="flex flex-wrap gap-2">
        {visibleForms.map((f, i) => (
          <div key={i} className="flex items-center gap-1.5 bg-(--muted) px-2 py-1 rounded-md">
            <span className="text-xs text-(--muted-foreground)">{f.label}:</span>
            <span className="text-xs font-semibold text-(--foreground)">{f.word}</span>
          </div>
        ))}
        {unique.length > 2 && (
          <button
            onClick={() => setShowAll((prev) => !prev)}
            className="text-xs text-(--primary) hover:opacity-80 cursor-pointer transition underline px-1"
          >
            {showAll ? "See less" : `See more (${unique.length - 2} more)`}
          </button>
        )}
      </div>
    </div>
  );
}

export default function MeaningCard({ entry }) {
  const [showAllDefs, setShowAllDefs] = useState(false);

  if (!entry || !entry.meanings) return null;

  const totalDefs = entry.meanings.reduce(
    (acc, m) => acc + m.definitions.length, 0
  );

  return (
    <div className="p-4 sm:p-5 bg-(--background) text-(--foreground) rounded-lg shadow mb-4 border border-(--border) w-full">
      {entry.meanings.map((meaning, idx) => {
        const visibleDefs = showAllDefs
          ? meaning.definitions
          : meaning.definitions.slice(0, 2);

        return (
          <div key={idx} className="mb-4 last:mb-0">
            <p className="font-semibold text-sm sm:text-base uppercase tracking-wide text-(--primary) mb-2">
              {meaning.partOfSpeech}
            </p>
            {visibleDefs.map((def, i) => (
              <DefinitionRow key={def.definition || i} definition={def.definition} />
            ))}
          </div>
        );
      })}

      {totalDefs > 2 && (
        <button
          onClick={() => setShowAllDefs((prev) => !prev)}
          className="mt-2 text-xs text-(--primary) hover:opacity-80 cursor-pointer transition underline"
        >
          {showAllDefs ? "See less" : "See more"}
        </button>
      )}

      {/* Example Sentences — WordForms se pehle */}
      <ExampleSentences entry={entry} word={entry.word} />

      <WordFormsSection entry={entry} />
    </div>
  );
}
