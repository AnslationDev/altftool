import { useState } from "react";
import { BookOpen, ChevronDown, ChevronUp } from "lucide-react";

// Dictionary API ke entry se examples extract karo
function extractExamples(entry) {
  const examples = [];

  entry.meanings.forEach((meaning) => {
    meaning.definitions.forEach((def) => {
      if (def.example) examples.push(def.example);
    });
  });

  return examples;
}

// Datamuse se aur sentences fetch karo
async function fetchMoreExamples(word) {
  try {
    const res = await fetch(
      `https://api.datamuse.com/words?ml=${word}&max=10`
    );
    const data = await res.json();

    // datamuse tags mein se sentences dhundho
    const sentences = data
      .filter((item) => item.tags && item.tags.includes("syn"))
      .map((item) => `${word} is similar to ${item.word}.`);

    return sentences.slice(0, 3);
  } catch {
    return [];
  }
}

// Word ko sentence mein highlight karo
function HighlightedSentence({ sentence, word }) {
  const parts = sentence.split(new RegExp(`(${word})`, "gi"));

  return (
    <p className="text-sm leading-relaxed text-(--foreground)">
      {parts.map((part, i) =>
        part.toLowerCase() === word.toLowerCase() ? (
          <span key={i} className="font-bold text-(--primary) bg-(--muted) px-0.5 rounded">
            {part}
          </span>
        ) : (
          part
        )
      )}
    </p>
  );
}

export default function ExampleSentences({ entry, word }) {
  const [expanded, setExpanded] = useState(false);
  const [extraExamples, setExtraExamples] = useState([]);
  const [loading, setLoading] = useState(false);

  // dictionary API se examples
  const localExamples = extractExamples(entry);

  const handleToggle = async () => {
    if (!expanded && extraExamples.length === 0) {
      setLoading(true);
      const more = await fetchMoreExamples(word);
      setExtraExamples(more);
      setLoading(false);
    }
    setExpanded((prev) => !prev);
  };

  // dono sources combine karo — max 5
  const allExamples = [...localExamples, ...extraExamples].slice(0, 5);

  return (
    <div className="mt-3 border-t border-(--border) pt-3">

      {/* Toggle button */}
      <button
        onClick={handleToggle}
        className="flex items-center gap-2 text-sm font-medium text-(--primary) cursor-pointer hover:opacity-80 transition"
      >
        <BookOpen size={15} />
        Example Sentences
        {expanded
          ? <ChevronUp size={15} />
          : <ChevronDown size={15} />
        }
        {/* count badge */}
        {/* {localExamples.length > 0 && (
          <span className="text-xs bg-(--muted) text-(--muted-foreground) px-1.5 py-0.5 rounded-full">
            {localExamples.length}
          </span>
        )} */}
      </button>

      {/* Content */}
      {expanded && (
        <div className="mt-3 flex flex-col gap-3">

          {loading && (
            <p className="text-xs text-(--muted-foreground) italic">
              Loading examples...
            </p>
          )}

          {allExamples.length === 0 && !loading && (
            <p className="text-xs text-(--muted-foreground) italic">
              No examples found for this word.
            </p>
          )}

          {allExamples.map((sentence, i) => (
            <div
              key={i}
              className="flex gap-2 p-3 bg-(--muted) rounded-lg border-l-2 border-(--primary)"
            >
              {/* Sentence number */}
              <span className="text-xs font-bold text-(--primary) mt-0.5 shrink-0">
                {i + 1}.
              </span>
              {/* Highlighted sentence */}
              <HighlightedSentence sentence={sentence} word={word} />
            </div>
          ))}

        </div>
      )}
    </div>
  );
}