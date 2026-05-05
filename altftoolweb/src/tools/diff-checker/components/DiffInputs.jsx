// src/components/DiffChecker/DiffInputs.jsx
import { Copy } from "lucide-react";
import {useState} from "react";
import DiffModeToggle from "./DiffModeToggle";

const DiffInputs = ({
  originalText,
  setOriginalText,
  modifiedText,
  setModifiedText,
}) => {
  const handleCopy = (text) => navigator.clipboard.writeText(text);

  const [mode, setMode] = useState("line");

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <div>
        <label className="block content mb-2">
          Original Text
        </label>
        <textarea
          value={originalText}
          onChange={(e) => setOriginalText(e.target.value)}
          placeholder="Paste original content here..."
          className="w-full h-48 p-3 border border-(--border) rounded-lg  font-mono text-sm"
        />
        <button
          onClick={() => handleCopy(originalText)}
          className="mt-2 text-sm text-(--primary) flex items-center gap-1 cursor-pointer"
        >
          <Copy className="w-4 h-4" /> Copy
        </button>
      </div>

      <div>
        <label className="block content mb-2">
          Modified Text
        </label>
        <textarea
          value={modifiedText}
          onChange={(e) => setModifiedText(e.target.value)}
          placeholder="Paste modified content here..."
          className="w-full h-48 p-3 border border-(--border) rounded-lg font-mono text-sm"
        />
        <button
          onClick={() => handleCopy(modifiedText)}
          className="mt-2 text-sm text-(--primary) flex items-center gap-1 cursor-pointer"
        >
          <Copy className="w-4 h-4" /> Copy
        </button>
      </div>
    </div>
  );
};

export default DiffInputs;
